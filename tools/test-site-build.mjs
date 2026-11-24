import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

test("unchanged content is reproducible across checkouts; new notes reach all indexes", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "site-build-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const file = (name) => path.join(root, name);
  await mkdir(file("notes"));
  await writeFile(file("index.html"), "<title>Home</title>");
  await writeFile(file("CNAME"), "example.org\n");
  const addNote = (date) => writeFile(file(`notes/${date}-note.html`),
    `<title>Test</title><meta name="note-date" content="${date}">`);
  const build = async (tz) => {
    for (const name of ["build-notes-index.mjs", "build-sitemap.mjs"]) {
      execFileSync(process.execPath, [fileURLToPath(new URL(name, import.meta.url))],
        { cwd: root, env: { ...process.env, TZ: tz } });
    }
    return Promise.all(["notes/notes-index.json", "notes/notes-index.js", "sitemap.xml", "robots.txt"]
      .map((name) => readFile(file(name), "utf8")));
  };
  await addNote("2024-01-01");
  const before = await build("Asia/Shanghai");
  await utimes(file("index.html"), 1, 1);
  await utimes(file("notes/2024-01-01-note.html"), 1, 1);
  assert.deepEqual(await build("America/Los_Angeles"), before);
  await addNote("2025-01-01");
  const [json, script, sitemap] = await build("UTC");
  assert.deepEqual(JSON.parse(json).items.map((item) => item.date), ["2025-01-01", "2024-01-01"]);
  assert.equal(script, `window.NOTES_INDEX = ${json.trimEnd()};\n`);
  assert.match(sitemap, /https:\/\/example\.org\/notes\/2025-01-01-note\.html/);
});
