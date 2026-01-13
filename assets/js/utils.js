// 通用工具函数：fetch 包装与 HTML 清洗

function fetchJson(url, { timeout = 15000, onError } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { signal: controller.signal })
    .then(res => {
      clearTimeout(timer);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .catch(err => {
      clearTimeout(timer);
      if (typeof onError === 'function') onError(err);
      throw err;
    });
}

function sanitizeHtml(dirtyHtml, { memosHost = '', trustedIframeRules = [] } = {}) {
  if (typeof DOMPurify === 'undefined') {
    console.warn('DOMPurify not found, skip sanitize');
    return dirtyHtml;
  }

  const memosHostUrl = (() => {
    try {
      if (!memosHost) return null;
      return new URL(memosHost);
    } catch (_) {
      return null;
    }
  })();

  function isTrustedIframe(urlObj) {
    return trustedIframeRules.some(rule =>
      urlObj.host === rule.host && urlObj.pathname.startsWith(rule.pathPrefix)
    );
  }

  function normalizeUrl(value) {
    try {
      const normalized = value.startsWith('//') ? `https:${value}` : value;
      return new URL(normalized, memosHostUrl || window.location.origin);
    } catch (_) {
      return null;
    }
  }

  const attrHook = function(node, data) {
    if (data.attrName !== 'src' && data.attrName !== 'href') return;

    const urlObj = normalizeUrl(data.attrValue);
    if (!urlObj) {
      data.keepAttr = false;
      return;
    }

    if (node.nodeName === 'IFRAME') {
      if (!isTrustedIframe(urlObj)) {
        data.keepAttr = false;
      }
    }
  };

  DOMPurify.addHook('uponSanitizeAttribute', attrHook);
  const clean = DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ['p','a','strong','em','code','pre','ul','ol','li','img','iframe','blockquote','span','div','br','video','source'],
    ALLOWED_ATTR: ['href','src','alt','title','target','rel','class','width','height','allow','allowfullscreen','frameborder','style','loading'],
    ALLOW_DATA_ATTR: false
  });
  DOMPurify.removeHook('uponSanitizeAttribute', attrHook);
  return clean;
}
