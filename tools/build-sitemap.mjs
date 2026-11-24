#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const notesIndexPath = path.join(rootDir, "notes", "notes-index.json");
const sitemapPath = path.join(rootDir, "sitemap.xml");
const robotsPath = path.join(rootDir, "robots.txt");
const cnamePath = path.join(rootDir, "CNAME");

const staticRoutes = ["/", "/selected/", "/ongoing/", "/projects/", "/notes/"];

function normalizeDomain(input) {
  const raw = String(input || "").trim();
  if (!raw) return "https://5imcs.com";
  const noProto = raw.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  return `https://${noProto}`;
}

function escapeXml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function collectNoteRoutes() {
  const { items } = JSON.parse(await fs.readFile(notesIndexPath, "utf8"));
  if (!Array.isArray(items)) throw new Error("Notes index is missing its items array");
  return items.map(({ href }) => `/${href.replace(/^\//, "")}`);
}

function buildSitemapXml(baseUrl, routes) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  routes.forEach((route) => {
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(`${baseUrl}${route}`)}</loc>`);
    lines.push("  </url>");
  });

  lines.push("</urlset>");
  return `${lines.join("\n")}\n`;
}

function buildRobotsTxt(baseUrl) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
}

async function main() {
  const domainRaw = await fs.readFile(cnamePath, "utf8").catch(() => "5imcs.com");
  const baseUrl = normalizeDomain(domainRaw);

  const noteRoutes = await collectNoteRoutes();
  const allRoutes = [...staticRoutes, ...noteRoutes];

  const sitemap = buildSitemapXml(baseUrl, allRoutes);
  const robots = buildRobotsTxt(baseUrl);

  await Promise.all([
    fs.writeFile(sitemapPath, sitemap, "utf8"),
    fs.writeFile(robotsPath, robots, "utf8"),
  ]);

  console.log(`Updated ${path.relative(rootDir, sitemapPath)} and ${path.relative(rootDir, robotsPath)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
