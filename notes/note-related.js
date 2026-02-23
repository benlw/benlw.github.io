(function () {
  function cleanText(input) {
    return String(input || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeHtml(input) {
    return String(input)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeDate(input) {
    const raw = cleanText(input);
    if (!raw) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return raw;

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseTags(input) {
    const values = Array.isArray(input)
      ? input
      : String(input || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);

    const seen = new Set();
    const tags = [];
    values.forEach((value) => {
      const tag = cleanText(value);
      if (!tag) return;
      const normalized = tag.toLowerCase();
      if (seen.has(normalized)) return;
      seen.add(normalized);
      tags.push(tag);
    });
    return tags;
  }

  function normalizePathname(input) {
    const raw = cleanText(input);
    if (!raw) return "";

    const withoutOrigin = raw.replace(/^https?:\/\/[^/]+/i, "");
    let normalized = withoutOrigin.startsWith("/")
      ? withoutOrigin
      : `/${withoutOrigin}`;

    normalized = normalized.replace(/\/index\.html$/i, "/");
    if (normalized.length > 1) {
      normalized = normalized.replace(/\/+$/, "");
    }
    return normalized;
  }

  function toRelativeNoteHref(href) {
    if (/^(https?:|mailto:)/i.test(href)) return href;
    return String(href || "")
      .replace(/^\/?notes\//i, "")
      .trim();
  }

  function countSharedTags(aTags, bTags) {
    if (!Array.isArray(aTags) || !Array.isArray(bTags)) return 0;
    const bSet = new Set(bTags.map((tag) => String(tag).toLowerCase()));
    return aTags.reduce((count, tag) => {
      return bSet.has(String(tag).toLowerCase()) ? count + 1 : count;
    }, 0);
  }

  function compareByDateDesc(a, b) {
    const aDate = normalizeDate(a.date);
    const bDate = normalizeDate(b.date);
    return bDate.localeCompare(aDate) || String(a.title).localeCompare(String(b.title));
  }

  async function loadNotesPayload() {
    if (window.NOTES_INDEX && Array.isArray(window.NOTES_INDEX.items)) {
      return window.NOTES_INDEX;
    }

    const response = await fetch("notes-index.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch notes-index.json");
    return response.json();
  }

  function renderRelatedList(listNode, items) {
    listNode.innerHTML = items
      .map((item) => {
        const date = normalizeDate(item.date) || "--";
        const href = toRelativeNoteHref(item.href);
        const attrs = /^(https?:|mailto:)/i.test(href)
          ? ' target="_blank" rel="noopener noreferrer"'
          : "";
        return `<li><span class="related-date">${escapeHtml(
          date
        )}</span><a href="${escapeHtml(href)}"${attrs}>${escapeHtml(
          item.title || "Untitled"
        )}</a></li>`;
      })
      .join("");
  }

  async function initRelatedNotes() {
    const section = document.querySelector("[data-related-notes]");
    if (!section) return;

    const listNode = section.querySelector("[data-related-notes-list]");
    if (!listNode) return;
    const modeNode = section.querySelector("[data-related-notes-mode]");

    const currentTags = parseTags(
      document.querySelector('meta[name="note-tags"]')?.content || ""
    );
    const currentPath = normalizePathname(window.location.pathname);

    try {
      const payload = await loadNotesPayload();
      const sourceItems = Array.isArray(payload.items) ? payload.items : [];
      const items = sourceItems
        .map((item) => ({
          date: item.date,
          title: item.title,
          href: item.href,
          tags: parseTags(item.tags),
          path: normalizePathname(item.href),
        }))
        .filter((item) => item.path && item.path !== currentPath);

      if (items.length === 0) return;

      const scoredItems = items
        .map((item) => ({
          ...item,
          score: countSharedTags(currentTags, item.tags),
        }))
        .filter((item) => item.score > 0)
        .sort(
          (a, b) =>
            b.score - a.score ||
            compareByDateDesc(a, b)
        );

      let selected;
      let modeText;
      if (scoredItems.length > 0) {
        selected = scoredItems.slice(0, 3);
        modeText = "Related by tags";
      } else {
        selected = items.sort(compareByDateDesc).slice(0, 3);
        modeText = "Recent notes";
      }

      if (!Array.isArray(selected) || selected.length === 0) return;
      renderRelatedList(listNode, selected);
      if (modeNode) modeNode.textContent = modeText;
      section.hidden = false;
    } catch (_) {
      // Keep section hidden when notes index is unavailable.
    }
  }

  initRelatedNotes();
})();
