# benlw.github.io

This repository hosts a static academic homepage. It is used to present selected publications, ongoing research topics, software projects, and short technical notes.

The site is intentionally lightweight: plain HTML/CSS/JavaScript with shared data and renderer scripts, and no framework-dependent build pipeline.

## Scope

- Main homepage sections:
  - About
  - Selected Research
  - Ongoing Research
  - My Projects
  - Notes & Logs
- Section pages:
  - `selected/index.html`
  - `ongoing/index.html`
  - `projects/index.html`
  - `notes/index.html`
- Shared content/rendering:
  - `assets/data/site-data.js` (research, ongoing topics, project metadata)
  - `site-render.js` (navigation and section rendering)

## Repository Layout (Brief)

```text
.
├── index.html
├── styles.css
├── site.js
├── site-render.js
├── assets/
│   ├── data/
│   │   └── site-data.js
│   ├── photo/
│   └── research/
├── selected/
├── ongoing/
├── projects/
├── notes/
│   ├── index.html
│   ├── notes-index.json
│   ├── _template.html
│   └── README.md
├── kids/
└── tools/
    └── build-notes-index.mjs
```

## Notes & Logs Workflow

1. Add a new HTML file under `notes/` (do not overwrite `notes/index.html`).
2. In the `<head>`, define:
   - `<title>Note Title</title>`
   - `<meta name="note-date" content="YYYY-MM-DD" />`
3. Rebuild the index:
   - `node tools/build-notes-index.mjs`
4. The script updates `notes/notes-index.json`; entries are then rendered automatically on the homepage and on `notes/index.html`.

## Local Preview

From the repository root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
