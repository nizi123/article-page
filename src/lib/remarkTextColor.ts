// src/lib/remarkTextColor.ts
import type { Plugin } from 'unified';
import { findAndReplace } from 'mdast-util-find-and-replace';

/**
 * {{red|텍스트}} / {{#ff3366|텍스트}} / {{rgb(0,200,100)|텍스트}} 지원
 * - 결과는 <span style="color:...">...</span> HTML을 생성 (rehype-raw 필요)
 */
const COLOR_TOKEN =
  /\{\{\s*([#a-zA-Z][#a-zA-Z0-9()\s,.-]*)\s*\|\s*([\s\S]*?)\s*\}\}/g;

const remarkTextColor: Plugin = () => {
  return (tree) => {
    findAndReplace(tree, [
      [
        COLOR_TOKEN,
        (_match: string, color: string, inner: string) => {
          // 안전장치: color가 비면 원문 유지
          const c = (color || '').trim();
          const t = (inner || '').replace(/<\/?script[\s\S]*?>/gi, ''); // XSS 예방 최소 처리
          if (!c) return _match;

          // HTML 노드로 반환( rehypeRaw 가 필수 )
          return {
            type: 'html',
            value: `<span style="color:${c}">${t}</span>`,
          };
        },
      ],
    ]);
  };
};

export default remarkTextColor;
