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

// function showAnimation(bgId) {
//   var animation = document.getElementById(bgId);
//   var body = document.body;

//   animation.style.display = 'flex';
//   body.style.overflow = 'hidden'; // 禁止滚动
// }

function showAnimation(bgId, progressBarId) {
  var animation = document.getElementById(bgId);
  var progressBar = document.getElementById(progressBarId);
  var overlay = progressBar.closest('.loading-overlay');
  var img = animation.querySelector('img');
  var body = document.body;

  // 初始化显示
  animation.style.display = 'flex';
  overlay.style.display = 'flex';
  body.style.overflow = 'hidden'; // 禁止滚动
  img.style.display = 'none';  // 初始时隐藏图片

  // 图片加载完成后的操作
  function handleImageLoad() {
      progressBar.style.width = '100%'; // 设置进度条为100%
      setTimeout(() => {
          overlay.style.display = 'none';  // 隐藏覆盖层
          img.style.display = 'block';  // 显示图片
      }, 500); // 延迟500毫秒以给予用户视觉反馈
  }

  // 检查图片是否已加载
  if (img.complete && img.naturalHeight !== 0) {
      handleImageLoad();  // 如果图片已经加载
  } else {
      img.onload = handleImageLoad;  // 设置图片加载完成后的操作
      // 模拟进度条
      let width = 0;
      var interval = setInterval(() => {
          width += 10;
          progressBar.style.width = width + '%';
          if (width >= 100) {
              clearInterval(interval);
              handleImageLoad();  // 确保图片加载后处理逻辑执行
          }
      }, 100);
  }
} 

// function showAnimation(bgId, progressBarId) {
//   var animation = document.getElementById(bgId);
//   var progressBar = document.getElementById(progressBarId);
//   var overlay = progressBar.closest('.loading-overlay');
//   var img = animation.querySelector('img');
//   var body = document.body;

//   // 显示动画和覆盖层
//   animation.style.display = 'flex';
//   overlay.style.display = 'flex';
//   body.style.overflow = 'hidden'; // 禁止滚动

//   img.style.opacity = 0; // 确保开始时图片是不可见的

//   // 图片加载完成后的操作
//   function handleImageLoad() {
//       progressBar.style.width = '100%';
//       setTimeout(() => {
//           overlay.style.display = 'none';
//           img.style.opacity = 1; // 在覆盖层隐藏后显示图片
//       }, 500); // 略有延迟，确保进度条完全填满
//   }

//   // 检查图片是否已加载
//   if (img.complete && img.naturalHeight !== 0) {
//       handleImageLoad();
//   } else {
//       img.onload = handleImageLoad;
//       let width = 0;
//       var interval = setInterval(() => {
//           width += 10;
//           progressBar.style.width = width + '%';
//           if (width >= 100) {
//               clearInterval(interval);
//               handleImageLoad(); // 确保图片加载后处理逻辑执行
//           }
//       }, 100);
//   }
// }

function hideAnimation(bgId) {
  var animation = document.getElementById(bgId);
  var body = document.body;

  animation.style.display = 'none';
  body.style.overflow = ''; // 重新允许滚动
}

function simulateLoadingProgress(progressBar, overlay) {
  var width = 0;
  var interval = setInterval(function() {
      if (width >= 100) {
          clearInterval(interval);
          overlay.style.display = 'none'; // 隐藏加载覆盖层
      } else {
          width++;
          progressBar.style.width = width + '%';
      }
  }, 100); // 调整时间间隔以匹配实际加载时间
}
