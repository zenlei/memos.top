const test = require('node:test');
const assert = require('node:assert/strict');

const memoApi = require('../assets/js/api.js');

const modernConfig = {
  host: 'https://memos.example.com/',
  creator: 'users/steven',
  APIVersion: 'v0.30',
};

test('builds a Memos v0.30 creator-filtered list URL', () => {
  const url = new URL(memoApi.buildListUrl(modernConfig, {
    pageSize: 10,
    pageToken: 'CAEQAQ==',
  }));

  assert.equal(url.origin, 'https://memos.example.com');
  assert.equal(url.pathname, '/api/v1/memos');
  assert.equal(url.searchParams.get('pageSize'), '10');
  assert.equal(url.searchParams.get('pageToken'), 'CAEQAQ==');
  assert.equal(url.searchParams.get('filter'), 'creator == "users/steven"');
  assert.equal(url.searchParams.has('parent'), false);
});

test('keeps the Memos v0.25 parent query available', () => {
  const v025Config = {
    host: 'https://memos.example.com',
    creatorId: '1',
    APIVersion: 'v0.25',
  };
  const url = new URL(memoApi.buildListUrl(v025Config, { pageSize: 20 }));

  assert.equal(url.searchParams.get('parent'), 'users/1');
  assert.equal(url.searchParams.get('pageSize'), '20');
  assert.equal(url.searchParams.has('filter'), false);
  assert.equal(
    memoApi.buildStatsUrl(v025Config),
    'https://memos.example.com/api/v1/users/1:getStats',
  );
  assert.equal(
    memoApi.buildAvatarUrl(v025Config),
    'https://memos.example.com/api/v1/users/1/avatar',
  );
});

test('keeps legacy list parameters compatible', () => {
  const url = new URL(memoApi.buildListUrl({
    host: 'https://memos.example.com',
    creatorId: '101',
    APIVersion: 'legacy',
  }, { pageSize: 10, offset: 20, tag: '声学' }));

  assert.equal(url.pathname, '/api/v1/memo');
  assert.equal(url.searchParams.get('creatorId'), '101');
  assert.equal(url.searchParams.get('rowStatus'), 'NORMAL');
  assert.equal(url.searchParams.get('limit'), '10');
  assert.equal(url.searchParams.get('offset'), '20');
  assert.equal(url.searchParams.get('tag'), '声学');
});

test('builds current stats, detail, and avatar URLs', () => {
  assert.equal(
    memoApi.buildStatsUrl(modernConfig),
    'https://memos.example.com/api/v1/users/steven:getStats',
  );
  assert.equal(
    memoApi.buildDetailUrl(modernConfig, 'memo id'),
    'https://memos.example.com/api/v1/memos/memo%20id',
  );
  assert.equal(
    memoApi.buildAvatarUrl(modernConfig),
    'https://memos.example.com/file/users/steven/avatar',
  );
});

test('recognizes the Memos v0.30 private-instance response', () => {
  assert.equal(memoApi.isPrivateInstanceError({ status: 401, code: 16 }), true);
  assert.equal(memoApi.isPrivateInstanceError({ status: 401, message: 'authentication required' }), true);
  assert.equal(memoApi.isPrivateInstanceError({ status: 403, code: 16 }), false);
});

test('uses modern attachment handling for every non-legacy API mode', () => {
  const mainSource = require('node:fs').readFileSync(
    require('node:path').join(__dirname, '../assets/js/main.js'),
    'utf8',
  );

  assert.equal(mainSource.includes("apiVersion === 'new'"), false);
});
