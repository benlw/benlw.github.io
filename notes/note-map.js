(function () {
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function slugify(text) {
    return String(text)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function estimateReadingMinutes(text) {
    const cleanText = String(text || "").trim();
    if (!cleanText) return 1;

    const cjkCount = (cleanText.match(/[\u4e00-\u9fff]/g) || []).length;
    const latinWordCount =
      (cleanText.replace(/[\u4e00-\u9fff]/g, " ").match(/[A-Za-z0-9_'-]+/g) || [])
        .length;

    const minutes = Math.ceil(cjkCount / 300 + latinWordCount / 200);
    return Math.max(1, minutes);
  }

  function ensureHeadingId(heading, usedIds) {
    if (heading.id) {
      usedIds.add(heading.id);
      return heading.id;
    }

    const base = slugify(heading.textContent) || "section";
    let candidate = base;
    let index = 2;
    while (usedIds.has(candidate)) {
      candidate = `${base}-${index}`;
      index += 1;
    }
    heading.id = candidate;
    usedIds.add(candidate);
    return candidate;
  }

  function escapeHtml(input) {
    return String(input)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  const contentNode = document.querySelector("[data-reading-content]");
  const mapNode = document.querySelector("[data-reading-map]");
  if (!contentNode || !mapNode) return;

  const tocNode = mapNode.querySelector("[data-reading-toc]");
  const tocWrap = mapNode.querySelector("[data-reading-toc-wrap]");
  const readingTimeNode = mapNode.querySelector("[data-reading-time]");
  const progressTextNode = mapNode.querySelector("[data-reading-progress-text]");
  const progressBarNode = document.querySelector("[data-reading-progress-bar]");
  const isZh = document.documentElement.lang === "zh-CN";

  const headings = Array.from(contentNode.querySelectorAll("h2, h3"));
  const usedIds = new Set();
  headings.forEach((heading) => ensureHeadingId(heading, usedIds));

  if (tocNode) {
    if (headings.length === 0) {
      if (tocWrap) tocWrap.hidden = true;
    } else {
      tocNode.innerHTML = headings
        .map((heading) => {
          const itemClass = heading.tagName === "H3" ? "toc-sub" : "";
          return `<li class="${itemClass}"><a href="#${escapeHtml(heading.id)}">${escapeHtml(
            heading.textContent.trim()
          )}</a></li>`;
        })
        .join("");
    }
  }

  if (readingTimeNode) {
    const minutes = estimateReadingMinutes(contentNode.textContent);
    readingTimeNode.textContent = isZh
      ? `约 ${minutes} 分钟阅读`
      : `${minutes} min read`;
  }

  let ticking = false;
  function updateProgress() {
    const rect = contentNode.getBoundingClientRect();
    const contentTop = window.scrollY + rect.top;
    const contentBottom = contentTop + contentNode.offsetHeight;
    const anchor = window.scrollY + window.innerHeight * 0.35;
    const ratio = clamp((anchor - contentTop) / (contentBottom - contentTop), 0, 1);
    const percent = Math.round(ratio * 100);

    if (progressBarNode) {
      progressBarNode.style.width = `${percent}%`;
    }
    if (progressTextNode) {
      progressTextNode.textContent = isZh ? `${percent}% 已读` : `${percent}% read`;
    }
    ticking = false;
  }

  function requestProgressUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateProgress);
  }

  window.addEventListener("scroll", requestProgressUpdate, { passive: true });
  window.addEventListener("resize", requestProgressUpdate);
  requestProgressUpdate();
})();
