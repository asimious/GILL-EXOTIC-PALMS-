(function () {
  if (window.__gepTrail) return;
  window.__gepTrail = true;
  if (window.matchMedia('(hover: none)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var SVG = '<svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">'
    + '<path d="M12 2.5 6.5 10h11L12 2.5Z" fill="#2C5138"/>'
    + '<path d="M12 8 5 16.5h14L12 8Z" fill="#1E3A2B"/>'
    + '<path d="M10.7 16.5h2.6V22h-2.6Z" fill="#7A5B32"/></svg>';
  var SVG_LIGHT = '<svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">'
    + '<path d="M12 2.5 6.5 10h11L12 2.5Z" fill="#FFFFFF"/>'
    + '<path d="M12 8 5 16.5h14L12 8Z" fill="#F0EEE3"/>'
    + '<path d="M10.7 16.5h2.6V22h-2.6Z" fill="#E4D9C2"/></svg>';
  var sizes = [17, 13, 10], lag = [0.20, 0.13, 0.085];
  var mx = window.innerWidth / 2, my = window.innerHeight / 2, seen = false;
  var trees = [];
  function makeTrees() {
    trees = sizes.map(function (s, i) {
    var el = document.createElement('div');
    el.id = 'gep-trail-' + i;
    el.className = 'gep-trail';
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = 'position:fixed;left:0;top:0;width:' + s + 'px;height:' + s + 'px;pointer-events:none;z-index:9999;opacity:0;will-change:transform;transition:opacity .3s;filter:drop-shadow(0 1px 1px rgba(20,41,31,0.25))';
    el.innerHTML = SVG;
    document.body.appendChild(el);
    return { el: el, x: mx, y: my, k: lag[i], s: s };
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', makeTrees);
  else makeTrees();
  var onLight = false, lastCheck = 0;
  function bgAt(x, y) {
    var el = document.elementFromPoint(x, y);
    while (el && el !== document.documentElement) {
      if (el.tagName === 'IMG' || el.tagName === 'VIDEO') return null;
      var cs = getComputedStyle(el);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
      var bg = cs.backgroundColor;
      var m = bg && bg.match(/rgba?\(([^)]+)\)/);
      if (m) {
        var p = m[1].split(',').map(parseFloat);
        if (p.length < 4 || p[3] > 0.55) return p;
      }
      el = el.parentElement;
    }
    return null;
  }
  function updateTint(x, y) {
    var p = bgAt(x, y);
    var light;
    if (!p) light = false;
    else {
      var lum = (0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]) / 255;
      var green = p[1] >= p[0] && p[1] >= p[2];
      light = lum < 0.55 || (green && lum < 0.72);
    }
    if (light === onLight) return;
    onLight = light;
    trees.forEach(function (t) {
      t.el.innerHTML = light ? SVG_LIGHT : SVG;
      t.el.style.filter = light ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))' : 'drop-shadow(0 1px 1px rgba(20,41,31,0.25))';
    });
  }
  window.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!seen) { seen = true; trees.forEach(function (t) { t.el.style.opacity = '0.92'; }); }
    var now = Date.now();
    if (now - lastCheck > 90) { lastCheck = now; updateTint(e.clientX, e.clientY); }
  }, { passive: true });
  document.addEventListener('mouseleave', function () { trees.forEach(function (t) { t.el.style.opacity = '0'; }); });
  document.addEventListener('mouseenter', function () { if (seen) trees.forEach(function (t) { t.el.style.opacity = '0.92'; }); });
  (function frame() {
    var tx = mx, ty = my;
    trees.forEach(function (t) {
      t.x += (tx - t.x) * t.k;
      t.y += (ty - t.y) * t.k;
      t.el.style.transform = 'translate(' + (t.x - t.s / 2) + 'px,' + (t.y - t.s / 2 + 10) + 'px)';
      tx = t.x; ty = t.y;
    });
    requestAnimationFrame(frame);
  })();
})();
