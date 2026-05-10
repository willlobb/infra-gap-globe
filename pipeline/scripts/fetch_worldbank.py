"""
Fetch income and poverty indicators from the World Bank API.
Uses wbgapi for clean access. Outputs a country-level CSV.
"""
import yaml
import wbgapi as wb
import pandas as pd
from pathlib import Path

CONFIG = yaml.safe_load(open(Path(__file__).parent.parent / "config.yaml"))
OUT_DIR = Path(__file__).parent.parent / CONFIG["raw_dir"]
OUT_DIR.mkdir(parents=True, exist_ok=True)

INDICATORS = CONFIG["worldbank"]["indicators"]
YEAR = CONFIG["worldbank"]["year"]


def fetch_indicator(indicator: str, year: int) -> pd.DataFrame:
    data = wb.data.DataFrame(indicator, time=year, labels=True)
    data = data.reset_index()
    data.columns = ["country_code", "country_name", "value"]
    data["indicator"] = indicator
    return data[data["value"].notna()]


def main():
    frames = []
    for ind in INDICATORS:
        print(f"Fetching {ind}...")
        df = fetch_indicator(ind, YEAR)
        frames.append(df)
        print(f"  {len(df)} countries")

    combined = pd.concat(frames, ignore_index=True)

    pivoted = combined.pivot_table(
        index=["country_code", "country_name"],
        columns="indicator",
        values="value",
    ).reset_index()

    pivoted.columns.name = None
    pivoted = pivoted.rename(columns={
        "NY.GDP.PCAP.PP.KD": "gdp_per_capita_ppp",
        "SI.POV.GINI": "gini",
    })

    # Normalise GDP to 0-1 income index (log scale, robust to outliers)
    import numpy as np
    max_log = np.log(pivoted["gdp_per_capita_ppp"].max())
    pivoted["income_index"] = pivoted["gdp_per_capita_ppp"].apply(
        lambda v: round(np.log(v) / max_log, 4) if pd.notna(v) else None
    )

    out_path = OUT_DIR / "worldbank_income.csv"
    pivoted.to_csv(out_path, index=False)
    print(f"\nSaved {len(pivoted)} rows to {out_path}")


if __name__ == "__main__":
    main()
