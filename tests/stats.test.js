const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const mainSource = fs.readFileSync(path.join(__dirname, '../assets/js/main.js'), 'utf8');
const siteInit = mainSource.split('// ========== 配置 marked ==========')[0];

function renderStats(stats, hasContainer = true) {
  const container = { innerHTML: '', style: { display: 'none' } };
  const scripts = [];
  vm.runInNewContext(siteInit, {
    siteConfig: { stats, memos: {}, footer: {} },
    document: {
      getElementById: (id) => hasContainer && id === 'site-stats' ? container : null,
      createElement: () => ({}),
      head: {
        appendChild(script) {
          // Both providers' targets must exist even if a cached script runs immediately.
          assert.match(container.innerHTML, /id="busuanzi_site_pv"|id="busuanzi_site_uv"/);
          assert.match(container.innerHTML, /id="busuanzi_value_site_pv"|id="busuanzi_value_site_uv"/);
          scripts.push(script);
        },
      },
    },
  });
  return { container, scripts };
}

test('loads both counters independently after creating separate PV/UV targets', () => {
  const { container, scripts } = renderStats({ enabled: true, showPV: true, showUV: true });
  assert.equal(container.style.display, 'inline');
  assert.doesNotMatch(container.innerHTML, /busuanzi\.cc|ibruce\.info/);
  assert.deepEqual(
    [...container.innerHTML.matchAll(/id="([^"]+)"/g)].map((match) => match[1]),
    ['busuanzi_site_pv', 'busuanzi_site_uv', 'busuanzi_value_site_pv', 'busuanzi_value_site_uv'],
  );
  assert.deepEqual(scripts.map((script) => new URL(script.src).hostname), [
    'cdn.busuanzi.cc', 'busuanzi.ibruce.info',
  ]);
  assert(scripts.every((script) => script.async === true));
});

test('honors the PV/UV switches for both providers', () => {
  for (const metric of ['pv', 'uv']) {
    const { container, scripts } = renderStats({
      enabled: true, showPV: metric === 'pv', showUV: metric === 'uv',
    });
    const ids = [...container.innerHTML.matchAll(/id="([^"]+)"/g)].map((match) => match[1]);
    assert.deepEqual(ids, ['busuanzi_site_' + metric, 'busuanzi_value_site_' + metric]);
    assert.equal(scripts.length, 2);
  }
});

test('makes no analytics requests when disabled, hidden, or missing its container', () => {
  for (const stats of [undefined, { enabled: false, showPV: true, showUV: true }, { enabled: true }]) {
    const { container, scripts } = renderStats(stats);
    assert.equal(scripts.length, 0);
    assert.equal(container.style.display, 'none');
  }
  assert.equal(renderStats({ enabled: true, showPV: true }, false).scripts.length, 0);
});

test('both entry pages load the shared initializer without counting a visit twice', () => {
  for (const entry of ['index.html', 'memos/index.html']) {
    const html = fs.readFileSync(path.join(__dirname, '..', entry), 'utf8');
    assert.equal((html.match(/src="\/?assets\/js\/main\.js\?v=[^"]+" defer/g) || []).length, 1);
    assert.doesNotMatch(html, /<script[^>]+src="https:\/\/(?:cdn\.busuanzi\.cc|busuanzi\.ibruce\.info)/);
  }
});
