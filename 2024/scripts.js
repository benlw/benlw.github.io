window.MathJax = {
  tex: {
    inlineMath: [['$', '$']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']]
  },
  svg: {
    fontCache: 'global'
  },
  loader: {
    load: ['output/svg', 'input/tex']
  }
};

function toggleImage(pngId, gifId, buttonId) {
  var gif = document.getElementById(gifId);
  var png = document.getElementById(pngId);
  var button = document.getElementById(buttonId);

  // 检查 GIF 是否已加载
  if (gif.getAttribute('src') === '') {
    // 如果没有，设置 GIF 的源
    gif.setAttribute('src', gif.getAttribute('data-gif'));
  }

  // 切换图片的可见性
  if (gif.style.display === 'none') {
    gif.style.display = 'block';
    png.style.display = 'none';
    button.textContent = button.getAttribute('data-text'); // 设置按钮文本为“显示 PNG”
  } else {
    gif.style.display = 'none';
    png.style.display = 'block';
    button.textContent = '显示 GIF'; // 设置按钮文本为“显示 GIF”
  }
}

function showAnimation(bgId) {
  var animation = document.getElementById(bgId);
  var body = document.body;

  animation.style.display = 'flex';
  body.style.overflow = 'hidden'; // 禁止滚动
}

function hideAnimation(bgId) {
  var animation = document.getElementById(bgId);
  var body = document.body;

  animation.style.display = 'none';
  body.style.overflow = ''; // 重新允许滚动
}