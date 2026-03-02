#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const DEFAULT_ARTICLE_URL = "https://www.bilibili.com/read/cv21581471/?opus_fallback=1";
const DEFAULT_DATA_FILE = "notes/data/2026-03-01-xiayige-shei-games.json";

function parseArgs(argv) {
  const options = {
    articleUrl: DEFAULT_ARTICLE_URL,
    articleFile: "",
    dataFile: DEFAULT_DATA_FILE,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--article-url") {
      options.articleUrl = argv[i + 1] || "";
      i += 1;
    } else if (arg === "--article-file") {
      options.articleFile = argv[i + 1] || "";
      i += 1;
    } else if (arg === "--data-file") {
      options.dataFile = argv[i + 1] || "";
      i += 1;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(
    [
      "Usage:",
      "  node tools/enrich-xiayige-video-links.mjs [options]",
      "",
      "Options:",
      "  --article-file <path>   Read bilibili article HTML from local file.",
      "  --article-url <url>     Fetch bilibili article HTML from URL (default).",
      "  --data-file <path>      Target JSON file to enrich.",
      "  --dry-run               Parse and report without writing changes.",
      "  -h, --help              Show this help message.",
      "",
      "Examples:",
      "  node tools/enrich-xiayige-video-links.mjs --article-file /tmp/xygs_article.html",
      "  node tools/enrich-xiayige-video-links.mjs --dry-run",
    ].join("\n")
  );
}

function decodeEntities(input) {
  return String(input || "")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function stripHtml(input) {
  return decodeEntities(String(input || "").replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

function cnNumToInt(raw) {
  const text = String(raw || "").trim();
  if (!text) return Number.NaN;
  if (/^\d+$/.test(text)) return Number(text);

  const map = {
    "零": 0,
    "〇": 0,
    "一": 1,
    "二": 2,
    "两": 2,
    "三": 3,
    "四": 4,
    "五": 5,
    "六": 6,
    "七": 7,
    "八": 8,
    "九": 9,
  };

  if (text === "十") return 10;
  if (text.length === 1 && Number.isFinite(map[text])) return map[text];
  if (text.startsWith("十")) return 10 + (map[text.slice(1)] || 0);
  if (text.endsWith("十")) return (map[text[0]] || 0) * 10;

  const idx = text.indexOf("十");
  if (idx > 0) {
    const tens = map[text.slice(0, idx)] || 0;
    const ones = map[text.slice(idx + 1)] || 0;
    return tens * 10 + ones;
  }

  return Number.NaN;
}

function normalizeEpisodeLabel(raw) {
  const text = String(raw || "").trim();
  if (!text) return "";
  if (/^前传$/.test(text)) return "前传";
  if (/^分组赛$/.test(text)) return "分组赛";

  const extraMatch = text.match(/^番外\s*([0-9一二三四五六七八九十]+)$/);
  if (extraMatch) {
    const n = cnNumToInt(extraMatch[1]);
    if (Number.isFinite(n)) return `番外${n}`;
  }

  const episodeMatch = text.match(/^第\s*([0-9一二三四五六七八九十]+)\s*集$/);
  if (episodeMatch) {
    const n = cnNumToInt(episodeMatch[1]);
    if (Number.isFinite(n)) return String(n);
  }

  return "";
}

function normalizeItemEpisode(episode) {
  if (Number.isFinite(Number(episode)) && String(episode).trim() !== "") {
    return String(Number(episode));
  }
  const text = String(episode || "").trim();
  if (!text) return "";
  if (/^番外\s*\d+$/i.test(text)) return text.replace(/\s+/g, "");
  if (text === "前传" || text === "分组赛") return text;
  return text;
}

function extractInitialState(html) {
  const match = String(html || "").match(/window\.__INITIAL_STATE__=([\s\S]*?);\(function\(\)/);
  if (!match) {
    throw new Error("Cannot find window.__INITIAL_STATE__ in article HTML.");
  }
  return JSON.parse(match[1]);
}

function extractMappingFromContent(contentHtml) {
  const pBlocks = [];
  const pRegex = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let pMatch;
  while ((pMatch = pRegex.exec(contentHtml)) !== null) {
    pBlocks.push(pMatch[1]);
  }

  let currentSeason = null;
  const map = new Map();

  for (const blockHtml of pBlocks) {
    const blockText = stripHtml(blockHtml);
    if (!blockText) continue;

    const seasonMatch = blockText.match(/^第\s*([0-9一二三四五六七八九十]+)\s*季$/);
    if (seasonMatch) {
      const season = cnNumToInt(seasonMatch[1]);
      currentSeason = Number.isFinite(season) ? season : null;
      continue;
    }

    if (!/bilibili\.com\/video\//i.test(blockHtml)) continue;
    if (!Number.isFinite(currentSeason)) continue;

    const hrefMatch = blockHtml.match(/href="([^"]*bilibili\.com\/video\/BV[0-9A-Za-z]+[^"]*)"/i);
    if (!hrefMatch) continue;

    const bvidMatch = hrefMatch[1].match(/\/video\/(BV[0-9A-Za-z]+)/i);
    if (!bvidMatch) continue;

    const episodeMatch = blockText.match(
      /^(第\s*[0-9一二三四五六七八九十]+\s*集|前传|番外\s*[0-9一二三四五六七八九十]+|分组赛)\s*[：:]/
    );
    if (!episodeMatch) continue;

    const episode = normalizeEpisodeLabel(episodeMatch[1]);
    if (!episode) continue;

    const key = `${currentSeason}|${episode}`;
    if (!map.has(key)) {
      map.set(key, bvidMatch[1]);
    }
  }

  return map;
}

async function loadArticleHtml(options) {
  if (options.articleFile) {
    const filePath = path.resolve(options.articleFile);
    return fs.readFileSync(filePath, "utf8");
  }

  if (!options.articleUrl) {
    throw new Error("Missing article input. Provide --article-file or --article-url.");
  }

  let response;
  try {
    response = await fetch(options.articleUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html,application/xhtml+xml",
      },
    });
  } catch (error) {
    throw new Error(
      `Failed to fetch article URL. You can download HTML first and retry with --article-file. (${error.message})`
    );
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

function buildVideoUrl(bvid) {
  return `https://www.bilibili.com/video/${bvid}/`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const dataPath = path.resolve(options.dataFile);

  const articleHtml = await loadArticleHtml(options);
  const state = extractInitialState(articleHtml);
  const contentHtml = String(state.readInfo?.content || "");
  if (!contentHtml) {
    throw new Error("readInfo.content is empty.");
  }

  const mapping = extractMappingFromContent(contentHtml);
  if (mapping.size === 0) {
    throw new Error("No season/episode video mapping extracted from article content.");
  }

  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  if (!Array.isArray(data)) {
    throw new Error(`Expected JSON array in ${dataPath}`);
  }

  let updatedCount = 0;
  let unchangedCount = 0;
  const missingKeys = new Set();

  for (const item of data) {
    const season = Number(item.season);
    const episode = normalizeItemEpisode(item.episode);
    const key = `${season}|${episode}`;
    const bvid = mapping.get(key);

    if (!bvid) {
      missingKeys.add(key);
      continue;
    }

    const videoUrl = buildVideoUrl(bvid);
    const beforeBvid = String(item.bvid || "").trim();
    const beforeUrl = String(item.videoUrl || item.video_url || "").trim();
    const changed = beforeBvid !== bvid || beforeUrl !== videoUrl;

    if (changed) {
      item.bvid = bvid;
      item.videoUrl = videoUrl;
      updatedCount += 1;
    } else {
      unchangedCount += 1;
    }
  }

  const sortedMissing = Array.from(missingKeys).sort((a, b) => {
    const [sa, ea] = a.split("|");
    const [sb, eb] = b.split("|");
    const diff = Number(sa) - Number(sb);
    if (diff !== 0) return diff;
    const na = Number(ea);
    const nb = Number(eb);
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
    if (Number.isFinite(na)) return -1;
    if (Number.isFinite(nb)) return 1;
    return ea.localeCompare(eb, "zh-Hans-CN");
  });

  if (!options.dryRun) {
    fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  }

  console.log(`[xiayige] mapping entries: ${mapping.size}`);
  console.log(`[xiayige] data rows: ${data.length}`);
  console.log(`[xiayige] rows updated: ${updatedCount}`);
  console.log(`[xiayige] rows unchanged: ${unchangedCount}`);
  console.log(`[xiayige] unmatched season/episode keys: ${sortedMissing.length}`);
  if (sortedMissing.length > 0) {
    console.log(sortedMissing.join("\n"));
  }
}

main().catch((error) => {
  console.error(`[xiayige] ${error.message}`);
  process.exitCode = 1;
});
