# HSI-CV Survey Companion Website

Companion website for:

**A Comprehensive Survey on Hyperspectral Imaging in Computer Vision**  
Jincheng Li, Qi Bi, Shaodi You, Theo Gevers

This static site is designed for GitHub Pages and contains content extracted and reorganized from the survey manuscript:

- paper title, authors, abstract, and highlights;
- overview and taxonomy figures;
- HSI physics / sensing overview;
- low-level, high-level, and AI-in-HSI taxonomy;
- curated computer-vision HSI dataset table;
- foundation model benchmarking tables for LIB-HSI, FVgNET, and HSICityV2;
- searchable paper / method / dataset resource database;
- compressed PDF link and BibTeX block.

## File structure

```text
.
├── index.html
├── styles.css
├── papers.js
├── data/
│   └── papers.json
├── assets/
│   ├── Extension_0608_compressed.pdf
│   ├── survey_overview.jpg
│   ├── rs_cv_settings.jpg
│   ├── hsi_cv_organization.jpg
│   ├── foundation_models.jpg
│   ├── dataset_examples.jpg
│   ├── class_distribution.jpg
│   ├── taxonomy.svg
│   └── favicon.svg
└── scripts/
    └── excel_to_json.py
```

## Local preview

Run a local static server from the repository root:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Do not open `index.html` by double-clicking if the searchable table does not load, because browser security settings may block `fetch('data/papers.json')` from local files.

## Update the resource database

Edit:

```text
data/papers.json
```

Each entry follows this schema:

```json
{
  "title": "Paper or resource title",
  "year": 2026,
  "venue": "Venue / Dataset / Benchmark",
  "category": "Datasets",
  "task": "Semantic segmentation",
  "dataset": "HSICityV2",
  "modality": "HSI",
  "highlight": "One-sentence summary.",
  "tags": ["dataset", "segmentation"],
  "links": {
    "paper": "",
    "code": "",
    "project": "",
    "dataset": ""
  }
}
```

You can also convert a spreadsheet to JSON:

```bash
python scripts/excel_to_json.py your_papers.xlsx data/papers.json
```

Expected spreadsheet columns include: `title`, `year`, `venue`, `category`, `task`, `dataset`, `modality`, `highlight`, `tags`, `paper`, `code`, `project`, `dataset_link`.

## Deploy on GitHub Pages

1. Create a GitHub repository, for example `HSI-CV-Survey`.
2. Upload all files in this folder to the repository root.
3. Go to `Settings -> Pages`.
4. Select `Deploy from a branch`.
5. Choose `main` and `/root`.
6. The site will be available at:

```text
https://YOUR_USERNAME.github.io/HSI-CV-Survey/
```

## Notes

The original PDF was compressed to `assets/Extension_0608_compressed.pdf` to keep the repository lightweight and GitHub-friendly.
