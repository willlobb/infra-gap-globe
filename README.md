# Infra Gap Globe

An interactive 3D globe that surfaces where cycling and transit infrastructure is missing most — globally, not just in the West.

Most urban mobility tools focus on cities in Europe or North America. This project visualises the gap between infrastructure *need* (population density + income level) and infrastructure *supply* (existing cycling/transit coverage) for cities worldwide — from Dhaka to Lagos to Amsterdam.

![Globe showing 3D columns coloured by infrastructure gap severity](.github/preview.png)

## What it shows

Each column on the globe represents a city. Height and colour indicate the **gap score** — how underserved that population is relative to its need for car-free infrastructure:

| Colour | Gap Score | Meaning |
|--------|-----------|---------|
| Dark red | > 80% | Critical — dense, low-income, almost no infrastructure |
| Orange | 60–80% | High |
| Yellow | 40–60% | Moderate |
| Green | < 20% | Well served |

Toggle the **Existing Infrastructure** layer to see where coverage already exists (blue dots, sized by density).

## Stack

- **Frontend:** React + Vite + Mapbox GL JS (globe projection + fill-extrusion)
- **Data pipeline:** Python — OpenStreetMap Overpass API, WorldPop, World Bank API
- **Tile format:** GeoJSON / PMTiles (static, no tile server needed)

## Getting started

### Frontend

```bash
npm install
cp .env.example .env
# Add your Mapbox token to .env
npm run dev
```

You'll need a free [Mapbox account](https://mapbox.com) for the map tiles.

### Data pipeline

```bash
cd pipeline
pip install -r requirements.txt

python scripts/fetch_osm.py          # Pull cycling/transit from OpenStreetMap
python scripts/fetch_worldbank.py    # Pull income data from World Bank
python scripts/compute_gap_score.py  # Compute gap scores at H3 resolution
python scripts/generate_tiles.py     # Export to JSON / PMTiles
```

Edit `pipeline/config.yaml` to add regions, adjust weights, or change H3 resolution.

## Data sources

| Source | What it provides |
|--------|-----------------|
| [OpenStreetMap](https://www.openstreetmap.org) | Cycling lanes, transit stops |
| [WorldPop](https://www.worldpop.org) | 100m population density rasters |
| [World Bank](https://data.worldbank.org) | GDP per capita PPP, Gini coefficient |
| [GHSL](https://ghsl.jrc.ec.europa.eu) | Global urban boundaries |

## Roadmap

- [ ] Replace sample data with full pipeline output
- [ ] Add WorldPop raster integration for true density scoring
- [ ] Subnational income data for larger countries
- [ ] Time-series slider (infrastructure change over years)
- [ ] Export gap scores as open dataset
