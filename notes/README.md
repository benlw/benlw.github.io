# Notes & Logs Workflow

1. Add an HTML file under `notes/` (do not overwrite `index.html`).
2. Set page title in `<title>...</title>`.
3. Add date metadata in the head:
   - `<meta name="note-date" content="YYYY-MM-DD" />`
4. (Optional) Add tags/pin metadata for notes filtering:
   - `<meta name="note-tags" content="tag-a, tag-b" />`
   - `<meta name="note-pinned" content="1" />` (pin this note at top)
   - `<meta name="note-pin-order" content="1" />` (smaller number = higher priority)
5. Add canonical URL in the head:
   - `<link rel="canonical" href="https://5imcs.com/notes/<file-name>.html" />`
6. Run local checks before commit:
   - `node tools/validate-notes.mjs`
7. Commit and push to `master`.

After push, GitHub Actions will automatically refresh:
- `notes/notes-index.json`
- `notes/notes-index.js`
- `sitemap.xml`
- `robots.txt`

The homepage and `notes/index.html` read the notes index and render items as:
`date + title + link`.

Notes page UX notes:
- Search input supports URL sync via `?q=...`.
- Tags are used for filtering and related-note recommendation.
