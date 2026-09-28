"""Convert a paper spreadsheet to data/papers.json.

Usage:
  python scripts/excel_to_json.py papers.xlsx data/papers.json

Expected columns, case-insensitive:
  title, year, venue, category, task, dataset, modality, highlight,
  paper, code, project, dataset_link, tags

The script also accepts common aliases such as Name for title and Paper_Url for paper.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

try:
    import pandas as pd
except ImportError as exc:
    raise SystemExit("Please install pandas and openpyxl first: pip install pandas openpyxl") from exc

ALIASES = {
    "title": ["title", "name", "paper title", "paper", "论文", "论文标题"],
    "year": ["year", "年份"],
    "venue": ["venue", "conference", "journal", "publication", "期刊", "会议"],
    "category": ["category", "type", "主题", "类别"],
    "task": ["task", "任务"],
    "dataset": ["dataset", "datasets", "数据集"],
    "modality": ["modality", "input", "模态"],
    "highlight": ["highlight", "contribution", "main contribution", "主要贡献", "摘要"],
    "paper": ["paper_url", "paper url", "paper link", "url", "link", "论文链接"],
    "code": ["code_url", "code url", "github", "code", "开源地址", "代码"],
    "project": ["project_url", "project url", "project", "homepage", "项目主页"],
    "dataset_link": ["dataset_url", "dataset link", "data url", "数据链接"],
    "tags": ["tags", "keywords", "关键词"],
}


def canonical_columns(columns: list[str]) -> dict[str, str]:
    lower_to_original = {str(c).strip().lower(): c for c in columns}
    result: dict[str, str] = {}
    for canonical, names in ALIASES.items():
        for name in names:
            if name.lower() in lower_to_original:
                result[canonical] = lower_to_original[name.lower()]
                break
    return result


def clean(value) -> str:
    if value is None or (hasattr(value, "isna") and value.isna()):
        return ""
    text = str(value).strip()
    return "" if text.lower() == "nan" else text


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)

    source = Path(sys.argv[1])
    target = Path(sys.argv[2])
    if not source.exists():
        raise SystemExit(f"Input file not found: {source}")

    if source.suffix.lower() in {".xlsx", ".xls"}:
        df = pd.read_excel(source)
    else:
        df = pd.read_csv(source)

    colmap = canonical_columns(list(df.columns))
    if "title" not in colmap:
        raise SystemExit("Cannot find a title column. Add a column named title, Name, or Paper Title.")

    records = []
    for _, row in df.iterrows():
        def get(field: str) -> str:
            col = colmap.get(field)
            return clean(row[col]) if col else ""

        tags = [t.strip() for t in get("tags").replace(";", ",").split(",") if t.strip()]
        year_text = get("year")
        try:
            year = int(float(year_text)) if year_text else ""
        except ValueError:
            year = year_text

        records.append({
            "title": get("title"),
            "year": year,
            "venue": get("venue"),
            "category": get("category") or "Uncategorized",
            "task": get("task"),
            "dataset": get("dataset"),
            "modality": get("modality"),
            "highlight": get("highlight"),
            "tags": tags,
            "links": {
                "paper": get("paper"),
                "code": get("code"),
                "project": get("project"),
                "dataset": get("dataset_link"),
            },
        })

    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(records)} records to {target}")


if __name__ == "__main__":
    main()
