# Notes & Logs Workflow

1. Add an HTML file under `notes/` (do not overwrite `index.html`).
2. Set page title in `<title>...</title>`.
3. Add date metadata in the head:
   - `<meta name="note-date" content="YYYY-MM-DD" />`
4. Commit and push to `master`.

After push, GitHub Actions will automatically refresh:
- `notes/notes-index.json`
- `notes/notes-index.js`
- `sitemap.xml`
- `robots.txt`

The homepage and `notes/index.html` read the notes index and render items as:
`date + title + link`.
