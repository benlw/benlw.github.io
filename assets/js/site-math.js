// Opt in on pages with mathematics. Include this after any script that builds the TOC.
(() => {
  window.MathJax = {
    tex: {
      inlineMath: [["\\(", "\\)"], ["$", "$"]],
      displayMath: [["\\[", "\\]"], ["$$", "$$"]],
      processEscapes: true,
      processEnvironments: true,
      tags: "ams",
    },
  };

  const engine = document.createElement("script");
  engine.id = "MathJax-script";
  engine.src = "https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-mml-chtml.js";
  engine.integrity = "sha384-Wuix6BuhrWbjDBs24bXrjf4ZQ5aFeFWBuKkFekO2t8xFU0iNaLQfp2K6/1Nxveei";
  engine.crossOrigin = "anonymous";
  document.head.append(engine);
})();
