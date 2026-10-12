const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
// Load just these TypeScript modules without a build or network access.
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
};
const originalLoad = Module._load;
Module._load = function(name, ...args) {
  if (name === 'server-only') return {};
  if (name === 'react') return { cache: fn => fn };
  return originalLoad.call(this, name, ...args);
};
const { renderBlocks, richText } = require('../src/lib/notion/render.ts');
const { getArticles, getArticle } = require('../src/lib/notion/articles.ts');
const text = (content, annotations) => ({ plain_text: content, annotations });
const paragraph = (id, content) => ({ id, type: 'paragraph', paragraph: { rich_text: [text(content)] } });
const page = (id) => ({ id, properties: { Name: { type: 'title', title: [text('Published article')] }, '발행일': { date: { start: '2026-09-11' } } } });
const list = (results, next_cursor = null) => ({ results, has_more: !!next_cursor, next_cursor });

test('Notion formatting, nested lists and toggle content survive conversion', () => {
  assert.match(richText([text('color', { color: 'pink', bold: true, underline: true })]), /color:#c14c8a.*<u><strong>color/);
  assert.match(richText([text('highlight', { color: 'yellow_background' })]), /background-color:#fbf3db/);
  const html = renderBlocks([
    { id: 'a', type: 'numbered_list_item', numbered_list_item: { rich_text: [text('one')] } },
    { id: 'b', type: 'numbered_list_item', numbered_list_item: { rich_text: [text('two')] }, children: [paragraph('nested', 'nested')] },
    { id: 'c', type: 'toggle', toggle: { rich_text: [text('open')] }, children: [paragraph('hidden', 'inside')] },
  ]);
  assert.equal((html.match(/<ol>/g) || []).length, 1);
  assert.match(html, /<details.*<summary>open<\/summary>.*inside/);
  assert.match(html, /nested/);
});
test('untrusted text, URLs and attributes cannot inject HTML', () => {
  const html = richText([{ plain_text: '<script>alert(1)</script>', href: 'javascript:alert(1)' }]);
  assert.ok(!html.includes('<script>') && !html.includes('href='));
  const image = renderBlocks([{ id: '" onclick="bad', type: 'image', image: { external: { url: 'https://example.com/"onerror="x' }, caption: [text('<img>')] } }]);
  assert.ok(image.includes('&quot;') && image.includes('&lt;img&gt;'));
  const embed = renderBlocks([{ id: 'x', type: 'embed', embed: { url: 'https://evil.example/test' } }]);
  assert.ok(!embed.includes('<iframe'));
  const youtube = renderBlocks([{ id: 'y', type: 'video', video: { external: { url: 'https://youtu.be/lulVKvifTGA' } } }]);
  assert.match(youtube, /youtube-nocookie.com\/embed\/lulVKvifTGA/);
});
test('unsupported blocks fail visibly rather than silently losing content', () => {
  assert.throws(() => renderBlocks([{ id: 'u', type: 'unsupported' }]), /Unsupported Notion block/);
});
test('legacy articles remain available without credentials', async () => {
  delete process.env.NOTION_TOKEN; delete process.env.NOTION_DATABASE_ID;
  assert.equal((await getArticles())[0].id, 29);
});
test('published page and block pagination, migration and unpublished access', async () => {
  process.env.NOTION_TOKEN = 'test-only'; process.env.NOTION_DATABASE_ID = 'db'; process.env.NOTION_DATA_SOURCE_ID = 'source';
  let published = true;
  global.fetch = async (url, options) => {
    assert.equal(options.cache, 'no-store');
    assert.equal(options.headers.Authorization, 'Bearer test-only');
    let result;
    if (url.includes('/query')) {
      const body = JSON.parse(options.body);
      assert.deepEqual(body.filter, { property: '상태', status: { equals: '발행' } });
      result = !published ? list([]) : body.start_cursor ? list([page('new-page')]) : list([page('3c72eb31-d2d7-808f-934a-e4c482b99c99')], 'next-pages');
    } else result = url.includes('start_cursor=') ? list([paragraph('last', 'last block')]) : list([paragraph('first', 'first block')], 'next-blocks');
    return new Response(JSON.stringify(result), { status: 200 });
  };
  const articles = await getArticles();
  assert.equal(articles.filter(a => a.id === 29).length, 1);
  assert.ok(articles.some(a => a.id === 'newpage'));
  const article = await getArticle('29');
  assert.match(article.notionHtml, /first block.*last block/);
  assert.equal(article.content, '');
  published = false;
  assert.equal(await getArticle('29'), undefined);
  assert.equal(await getArticle('newpage'), undefined);
});
test('Notion API errors are not mistaken for an empty or legacy feed', async () => {
  global.fetch = async () => new Response('{}', { status: 401 });
  await assert.rejects(getArticles(), /401/);
});
