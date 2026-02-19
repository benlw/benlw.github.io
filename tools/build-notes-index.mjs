#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const notesDir = path.join(rootDir, "notes");
const outputFile = path.join(notesDir, "notes-index.json");

function cleanText(input) {
  return String(input || "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDateYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeDate(input) {
  if (!input) return null;
  const raw = cleanText(input);

  const ymdMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdMatch) return raw;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return formatDateYYYYMMDD(parsed);
}

function extractTitle(htmlContent, fallback) {
  const titleMatch = htmlContent.match(/<title>([\s\S]*?)<\/title>/i);
  if (!titleMatch) return fallback;
  return cleanText(titleMatch[1]) || fallback;
}

function extractDate(htmlContent, fileName) {
  const metaMatch = htmlContent.match(
    /<meta[^>]+name=["'](?:note-date|date|updated)["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );
  const timeMatch = htmlContent.match(
    /<time[^>]+datetime=["']([^"']+)["'][^>]*>/i
  );
  const fileMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})/);

  return (
    normalizeDate(metaMatch?.[1]) ||
    normalizeDate(timeMatch?.[1]) ||
    normalizeDate(fileMatch?.[1]) ||
    null
  );
}

async function buildNotesIndex() {
  const entries = await fs.readdir(notesDir, { withFileTypes: true });
  const htmlFiles = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(".html") &&
        entry.name !== "index.html" &&
        !entry.name.startsWith("_")
    )
    .map((entry) => entry.name);

  const items = [];

  for (const fileName of htmlFiles) {
    const fullPath = path.join(notesDir, fileName);
    const [content, stats] = await Promise.all([
      fs.readFile(fullPath, "utf8"),
      fs.stat(fullPath),
    ]);

    const fallbackTitle = fileName.replace(/\.html$/, "");
    const title = extractTitle(content, fallbackTitle);
    const date = extractDate(content, fileName) || formatDateYYYYMMDD(stats.mtime);

    items.push({
      date,
      title,
      href: `notes/${fileName}`,
    });
  }

  items.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));

  const payload = {
    generatedAt: new Date().toISOString(),
    items,
  };

  await fs.writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Updated ${path.relative(rootDir, outputFile)} with ${items.length} item(s).`);
}

buildNotesIndex().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
