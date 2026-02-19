# Notes & Logs Workflow

1. Add an HTML file under `notes/` (do not overwrite `index.html`).
2. Set page title in `<title>...</title>`.
3. Add date metadata in the head:
   - `<meta name="note-date" content="YYYY-MM-DD" />`
4. Rebuild the notes index:
   - `node tools/build-notes-index.mjs`

The homepage and `notes/index.html` read `notes/notes-index.json` and render items as:
`date + title + link`.
