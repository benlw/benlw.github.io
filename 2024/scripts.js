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

function toggleImage() {
    var gif = document.getElementById('animation');
    var png = document.getElementById('image');
    if (gif.style.display === 'none') {
        gif.style.display = 'block';
        png.style.display = 'none';
    } else {
        gif.style.display = 'none';
        png.style.display = 'block';
    }
}