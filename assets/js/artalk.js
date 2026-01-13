// Artalk 相关逻辑：评论切换与暗色模式同步

var artalkInstances = {};

function getIsDarkTheme() {
  return document.body.classList.contains('dark-theme') ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches &&
     !document.body.classList.contains('light-theme'));
}

function toggleArtalk(memoId) {
  if (!siteConfig.artalk || !siteConfig.artalk.enabled) return;
  if (typeof Artalk === 'undefined') {
    console.warn('Artalk not loaded');
    return;
  }

  var container = document.querySelector('.artalk-container-' + memoId);
  if (!container) return;

  var isHidden = container.style.display === 'none' || container.style.display === '';

  // 隐藏其他评论容器
  document.querySelectorAll('.memo-comment').forEach(function (el) {
    el.style.display = 'none';
  });

  if (isHidden) {
    container.style.display = 'block';

    if (!artalkInstances[memoId]) {
      var pageKey = '/memos/' + memoId;
      artalkInstances[memoId] = Artalk.init({
        el: '#artalk-' + memoId,
        pageKey: pageKey,
        pageTitle: 'Memo ' + memoId,
        server: siteConfig.artalk.server,
        site: siteConfig.artalk.site,
        darkMode: getIsDarkTheme(),
      });
    }

    setTimeout(function () {
      container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }
}

function updateArtalkDarkMode() {
  var isDark = getIsDarkTheme();
  Object.values(artalkInstances).forEach(function (instance) {
    if (instance && typeof instance.setDarkMode === 'function') {
      instance.setDarkMode(isDark);
    }
  });
}
