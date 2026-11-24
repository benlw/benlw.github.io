(function () {
  function initReveal() {
    const revealNodes = document.querySelectorAll('.reveal');
    if (!revealNodes.length || !('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0,
      }
    );

    revealNodes.forEach((node) => observer.observe(node));
  }

  async function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    document.execCommand('copy');
    document.body.removeChild(helper);
  }

  function initCopyButtons() {
    const copyNodes = document.querySelectorAll('[data-copy-text]');
    if (!copyNodes.length) return;

    copyNodes.forEach((node) => {
      node.addEventListener('click', async () => {
        const text = node.getAttribute('data-copy-text');
        if (!text) return;

        const defaultTitle = node.getAttribute('title') || '';
        const defaultAria = node.getAttribute('aria-label') || '';
        const successMsg = node.getAttribute('data-copy-success') || 'Copied';

        try {
          await copyText(text);
          node.classList.add('is-copied');
          node.setAttribute('title', successMsg);
          node.setAttribute('aria-label', successMsg);
        } catch (_) {
          node.setAttribute('title', 'Copy failed');
          node.setAttribute('aria-label', 'Copy failed');
        } finally {
          window.setTimeout(() => {
            node.classList.remove('is-copied');
            node.setAttribute('title', defaultTitle);
            node.setAttribute('aria-label', defaultAria);
          }, 1200);
        }
      });
    });
  }

  function initHeatmapFallback() {
    document.querySelectorAll('[data-heatmap]').forEach((block) => {
      const image = block.querySelector('[data-heatmap-img]');
      const fallback = block.querySelector('[data-heatmap-fallback]');
      if (!image || !fallback) return;

      image.addEventListener('error', () => {
        image.style.display = 'none';
        fallback.hidden = false;
      });
    });
  }

  initReveal();
  initCopyButtons();
  initHeatmapFallback();
})();
