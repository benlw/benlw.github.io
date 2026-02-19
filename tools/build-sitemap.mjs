#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const notesIndexPath = path.join(rootDir, "notes", "notes-index.json");
const sitemapPath = path.join(rootDir, "sitemap.xml");
const robotsPath = path.join(rootDir, "robots.txt");
const cnamePath = path.join(rootDir, "CNAME");

const staticRoutes = [
  { urlPath: "/", filePath: "index.html" },
  { urlPath: "/selected/", filePath: "selected/index.html" },
  { urlPath: "/ongoing/", filePath: "ongoing/index.html" },
  { urlPath: "/projects/", filePath: "projects/index.html" },
  { urlPath: "/notes/", filePath: "notes/index.html" },
];

function formatDateYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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

async function resolveLastMod(filePath) {
  try {
    const stats = await fs.stat(path.join(rootDir, filePath));
    return formatDateYYYYMMDD(stats.mtime);
  } catch (_) {
    return formatDateYYYYMMDD(new Date());
  }
}

async function collectNoteRoutes() {
  try {
    const raw = await fs.readFile(notesIndexPath, "utf8");
    const payload = JSON.parse(raw);
    const items = Array.isArray(payload.items) ? payload.items : [];

    const routes = [];
    for (const item of items) {
      const href = String(item.href || "").trim();
      if (!href || !href.endsWith(".html")) continue;

      const cleanPath = href.startsWith("/") ? href : `/${href}`;
      const lastmod = item.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date)
        ? item.date
        : await resolveLastMod(href);

      routes.push({
        urlPath: cleanPath,
        filePath: href,
        lastmod,
      });
    }
    return routes;
  } catch (_) {
    return [];
  }
}

function buildSitemapXml(baseUrl, routes) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  routes.forEach((route) => {
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(`${baseUrl}${route.urlPath}`)}</loc>`);
    if (route.lastmod) {
      lines.push(`    <lastmod>${escapeXml(route.lastmod)}</lastmod>`);
    }
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

  const staticWithDates = await Promise.all(
    staticRoutes.map(async (route) => ({
      ...route,
      lastmod: await resolveLastMod(route.filePath),
    }))
  );

  const noteRoutes = await collectNoteRoutes();
  const allRoutes = [...staticWithDates, ...noteRoutes];

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
