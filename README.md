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
3. Validate the metadata and rebuild the index and sitemap:
   - `node tools/validate-notes.mjs`
   - `node tools/build-notes-index.mjs`
   - `node tools/build-sitemap.mjs`
4. Commit the note to `master`. Including the generated files publishes the note and its index together. Otherwise the workflow builds and commits the indexes after a relevant push. It also checks them every Monday at 03:30 Beijing time.

For branch publishing, the expected Pages source is **Deploy from a branch / master / (root)**. After a new index commit, the workflow checks this setting and requests a Pages build for the updated branch. It does not change repository settings. An unchanged index produces neither a bot commit nor a build request. Other Pages sources need their own deployment process.

The homepage displays the later of its editorial revision date and the latest indexed note's publication date. When revising the homepage, publications, projects or an existing note, update the `time[data-site-updated]` element in `index.html` if the change is significant. Visits and workflow runs do not advance this date.

## Local Preview

From the repository root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
