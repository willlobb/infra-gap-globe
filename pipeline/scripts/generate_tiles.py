"""
Convert processed GeoJSON gap scores to a flat JSON array for the frontend.
For large datasets, swap this for PMTiles generation using tippecanoe.

Usage:
  python generate_tiles.py

Output:
  data/processed/gap_scores_points.json  — flat array for HexagonLayer
"""
import json
from pathlib import Path
import yaml

CONFIG = yaml.safe_load(open(Path(__file__).parent.parent / "config.yaml"))
OUT = Path(__file__).parent.parent / CONFIG["output_dir"]


def geojson_to_points(geojson_path: Path) -> list[dict]:
    fc = json.loads(geojson_path.read_text())
    points = []
    for feat in fc["features"]:
        props = feat["properties"]
        points.append({
            "lng": props["centroid_lng"],
            "lat": props["centroid_lat"],
            "gap_score": props["gap_score"],
            "infra_score": props["infra_score"],
            "income_index": props["income_index"],
        })
    return points


def main():
    geojson_path = OUT / "gap_scores.geojson"
    if not geojson_path.exists():
        print("Run compute_gap_score.py first.")
        return

    points = geojson_to_points(geojson_path)
    out_path = OUT / "gap_scores_points.json"
    out_path.write_text(json.dumps(points))
    print(f"Exported {len(points)} points to {out_path}")
    print("\nFor large datasets, use tippecanoe to generate PMTiles:")
    print("  tippecanoe -o gap_scores.pmtiles -z8 gap_scores.geojson")


if __name__ == "__main__":
    main()
