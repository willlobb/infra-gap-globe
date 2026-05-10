"""
Fetch cycling and transit infrastructure from OpenStreetMap via Overpass API.
Outputs a GeoJSON of infrastructure points per region defined in config.yaml.
"""
import json
import time
import yaml
import overpy
from pathlib import Path
from tqdm import tqdm

CONFIG = yaml.safe_load(open(Path(__file__).parent.parent / "config.yaml"))
OUT_DIR = Path(__file__).parent.parent / CONFIG["raw_dir"]
OUT_DIR.mkdir(parents=True, exist_ok=True)

api = overpy.Overpass()

CYCLING_QUERY = """
[out:json][timeout:120];
(
  way["highway"="cycleway"]({s},{w},{n},{e});
  way["cycleway"="lane"]({s},{w},{n},{e});
  way["cycleway"="track"]({s},{w},{n},{e});
  way["cycleway"="dedicated"]({s},{w},{n},{e});
);
out center;
"""

TRANSIT_QUERY = """
[out:json][timeout:120];
(
  node["public_transport"="stop_position"]({s},{w},{n},{e});
  node["highway"="bus_stop"]({s},{w},{n},{e});
  node["railway"="station"]({s},{w},{n},{e});
  node["railway"="tram_stop"]({s},{w},{n},{e});
);
out;
"""


def fetch_region(region: dict) -> list[dict]:
    w, s, e, n = region["bbox"]
    bounds = dict(s=s, w=w, n=n, e=e)
    features = []

    for label, query_tmpl in [("cycling", CYCLING_QUERY), ("transit", TRANSIT_QUERY)]:
        query = query_tmpl.format(**bounds)
        for attempt in range(3):
            try:
                result = api.query(query)
                break
            except Exception as exc:
                if attempt == 2:
                    print(f"  Failed {label} for {region['name']}: {exc}")
                    result = None
                time.sleep(5 * (attempt + 1))

        if result is None:
            continue

        nodes = list(result.nodes)
        ways = list(result.ways)

        for node in nodes:
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [float(node.lon), float(node.lat)]},
                "properties": {"type": label, "region": region["name"]},
            })
        for way in ways:
            if way.center_lat and way.center_lon:
                features.append({
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [float(way.center_lon), float(way.center_lat)]},
                    "properties": {"type": label, "region": region["name"]},
                })

    return features


def main():
    all_features = []
    for region in tqdm(CONFIG["regions"], desc="Fetching OSM regions"):
        features = fetch_region(region)
        all_features.extend(features)
        print(f"  {region['name']}: {len(features)} features")
        time.sleep(2)

    geojson = {"type": "FeatureCollection", "features": all_features}
    out_path = OUT_DIR / "osm_infrastructure.geojson"
    out_path.write_text(json.dumps(geojson))
    print(f"\nSaved {len(all_features)} features to {out_path}")


if __name__ == "__main__":
    main()
