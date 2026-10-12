// Notion content is untrusted: all text and attributes are escaped; embeds are allowlisted.
export type RichText = {
  plain_text?: string; text?: { content: string; link?: { url: string } | null };
  href?: string | null; equation?: { expression: string };
  annotations?: { bold?: boolean; italic?: boolean; strikethrough?: boolean; underline?: boolean; code?: boolean; color?: string };
};
export type BlockData = {
  rich_text?: RichText[]; caption?: RichText[]; color?: string; url?: string;
  external?: { url: string }; file?: { url: string }; name?: string;
  checked?: boolean; is_toggleable?: boolean; expression?: string;
  cells?: RichText[][]; has_column_header?: boolean; has_row_header?: boolean;
  icon?: { type: string; emoji?: string }; title?: string;
  synced_from?: { block_id: string } | null;
};
export type Block = { id: string; type: string; has_children?: boolean; archived?: boolean; in_trash?: boolean; children?: Block[]; [key: string]: unknown };
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export function safeUrl(value: string | undefined): string {
  if (!value) return '';
  try { const url = new URL(value); return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? value : ''; } catch { return ''; }
}
const colors: Record<string, string> = {
  gray: '#787774', brown: '#9f6b53', orange: '#d9730d', yellow: '#cb912f', green: '#448361', blue: '#337ea9', purple: '#9065b0', pink: '#c14c8a', red: '#d44c47',
  gray_background: '#f1f1ef', brown_background: '#f4eeee', orange_background: '#fbecdd', yellow_background: '#fbf3db', green_background: '#edf3ec', blue_background: '#e7f3f8', purple_background: '#f4f0f7', pink_background: '#f9eef3', red_background: '#fdebec',
};
function colorStyle(color?: string) { return color && colors[color] ? `${color.endsWith('_background') ? 'background-color' : 'color'}:${colors[color]}` : ''; }
export function richText(items: RichText[] = []): string {
  return items.map(item => {
    let text = escapeHtml(item.plain_text ?? item.text?.content ?? item.equation?.expression ?? '');
    const a = item.annotations ?? {};
    if (a.code) text = `<code>${text}</code>`;
    if (a.bold) text = `<strong>${text}</strong>`;
    if (a.italic) text = `<em>${text}</em>`;
    if (a.strikethrough) text = `<s>${text}</s>`;
    if (a.underline) text = `<u>${text}</u>`;
    if (colorStyle(a.color)) text = `<span style="${colorStyle(a.color)}">${text}</span>`;
    const href = safeUrl(item.href ?? item.text?.link?.url);
    return href ? `<a href="${escapeHtml(href)}" rel="noopener noreferrer">${text}</a>` : text;
  }).join('');
}
function embedUrl(value: string): string {
  try {
    const u = new URL(value);
    if (['www.youtube.com', 'youtube.com', 'youtu.be', 'www.youtube-nocookie.com'].includes(u.hostname)) {
      const id = u.hostname === 'youtu.be' ? u.pathname.slice(1) : u.pathname.startsWith('/embed/') ? u.pathname.split('/')[2] : u.searchParams.get('v');
      if (id && /^[\w-]{11}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (u.hostname === 'vimeo.com' && /^\/\d+$/.test(u.pathname)) return `https://player.vimeo.com/video${u.pathname}`;
    if (u.hostname === 'open.spotify.com' && /^\/(embed\/)?(track|album|playlist|episode)\/[a-zA-Z0-9]+$/.test(u.pathname)) return `https://open.spotify.com/embed/${u.pathname.replace(/^\/(embed\/)?/, '')}`;
  } catch { /* invalid URL is omitted */ }
  return '';
}
export function renderBlocks(blocks: Block[]): string {
  let html = '';
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.archived || b.in_trash) continue;
    const d = (b[b.type] ?? {}) as BlockData;
    const text = richText(d.rich_text);
    const children = renderBlocks(b.children ?? []);
    const style = colorStyle(d.color);
    const attrs = ` id="${escapeHtml(b.id)}"${style ? ` style="${style}"` : ''}`;
    if (b.type === 'bulleted_list_item' || b.type === 'numbered_list_item') {
      const tag = b.type === 'bulleted_list_item' ? 'ul' : 'ol';
      html += `<${tag}>`;
      do {
        const item = blocks[i], data = item[item.type] as BlockData;
        html += `<li style="${colorStyle(data.color)}">${richText(data.rich_text)}${renderBlocks(item.children ?? [])}</li>`;
        i++;
      } while (i < blocks.length && blocks[i].type === b.type);
      i--; html += `</${tag}>`; continue;
    }
    switch (b.type) {
      case 'paragraph': html += `<div${attrs} class="notion-paragraph">${text || '<br>'}${children}</div>`; break;
      case 'heading_1': case 'heading_2': case 'heading_3': {
        const tag = `h${Number(b.type.slice(-1)) + 1}`;
        const heading = `<${tag}${attrs}>${text}</${tag}>`;
        html += d.is_toggleable ? `<details><summary>${heading}</summary>${children}</details>` : heading + children; break;
      }
      case 'quote': html += `<blockquote${attrs}>${text}${children}</blockquote>`; break;
      case 'callout': html += `<aside${attrs} class="notion-callout">${escapeHtml(d.icon?.emoji ?? '')} ${text}${children}</aside>`; break;
      case 'toggle': html += `<details${attrs}><summary>${text}</summary>${children}</details>`; break;
      case 'to_do': html += `<div${attrs}><input type="checkbox" disabled${d.checked ? ' checked' : ''}> ${text}${children}</div>`; break;
      case 'divider': html += '<hr>'; break;
      case 'code': html += `<pre${attrs}><code>${escapeHtml((d.rich_text ?? []).map(t => t.plain_text ?? t.text?.content ?? '').join(''))}</code></pre>`; break;
      case 'column_list': html += `<div class="notion-columns">${children}</div>`; break;
      case 'column': html += `<div class="notion-column">${children}</div>`; break;
      case 'synced_block': html += children; break;
      case 'table': html += `<div class="notion-table"><table><tbody>${(b.children ?? []).map((row, index) => `<tr>${((row.table_row as BlockData).cells ?? []).map((cell, col) => { const tag = (d.has_column_header && index === 0) || (d.has_row_header && col === 0) ? 'th' : 'td'; return `<${tag}>${richText(cell)}</${tag}>`; }).join('')}</tr>`).join('')}</tbody></table></div>`; break;
      case 'image': case 'video': case 'audio': case 'file': case 'pdf': case 'embed': case 'bookmark': case 'link_preview': {
        const url = safeUrl(d.file?.url ?? d.external?.url ?? d.url);
        if (!url) break;
        const escaped = escapeHtml(url), caption = richText(d.caption), embed = embedUrl(url);
        if (b.type === 'image') html += `<figure><img src="${escaped}" alt="${escapeHtml((d.caption ?? []).map(t => t.plain_text ?? '').join(''))}" loading="lazy"><figcaption>${caption}</figcaption></figure>`;
        else if (embed) html += `<figure><iframe src="${escapeHtml(embed)}" title="${escapeHtml(d.name ?? '미디어')}" loading="lazy" allow="fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe><figcaption>${caption}</figcaption></figure>`;
        else if (b.type === 'video' && (d.file || /\.(mp4|webm|ogg)(\?|$)/i.test(url))) html += `<figure><video controls preload="metadata" src="${escaped}"></video><figcaption>${caption}</figcaption></figure>`;
        else if (b.type === 'audio') html += `<figure><audio controls src="${escaped}"></audio><figcaption>${caption}</figcaption></figure>`;
        else html += `<p><a href="${escaped}" rel="noopener noreferrer">${caption || escapeHtml(d.name ?? url)}</a></p>`;
        break;
      }
      case 'equation': html += `<pre>${escapeHtml(d.expression ?? '')}</pre>`; break;
      case 'table_of_contents': break;
      default: throw new Error(`Unsupported Notion block: ${b.type}`);
    }
  }
  return html;
}
