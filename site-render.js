(function () {
  const data = window.SITE_DATA || {};
  const selectedResearch = Array.isArray(data.selectedResearch)
    ? data.selectedResearch
    : [];
  const ongoingResearch = Array.isArray(data.ongoingResearch)
    ? data.ongoingResearch
    : [];
  const projectItems = Array.isArray(data.projectItems)
    ? data.projectItems
    : [];

  function escapeHtml(input) {
    return String(input)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function withBase(path, base) {
    if (/^(https?:|mailto:|#)/.test(path)) return path;
    return `${base}${path}`;
  }

  function linkAttrs(href) {
    return /^(https?:|mailto:)/.test(href)
      ? ' target="_blank" rel="noopener noreferrer"'
      : "";
  }

  function renderNav() {
    document.querySelectorAll("[data-site-nav]").forEach((navNode) => {
      const context = navNode.dataset.navContext || "home";
      const base = navNode.dataset.base || "";

      const links =
        context === "home"
          ? [
              { label: "About", href: "#about" },
              { label: "Selected Research", href: "#selected-research" },
              { label: "Ongoing Research", href: "#ongoing" },
              { label: "My Projects", href: "#projects" },
              { label: "Notes & Logs", href: "#notes" },
            ]
          : [
              { label: "Home", href: withBase("", base) },
              {
                label: "Selected Research",
                href: withBase("selected/", base),
              },
              {
                label: "Ongoing Research",
                href: withBase("ongoing/", base),
              },
              {
                label: "My Projects",
                href: withBase("projects/", base),
              },
              {
                label: "Notes & Logs",
                href: withBase("notes/", base),
              },
            ];

      navNode.innerHTML = `<div class="nav-links">${links
        .map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`)
        .join("")}</div>`;
    });
  }

  function renderAuthors(authors) {
    return authors
      .map((author) => {
        const item = typeof author === "string" ? { name: author } : author;
        const name = escapeHtml(item.name);
        if (item.url) {
          return `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${name}</a>`;
        }
        return name;
      })
      .join(", ");
  }

  function renderActions(actions, base) {
    if (!Array.isArray(actions) || actions.length === 0) return "";

    const html = actions
      .map((action) => {
        const href = withBase(action.href, base);
        const actionClass = String(action.label || "link")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        return `<a class="title-link title-link-${escapeHtml(actionClass)}" href="${escapeHtml(href)}"${linkAttrs(href)}><i class="${escapeHtml(action.icon)}"></i> ${escapeHtml(action.label)}</a>`;
      })
      .join("");

    return `<span class="title-actions">${html}</span>`;
  }

  function renderSelectedResearch() {
    document.querySelectorAll("[data-selected-research-list]").forEach((node) => {
      const base = node.dataset.base || "";
      const limitRaw = node.dataset.limit;
      const limit = limitRaw ? Number(limitRaw) : selectedResearch.length;
      const items = Number.isFinite(limit)
        ? selectedResearch.slice(0, limit)
        : selectedResearch;

      node.innerHTML = items
        .map((item) => {
          const imagePath = withBase(item.image, base);
          return `
            <article class="research-card">
              <div class="research-media">
                <img src="${escapeHtml(imagePath)}" alt="${escapeHtml(item.alt)}" loading="lazy" />
              </div>
              <div class="research-content">
                <h3>
                  ${escapeHtml(item.title)}
                  ${renderActions(item.actions, base)}
                </h3>
                <p class="research-meta">
                  ${renderAuthors(item.authors)}. <strong>${escapeHtml(item.venue)}</strong>
                </p>
                <p class="research-summary">${escapeHtml(item.summary)}</p>
              </div>
            </article>
          `;
        })
        .join("");
    });
  }

  function renderOngoing() {
    document.querySelectorAll("[data-ongoing-list]").forEach((node) => {
      const base = node.dataset.base || "";
      const limitRaw = node.dataset.limit;
      const showLinks = node.dataset.showLinks !== "false";
      const limit = limitRaw ? Number(limitRaw) : ongoingResearch.length;
      const items = Number.isFinite(limit)
        ? ongoingResearch.slice(0, limit)
        : ongoingResearch;

      node.innerHTML = items
        .map((item) => {
          const idAttr = item.id ? ` id="${escapeHtml(item.id)}"` : "";
          const linksHtml =
            showLinks && Array.isArray(item.links)
              ? item.links
                  .map((link) => {
                    const href = withBase(link.href, base);
                    const icon = link.icon
                      ? `<i class="${escapeHtml(link.icon)}"></i> `
                      : "";
                    return ` <a href="${escapeHtml(href)}"${linkAttrs(href)}>${icon}${escapeHtml(link.label)}</a>`;
                  })
                  .join("")
              : "";

          return `<li${idAttr}><span class="outline-title">${escapeHtml(
            item.title
          )}</span> ${escapeHtml(item.summary)}${linksHtml}</li>`;
        })
        .join("");
    });
  }

  function renderProjects() {
    document.querySelectorAll("[data-project-list]").forEach((node) => {
      const base = node.dataset.base || "";
      const limitRaw = node.dataset.limit;
      const limit = limitRaw ? Number(limitRaw) : projectItems.length;
      const items = Number.isFinite(limit)
        ? projectItems.slice(0, limit)
        : projectItems;

      node.innerHTML = items
        .map((item) => {
          const mainLinkClass = item.link?.className
            ? ` project-link ${escapeHtml(item.link.className)}`
            : " project-link";

          const mainLink = item.link
            ? ` <a class="${mainLinkClass.trim()}" href="${escapeHtml(
                withBase(item.link.href, base)
              )}"${linkAttrs(withBase(item.link.href, base))}>${
                item.link.icon
                  ? `<i class="${escapeHtml(item.link.icon)}"></i> `
                  : ""
              }${escapeHtml(item.link.label)}</a>${escapeHtml(
                item.suffix || ""
              )}`
            : "";

          const subLinks = Array.isArray(item.subLinks)
            ? `<span class="mini-links">${item.subLinks
                .map(
                  (sub) =>
                    `<a href="${escapeHtml(
                      withBase(sub.href, base)
                    )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
                      sub.label
                    )}</a>`
                )
                .join("")}</span>`
            : "";

          return `<li><span class="outline-title">${escapeHtml(
            item.title
          )}</span> ${escapeHtml(item.description)}${mainLink} ${subLinks}</li>`;
        })
        .join("");
    });
  }

  function normalizeDate(input) {
    if (!input) return "";
    const raw = String(input).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return raw;

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function parseBoolean(input) {
    if (typeof input === "boolean") return input;
    const value = String(input || "")
      .trim()
      .toLowerCase();
    return ["1", "true", "yes", "on"].includes(value);
  }

  function normalizeTags(input) {
    const source = Array.isArray(input)
      ? input
      : String(input || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
    if (!Array.isArray(source) || source.length === 0) return [];

    const tags = source.map((tag) => String(tag || "").trim()).filter(Boolean);

    const seen = new Set();
    const uniqueTags = [];
    tags.forEach((tag) => {
      const normalized = tag.toLowerCase();
      if (seen.has(normalized)) return;
      seen.add(normalized);
      uniqueTags.push(tag);
    });
    return uniqueTags;
  }

  function normalizePinOrder(input) {
    if (input === null || input === undefined || input === "") return null;
    const parsed = Number.parseInt(input, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function normalizeNotesItems(items) {
    if (!Array.isArray(items)) return [];

    return items.map((item) => {
      const normalized = {
        date: normalizeDate(item.date),
        title: item.title || "Untitled",
        href: item.href || "",
        tags: normalizeTags(item.tags),
        pinned: parseBoolean(item.pinned),
      };

      const pinOrder = normalizePinOrder(item.pinOrder);
      if (pinOrder !== null) normalized.pinOrder = pinOrder;
      return normalized;
    });
  }

  function compareNotesItems(a, b) {
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

    return (
      String(b.date || "").localeCompare(String(a.date || "")) ||
      String(a.title || "").localeCompare(String(b.title || ""))
    );
  }

  function sortNotesItems(items) {
    return items.slice().sort(compareNotesItems);
  }

  function noteMatchesQuery(item, query) {
    const keyword = String(query || "")
      .trim()
      .toLowerCase();
    if (!keyword) return true;

    const tokens = keyword.split(/\s+/).filter(Boolean);
    const title = String(item.title || "").toLowerCase();
    const tags = Array.isArray(item.tags) ? item.tags.join(" ").toLowerCase() : "";
    const haystack = `${title} ${tags}`;

    return tokens.every((token) => haystack.includes(token));
  }

  function renderNotesItems(node, items, base, emptyMessage) {
    if (!Array.isArray(items) || items.length === 0) {
      const message = emptyMessage || "No notes available yet.";
      node.innerHTML = `<li class="outline-empty">${escapeHtml(message)}</li>`;
      return;
    }

    node.innerHTML = items
      .map((item) => {
        const date = normalizeDate(item.date) || "--";
        const href = withBase(item.href || "", base);
        const title = item.title || "Untitled";
        const pinHtml = item.pinned
          ? '<span class="note-pin note-pin-inline" aria-label="Pinned note">Pinned</span>'
          : "";

        return `<li class="note-row"><span class="outline-date">${escapeHtml(
          date
        )}</span><a class="note-title" href="${escapeHtml(href)}"${linkAttrs(
          href
        )}>${escapeHtml(
          title
        )}</a>${pinHtml}</li>`;
      })
      .join("");
  }

  function renderNotes() {
    document.querySelectorAll("[data-notes-list]").forEach(async (node) => {
      const base = node.dataset.base || "";
      const source = node.dataset.source || "notes/notes-index.json";
      const limitRaw = node.dataset.limit;
      const limit = limitRaw ? Number(limitRaw) : Number.POSITIVE_INFINITY;
      const sourceUrl = withBase(source, base);
      const sectionNode = node.closest(".section") || document;
      const inputSelector = node.dataset.filterInput || "";
      const metaSelector = node.dataset.filterMeta || "";
      const filterInput = inputSelector
        ? sectionNode.querySelector(inputSelector) ||
          document.querySelector(inputSelector)
        : null;
      const filterMeta = metaSelector
        ? sectionNode.querySelector(metaSelector) ||
          document.querySelector(metaSelector)
        : null;
      const globalPayload =
        window.NOTES_INDEX && Array.isArray(window.NOTES_INDEX.items)
          ? window.NOTES_INDEX
          : null;

      function renderWithFilter(allItems) {
        const sortedItems = sortNotesItems(normalizeNotesItems(allItems));
        const query = filterInput ? filterInput.value : "";
        const matchedItems = sortedItems.filter((item) =>
          noteMatchesQuery(item, query)
        );
        const visibleItems = Number.isFinite(limit)
          ? matchedItems.slice(0, limit)
          : matchedItems;
        const queryText = String(query || "").trim();
        const emptyMessage = queryText
          ? "No matching notes."
          : "No notes available yet.";
        renderNotesItems(node, visibleItems, base, emptyMessage);

        if (filterMeta) {
          if (queryText) {
            filterMeta.textContent = `${matchedItems.length} result(s) for "${queryText}".`;
          } else {
            filterMeta.textContent = `Showing ${visibleItems.length} of ${sortedItems.length} note(s).`;
          }
        }
      }

      function bindFilter(allItems) {
        if (!filterInput || filterInput.dataset.notesFilterBound === "1") return;
        filterInput.addEventListener("input", () => renderWithFilter(allItems));
        filterInput.dataset.notesFilterBound = "1";
      }

      if (globalPayload) {
        const allItems = Array.isArray(globalPayload.items)
          ? globalPayload.items
          : [];
        bindFilter(allItems);
        renderWithFilter(allItems);
        return;
      }

      try {
        const response = await fetch(sourceUrl, { cache: "no-store" });
        if (!response.ok) throw new Error(`Failed to fetch ${sourceUrl}`);

        const payload = await response.json();
        const allItems = Array.isArray(payload.items) ? payload.items : [];
        bindFilter(allItems);
        renderWithFilter(allItems);
      } catch (_) {
        node.innerHTML =
          '<li class="outline-empty">Notes index is unavailable right now.</li>';
        if (filterMeta) {
          filterMeta.textContent = "Search is unavailable while notes index is unavailable.";
        }
      }
    });
  }

  renderNav();
  renderSelectedResearch();
  renderOngoing();
  renderProjects();
  renderNotes();
})();
