// Memos API helpers
// 依赖: fetchJson (来自 utils.js)

(function () {
  function normalizeHost(host) {
    return (host || '').replace(/\/$/, '');
  }

  function buildListUrl(memoConfig, params) {
    var cfg = memoConfig || {};
    var host = normalizeHost(cfg.host);
    var apiVersion = cfg.APIVersion || 'new';
    var pageSize = params && params.pageSize;
    var pageToken = params && params.pageToken;
    var tag = params && params.tag;
    var offset = params && params.offset;

    if (apiVersion === 'new') {
      var base = host + '/api/v1/memos?parent=users/' + cfg.creatorId;
      if (pageSize) base += '&pageSize=' + pageSize;
      if (pageToken) base += '&pageToken=' + pageToken;
      // 新版暂不提供 tag 过滤参数，使用客户端过滤
      return base;
    }

    // legacy
    var legacyBase = host + '/api/v1/memo?creatorId=' + cfg.creatorId + '&rowStatus=NORMAL';
    if (pageSize) legacyBase += '&limit=' + pageSize;
    if (typeof offset === 'number') legacyBase += '&offset=' + offset;
    if (tag) legacyBase += '&tag=' + encodeURIComponent(tag);
    return legacyBase;
  }

  function fetchList(memoConfig, params, options) {
    var url = buildListUrl(memoConfig, params || {});
    return fetchJson(url, options);
  }

  function buildStatsUrl(memoConfig) {
    var cfg = memoConfig || {};
    var host = normalizeHost(cfg.host);
    var apiVersion = cfg.APIVersion || 'new';
    if (apiVersion === 'new') {
      return host + '/api/v1/users/' + cfg.creatorId + ':getStats';
    }
    return host + '/api/v1/memo/stats?creatorId=' + cfg.creatorId;
  }

  function fetchStats(memoConfig, options) {
    var url = buildStatsUrl(memoConfig);
    return fetchJson(url, options);
  }

  // 导出全局
  window.memoApi = {
    buildListUrl: buildListUrl,
    fetchList: fetchList,
    buildStatsUrl: buildStatsUrl,
    fetchStats: fetchStats,
  };
})();
