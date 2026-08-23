// Memos API helpers
// 依赖: fetchJson (来自 utils.js)

(function (root) {
  function normalizeHost(host) {
    return (host || '').replace(/\/+$/, '');
  }

  function normalizeApiVersion(apiVersion) {
    if (apiVersion === 'legacy') return 'legacy';
    if (apiVersion === 'v0.25') return 'v0.25';
    return 'v0.30';
  }

  function getCreatorName(memoConfig) {
    var cfg = memoConfig || {};
    var creator = cfg.creator || cfg.creatorName || cfg.creatorId || '';
    creator = String(creator).trim();
    if (!creator) return '';
    return creator.indexOf('users/') === 0 ? creator : 'users/' + creator;
  }

  function getCreatorId(memoConfig) {
    var cfg = memoConfig || {};
    var creatorId = cfg.creatorId || cfg.creator || cfg.creatorName || '';
    creatorId = String(creatorId).trim();
    return creatorId.indexOf('users/') === 0 ? creatorId.slice('users/'.length) : creatorId;
  }

  function escapeFilterString(value) {
    return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function buildModernFilter(memoConfig, params) {
    var filters = [];
    var creatorName = getCreatorName(memoConfig);
    if (creatorName) {
      filters.push('creator == "' + escapeFilterString(creatorName) + '"');
    }
    if (params && params.filter) {
      filters.push('(' + params.filter + ')');
    }
    return filters.join(' && ');
  }

  function appendQuery(base, params) {
    var query = [];
    Object.keys(params).forEach(function (key) {
      var value = params[key];
      if (value === undefined || value === null || value === '') return;
      query.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    });
    return query.length ? base + '?' + query.join('&') : base;
  }

  function buildListUrl(memoConfig, params) {
    var cfg = memoConfig || {};
    var host = normalizeHost(cfg.host);
    var apiVersion = normalizeApiVersion(cfg.APIVersion);
    var options = params || {};

    if (apiVersion === 'v0.30') {
      return appendQuery(host + '/api/v1/memos', {
        pageSize: options.pageSize,
        pageToken: options.pageToken,
        filter: buildModernFilter(cfg, options),
      });
    }

    if (apiVersion === 'v0.25') {
      return appendQuery(host + '/api/v1/memos', {
        parent: getCreatorId(cfg) ? 'users/' + getCreatorId(cfg) : '',
        pageSize: options.pageSize,
        pageToken: options.pageToken,
      });
    }

    return appendQuery(host + '/api/v1/memo', {
      creatorId: cfg.creatorId,
      rowStatus: 'NORMAL',
      limit: options.pageSize,
      offset: typeof options.offset === 'number' ? options.offset : undefined,
      tag: options.tag,
    });
  }

  function fetchList(memoConfig, params, options) {
    return root.fetchJson(buildListUrl(memoConfig, params || {}), options);
  }

  function buildStatsUrl(memoConfig) {
    var cfg = memoConfig || {};
    var host = normalizeHost(cfg.host);
    var apiVersion = normalizeApiVersion(cfg.APIVersion);
    if (apiVersion === 'v0.30') {
      return host + '/api/v1/' + getCreatorName(cfg) + ':getStats';
    }
    if (apiVersion === 'v0.25') {
      return host + '/api/v1/users/' + encodeURIComponent(getCreatorId(cfg)) + ':getStats';
    }
    return host + '/api/v1/memo/stats?creatorId=' + encodeURIComponent(cfg.creatorId || '');
  }

  function fetchStats(memoConfig, options) {
    return root.fetchJson(buildStatsUrl(memoConfig), options);
  }

  function buildDetailUrl(memoConfig, memoId) {
    var cfg = memoConfig || {};
    var host = normalizeHost(cfg.host);
    var apiVersion = normalizeApiVersion(cfg.APIVersion);
    var normalizedId = memoId || '';

    if (apiVersion !== 'legacy') {
      return host + '/api/v1/memos/' + encodeURIComponent(normalizedId);
    }
    return host + '/api/v1/memo/' + encodeURIComponent(normalizedId);
  }

  function fetchDetail(memoConfig, memoId, options) {
    return root.fetchJson(buildDetailUrl(memoConfig, memoId), options);
  }

  function buildAvatarUrl(memoConfig) {
    var cfg = memoConfig || {};
    var apiVersion = normalizeApiVersion(cfg.APIVersion);
    if (apiVersion === 'legacy') {
      return 'assets/img/avatar.jpg';
    }
    if (apiVersion === 'v0.25') {
      return normalizeHost(cfg.host) + '/api/v1/users/' + encodeURIComponent(getCreatorId(cfg)) + '/avatar';
    }
    return normalizeHost(cfg.host) + '/file/' + getCreatorName(cfg) + '/avatar';
  }

  function isPrivateInstanceError(error) {
    return Boolean(error && error.status === 401 && (error.code === 16 || /authentication required/i.test(error.message || '')));
  }

  var api = {
    normalizeHost: normalizeHost,
    normalizeApiVersion: normalizeApiVersion,
    getCreatorName: getCreatorName,
    getCreatorId: getCreatorId,
    buildListUrl: buildListUrl,
    fetchList: fetchList,
    buildStatsUrl: buildStatsUrl,
    fetchStats: fetchStats,
    buildDetailUrl: buildDetailUrl,
    fetchDetail: fetchDetail,
    buildAvatarUrl: buildAvatarUrl,
    isPrivateInstanceError: isPrivateInstanceError,
  };

  root.memoApi = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
