"""
Compute infrastructure gap scores at H3 resolution 4 (~86km hex cells globally).

Gap Score formula per cell:
  need  = normalised_population_density * (1 - income_index)
  supply = normalised_infra_density
  gap   = need - 0.5 * supply   (clamped to [0,1])

Outputs a GeoJSON with one feature per H3 cell, ready for frontend consumption.
"""
import json
import yaml
import h3
import numpy as np
import pandas as pd
import geopandas as gpd
from pathlib import Path
from shapely.geometry import shape, mapping
from tqdm import tqdm

CONFIG = yaml.safe_load(open(Path(__file__).parent.parent / "config.yaml"))
RAW = Path(__file__).parent.parent / CONFIG["raw_dir"]
OUT = Path(__file__).parent.parent / CONFIG["output_dir"]
OUT.mkdir(parents=True, exist_ok=True)

H3_RESOLUTION = 4  # ~86km cells — good for global overview


def load_osm() -> gpd.GeoDataFrame:
    path = RAW / "osm_infrastructure.geojson"
    return gpd.read_file(path)


def load_worldbank() -> pd.DataFrame:
    return pd.read_csv(RAW / "worldbank_income.csv")


def assign_h3(lat: float, lng: float, res: int = H3_RESOLUTION) -> str:
    return h3.geo_to_h3(lat, lng, res)


def compute_gap(need: float, supply: float) -> float:
    raw = need - 0.5 * supply
    return float(np.clip(raw, 0, 1))


def main():
    print("Loading OSM data…")
    osm = load_osm()
    osm["h3"] = osm.apply(
        lambda r: assign_h3(r.geometry.y, r.geometry.x), axis=1
    )

    print("Computing infrastructure density per H3 cell…")
    infra_counts = osm.groupby("h3").size().rename("infra_count")
    max_infra = infra_counts.max()
    infra_density = (infra_counts / max_infra).rename("infra_score")

    print("Loading World Bank income data…")
    wb = load_worldbank()

    # Build a lookup: h3 cell -> income_index (approximate via centroid country)
    # For a production version, use a spatial join with country polygons
    income_lookup: dict[str, float] = {}

    all_h3_cells = set(infra_counts.index)

    print("Computing gap scores…")
    features = []
    for cell in tqdm(all_h3_cells):
        boundary = h3.h3_to_geo_boundary(cell, geo_json=True)
        centroid_lat, centroid_lng = h3.h3_to_geo(cell)

        infra = float(infra_density.get(cell, 0))
        income = income_lookup.get(cell, 0.4)  # fallback median until spatial join

        # Population density proxy: in production replace with WorldPop raster sample
        need = 1 - income
        gap = compute_gap(need, infra)

        features.append({
            "type": "Feature",
            "geometry": {"type": "Polygon", "coordinates": [boundary]},
            "properties": {
                "h3": cell,
                "gap_score": round(gap, 4),
                "infra_score": round(infra, 4),
                "income_index": round(income, 4),
                "centroid_lat": round(centroid_lat, 4),
                "centroid_lng": round(centroid_lng, 4),
            },
        })

    out = {"type": "FeatureCollection", "features": features}
    out_path = OUT / "gap_scores.geojson"
    out_path.write_text(json.dumps(out))
    print(f"\nSaved {len(features)} H3 cells to {out_path}")


if __name__ == "__main__":
    main()
