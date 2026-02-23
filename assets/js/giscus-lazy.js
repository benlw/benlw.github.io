(function () {
  function loadGiscus(node) {
    if (!node || node.dataset.giscusLoaded === "1") return;
    node.dataset.giscusLoaded = "1";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";

    Array.from(node.attributes).forEach((attr) => {
      const name = attr.name;
      if (!name.startsWith("data-")) return;
      if (name === "data-giscus-lazy" || name === "data-giscus-loaded") return;
      script.setAttribute(name, attr.value);
    });

    node.replaceWith(script);
  }

  function initLazyGiscus() {
    const nodes = Array.from(document.querySelectorAll("[data-giscus-lazy]"));
    if (nodes.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      nodes.forEach(loadGiscus);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          loadGiscus(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "220px 0px" }
    );

    nodes.forEach((node) => observer.observe(node));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLazyGiscus, {
      once: true,
    });
    return;
  }

  initLazyGiscus();
})();
