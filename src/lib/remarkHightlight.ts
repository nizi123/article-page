// src/lib/remarkHighlight.ts
import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { Literal, Parent } from 'unist';

const ALPHA = 0.10; // tagColor '1A' ≈ 10%

function percentToHex(p: number) {
  const n = Math.round(p * 255);
  const h = n.toString(16).toUpperCase().padStart(2, '0');
  return h;
}

function expand3Hex(hex: string) {
  const m = hex.match(/^#([0-9a-fA-F]{3})$/);
  if (!m) return hex;
  const [r, g, b] = m[1].split('');
  return `#${r}${r}${g}${g}${b}${b}`;
}

function bgWithSameDesign(bg: string) {
  bg = bg.trim();

  // 1) #rgb / #rrggbb -> #rrggbbAA
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(bg)) {
    const hex = expand3Hex(bg);
    return `${hex}${percentToHex(ALPHA)}`; // 동일한 10% 알파
  }

  // 2) rgb(r,g,b) -> rgba(r,g,b,0.1)
  const rgb = bg.match(/^rgb\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/i);
  if (rgb) {
    const [, r, g, b] = rgb;
    return `rgba(${r},${g},${b},${ALPHA})`;
  }

  // 3) hsl(h,s%,l%) -> hsla(h,s%,l%,0.1)
  const hsl = bg.match(/^hsl\(\s*([\d.]+)\s*,\s*([\d.]+%)\s*,\s*([\d.]+%)\s*\)$/i);
  if (hsl) {
    const [, h, s, l] = hsl;
    return `hsla(${h},${s},${l},${ALPHA})`;
  }

  // 4) 그 외(색 이름 등) -> color-mix로 10% 연하게
  // 최신 브라우저 대부분 지원. 불가하면 그냥 해당 색으로 보이지만,
  // 디자인(연함) 유지가 필요한 최신 환경에선 동일하게 나옴.
  return `color-mix(in srgb, ${bg} ${Math.round(ALPHA * 100)}%, transparent)`;
}

export const remarkHighlight = (tagColor: string): Plugin => {
  return () => (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      const textNode = node as Literal;
      const value = String(textNode.value);

      // ==내용== | =={bg}내용== | =={bg,fg}내용==
      const regex = /==(?:\{([^}]+)\})?([\s\S]*?)==/g;
      const matches = [...value.matchAll(regex)];
      if (!matches.length || !parent || typeof index !== 'number') return;

      const children: any[] = [];
      let lastIndex = 0;

      for (const m of matches) {
        const start = m.index ?? 0;
        const end = start + m[0].length;

        if (start > lastIndex) {
          children.push({ type: 'text', value: value.slice(lastIndex, start) });
        }

        const spec = m[1];      // bg[,fg] | 없음
        const inner = m[2] ?? '';

        let bgCss: string;
        let colorCss: string | undefined;

        if (spec) {
          const [bgRaw, fgRaw] = spec.split(',').map(s => s.trim());
          bgCss = bgWithSameDesign(bgRaw);
          // fg가 명시된 경우에만 글자색 변경 (원래 디자인 유지 원칙)
          if (fgRaw && fgRaw.length > 0) colorCss = fgRaw;
        } else {
          // 기본: tagColor를 원래처럼 10% 투명 처리
          bgCss = bgWithSameDesign(tagColor);
        }

        const style = [
          `background:${bgCss}`,            // bg 유지
          colorCss ? `color:${colorCss}` : '', // fg는 선택일 때만
          'padding:0 0.2em',
          'border-radius:0.25rem',
        ].filter(Boolean).join(';');

        children.push({
          type: 'html',
          value: `<mark style="${style}">${inner}</mark>`,
        });

        lastIndex = end;
      }

      if (lastIndex < value.length) {
        children.push({ type: 'text', value: value.slice(lastIndex) });
      }

      (parent as Parent).children.splice(index, 1, ...children);
    });
  };
};

export default remarkHighlight;
