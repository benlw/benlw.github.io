#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const notesDir = path.join(rootDir, "notes");

function cleanText(input) {
  return String(input || "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseBoolean(input) {
  const value = cleanText(input).toLowerCase();
  return ["1", "true", "yes", "on"].includes(value);
}

function extractMeta(htmlContent, name) {
  const regex = new RegExp(
    `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["'][^>]*>`,
    "i"
  );
  const match = htmlContent.match(regex);
  return match ? cleanText(match[1]) : "";
}

function extractCanonical(htmlContent) {
  const match = htmlContent.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i
  );
  return match ? cleanText(match[1]) : "";
}

function validateTags(rawTags) {
  if (!rawTags) return [];

  const errors = [];
  const tags = rawTags.split(",");
  const seen = new Set();

  tags.forEach((rawTag, index) => {
    const tag = cleanText(rawTag);
    const idx = index + 1;

    if (!tag) {
      errors.push(`tag #${idx} is empty`);
      return;
    }

    if (tag.includes("#")) {
      errors.push(`tag "${tag}" should not include "#"`);
    }

    const normalized = tag.toLowerCase();
    if (seen.has(normalized)) {
      errors.push(`duplicate tag "${tag}"`);
      return;
    }
    seen.add(normalized);
  });

  return errors;
}

async function validateFile(fileName) {
  const fullPath = path.join(notesDir, fileName);
  const htmlContent = await fs.readFile(fullPath, "utf8");
  const issues = [];

  if (htmlContent.includes(".notes-materials/")) {
    issues.push('contains forbidden local path ".notes-materials/"');
  }

  const noteDate = extractMeta(htmlContent, "note-date");
  if (!noteDate) {
    issues.push('missing meta: <meta name="note-date" ...>');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(noteDate)) {
    issues.push(`invalid note-date "${noteDate}" (expected YYYY-MM-DD)`);
  }

  const canonical = extractCanonical(htmlContent);
  const expectedCanonical = `https://5imcs.com/notes/${fileName}`;
  if (!canonical) {
    issues.push('missing canonical link <link rel="canonical" ...>');
  } else if (canonical !== expectedCanonical) {
    issues.push(
      `canonical mismatch "${canonical}" (expected "${expectedCanonical}")`
    );
  }

  const tags = extractMeta(htmlContent, "note-tags");
  const tagErrors = validateTags(tags);
  tagErrors.forEach((error) => issues.push(`note-tags ${error}`));

  const pinned = parseBoolean(extractMeta(htmlContent, "note-pinned"));
  const pinOrderRaw = extractMeta(htmlContent, "note-pin-order");
  if (pinned) {
    const pinOrder = Number.parseInt(pinOrderRaw, 10);
    if (!Number.isFinite(pinOrder) || pinOrder < 1) {
      issues.push(
        'note-pinned is true but note-pin-order is missing/invalid (expected integer >= 1)'
      );
    }
  }

  return issues;
}

async function run() {
  const entries = await fs.readdir(notesDir, { withFileTypes: true });
  const noteFiles = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(".html") &&
        entry.name !== "index.html" &&
        !entry.name.startsWith("_")
    )
    .map((entry) => entry.name)
    .sort();

  const allIssues = [];
  for (const fileName of noteFiles) {
    const issues = await validateFile(fileName);
    if (issues.length === 0) continue;
    issues.forEach((issue) => allIssues.push(`${fileName}: ${issue}`));
  }

  if (allIssues.length > 0) {
    console.error("Notes validation failed:");
    allIssues.forEach((line) => console.error(`- ${line}`));
    process.exitCode = 1;
    return;
  }

  console.log(`Notes validation passed (${noteFiles.length} file(s)).`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
