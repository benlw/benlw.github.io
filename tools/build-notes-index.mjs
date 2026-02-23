#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const notesDir = path.join(rootDir, "notes");
const outputFile = path.join(notesDir, "notes-index.json");
const outputJsFile = path.join(notesDir, "notes-index.js");

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

function extractMetaContent(htmlContent, names) {
  for (const name of names) {
    const regex = new RegExp(
      `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["'][^>]*>`,
      "i"
    );
    const match = htmlContent.match(regex);
    if (match) return cleanText(match[1]);
  }
  return "";
}

function extractTags(htmlContent) {
  const raw = extractMetaContent(htmlContent, ["note-tags", "tags"]);
  if (!raw) return [];

  const tags = raw
    .split(",")
    .map((tag) => cleanText(tag))
    .filter(Boolean);

  const seen = new Set();
  const uniqueTags = [];
  for (const tag of tags) {
    const normalized = tag.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    uniqueTags.push(tag);
  }
  return uniqueTags;
}

function parseBooleanMeta(input) {
  const value = cleanText(input).toLowerCase();
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value);
}

function extractPinned(htmlContent) {
  const raw = extractMetaContent(htmlContent, ["note-pinned", "pinned"]);
  return parseBooleanMeta(raw);
}

function extractPinOrder(htmlContent) {
  const raw = extractMetaContent(htmlContent, ["note-pin-order", "pin-order"]);
  if (!raw) return null;

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function compareNotes(a, b) {
  const aPinned = Boolean(a.pinned);
  const bPinned = Boolean(b.pinned);

  if (aPinned !== bPinned) return aPinned ? -1 : 1;

  if (aPinned && bPinned) {
    const aPinOrder = Number.isFinite(a.pinOrder)
      ? a.pinOrder
      : Number.POSITIVE_INFINITY;
    const bPinOrder = Number.isFinite(b.pinOrder)
      ? b.pinOrder
      : Number.POSITIVE_INFINITY;
    if (aPinOrder !== bPinOrder) return aPinOrder - bPinOrder;
  }

  return b.date.localeCompare(a.date) || a.title.localeCompare(b.title);
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
    const tags = extractTags(content);
    const pinned = extractPinned(content);
    const pinOrder = extractPinOrder(content);

    const item = {
      date,
      title,
      href: `notes/${fileName}`,
    };

    if (tags.length > 0) item.tags = tags;
    if (pinned) item.pinned = true;
    if (pinOrder !== null) item.pinOrder = pinOrder;

    items.push(item);
  }

  items.sort(compareNotes);

  const payload = {
    generatedAt: new Date().toISOString(),
    items,
  };

  await fs.writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  await fs.writeFile(
    outputJsFile,
    `window.NOTES_INDEX = ${JSON.stringify(payload, null, 2)};\n`,
    "utf8"
  );
  console.log(
    `Updated ${path.relative(rootDir, outputFile)} and ${path.relative(
      rootDir,
      outputJsFile
    )} with ${items.length} item(s).`
  );
}

buildNotesIndex().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
