window.MathJax = {
  tex: {
    inlineMath: [['$', '$']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    processEnvironments: true,
    tags: 'ams' 
  },
  svg: {
    fontCache: 'global'
  },
  loader: {
    load: ['output/svg', 'input/tex']
  },
  options: {
    renderActions: {
      addMenu: [0, '', '']
    }
  }
};

const dialog = document.querySelector('.demo-player');
if (dialog && typeof dialog.showModal === 'function') {
  const video = dialog.querySelector('video');
  const error = dialog.querySelector('[role="status"]');
  for (const link of document.querySelectorAll('.demo-preview')) {
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      dialog.querySelector('#demo-title').textContent = link.querySelector('img').alt;
      dialog.querySelector('.demo-original').href = link.dataset.original;
      error.hidden = true;
      dialog.showModal();
      video.src = link.href;
      video.play().catch(() => {
        // Native controls remain available if the browser blocks autoplay.
      });
    });
  }
  video.addEventListener('error', () => { if (dialog.open) error.hidden = false; });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
  });
}
