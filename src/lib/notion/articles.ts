import 'server-only';
import { cache } from 'react';
import { articleDetails } from '../articleDetails';
import { renderBlocks, safeUrl, type Block, type BlockData, type RichText } from './render';

export type Article = {
  id: number | string; title: string; subtitle: string; category: string; tagColor: string;
  imageUrl: string; date: string; author: string; content: string; notionPageId?: string;
};
type Property = {
  type: string; title?: RichText[]; rich_text?: RichText[]; status?: { name: string };
  select?: { name: string }; multi_select?: { name: string }[];
  people?: { name?: string }[]; date?: { start: string }; files?: BlockData[];
};
type Page = { id: string; archived?: boolean; in_trash?: boolean; properties: Record<string, Property>; cover?: BlockData };
type List<T> = { results: T[]; has_more: boolean; next_cursor: string | null };
const legacyMapping: Record<string, number> = { '3c72eb31d2d7808f934ae4c482b99c99': 29 };
const compact = (id: string) => id.replace(/-/g, '');
const plain = (items: RichText[] = []) => items.map(t => t.plain_text ?? t.text?.content ?? '').join('');
const configured = () => Boolean(process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID);

async function request<T>(path: string, body?: unknown): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`https://api.notion.com/v1/${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${process.env.NOTION_TOKEN}`, 'Notion-Version': '2025-09-03', 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      // Always refresh access and signed media URLs; requests are deduplicated per render by React cache.
      cache: 'no-store', signal: AbortSignal.timeout(15000),
    });
    if ((response.status === 429 || response.status >= 500) && attempt < 2) {
      await new Promise(resolve => setTimeout(resolve, Math.min(Number(response.headers.get('retry-after') || 1), 5) * 1000));
      continue;
    }
    if (!response.ok) throw new Error(`Notion request failed (${response.status})`);
    return response.json() as Promise<T>;
  }
  throw new Error('Notion temporarily unavailable');
}
const dataSource = cache(async () => {
  if (process.env.NOTION_DATA_SOURCE_ID) return process.env.NOTION_DATA_SOURCE_ID;
  const db = await request<{ data_sources: { id: string }[] }>(`databases/${process.env.NOTION_DATABASE_ID}`);
  if (db.data_sources.length !== 1) throw new Error('Set NOTION_DATA_SOURCE_ID for a database with multiple data sources');
  return db.data_sources[0].id;
});
function value(p?: Property): string {
  if (!p) return '';
  return plain(p.title ?? p.rich_text) || p.select?.name || p.multi_select?.map(v => v.name).join(', ') || p.people?.map(v => v.name ?? '').join(', ') || '';
}
function toArticle(page: Page): Article {
  const p = page.properties;
  const id = legacyMapping[compact(page.id)] ?? compact(page.id);
  const previous = articleDetails.find(a => a.id === id);
  const cover = p['커버 이미지 (1600x1200)']?.files?.[0] ?? p['표지 이미지']?.files?.[0] ?? page.cover;
  return {
    id, notionPageId: page.id, title: value(Object.values(p).find(v => v.type === 'title')),
    subtitle: value(p['Sub title (~50)']), category: value(p['프로젝트']) || 'Article',
    tagColor: previous?.tagColor ?? '#37352f',
    imageUrl: safeUrl(cover?.file?.url ?? cover?.external?.url) || previous?.imageUrl || '/placeholder.png',
    date: p['발행일']?.date?.start?.slice(0, 10) ?? '', author: value(p.Writer) || value(p['사람']), content: '',
  };
}
export const getArticles = cache(async (): Promise<Article[]> => {
  if (!configured()) return [...articleDetails].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  const source = await dataSource();
  const published: Article[] = [];
  let cursor: string | null = null;
  do {
    const page: List<Page> = await request(`data_sources/${source}/query`, {
      page_size: 100, ...(cursor ? { start_cursor: cursor } : {}),
      filter: { property: process.env.NOTION_STATUS_PROPERTY || '상태', status: { equals: process.env.NOTION_PUBLISHED_STATUS || '발행' } },
    });
    for (const item of page.results) {
      if (!item.archived && !item.in_trash) published.push(toArticle(item));
    }
    cursor = page.has_more ? page.next_cursor : null;
  } while (cursor);
  // Migrated articles are controlled solely by Notion, including unpublishing/deletion.
  const migrated = new Set(Object.values(legacyMapping));
  return [...articleDetails.filter(a => !migrated.has(a.id)), ...published]
    .sort((a, b) => b.date.localeCompare(a.date) || String(b.id).localeCompare(String(a.id), undefined, { numeric: true }));
});
async function getBlocks(id: string, ancestors: Set<string> = new Set()): Promise<Block[]> {
  if (ancestors.has(id) || ancestors.size > 30) throw new Error('Cyclic or deeply nested Notion blocks');
  const nextAncestors = new Set(ancestors).add(id);
  const result: Block[] = [];
  let cursor: string | null = null;
  do {
    const page: List<Block> = await request(`blocks/${id}/children?page_size=100${cursor ? `&start_cursor=${encodeURIComponent(cursor)}` : ''}`);
    for (const block of page.results) {
      if (block.archived || block.in_trash) continue;
      const synced = block.type === 'synced_block' ? (block.synced_block as BlockData).synced_from?.block_id : undefined;
      if (block.has_children || synced) block.children = await getBlocks(synced ?? block.id, nextAncestors);
      result.push(block);
    }
    cursor = page.has_more ? page.next_cursor : null;
  } while (cursor);
  return result;
}
export const getArticle = cache(async (id: string) => {
  const article = (await getArticles()).find(a => String(a.id) === id);
  if (!article) return undefined;
  return article.notionPageId ? { ...article, notionHtml: renderBlocks(await getBlocks(article.notionPageId)) } : { ...article, notionHtml: undefined };
});
