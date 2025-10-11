// src/lib/remarkTextColor.ts
import type { Plugin } from 'unified';
import type { Root, Content, Html } from 'mdast';
import { findAndReplace } from 'mdast-util-find-and-replace';

// {{red|텍스트}}, {{#ff3366|텍스트}}, {{rgb(0,200,100)|텍스트}}
const COLOR_TOKEN =
  /\{\{\s*([#a-zA-Z][#a-zA-Z0-9()\s,.-]*)\s*\|\s*([\s\S]*?)\s*\}\}/g;

const remarkTextColor: Plugin<[], Root> = () => {
  return (tree: Root) => {
    findAndReplace(tree, [
      [
        COLOR_TOKEN,
        (match: string, color: string, inner: string): Html | string => {
          const c = (color || '').trim();
          const t = (inner || '').replace(/<\/?script[\s\S]*?>/gi, '');
          if (!c) return match;

          const node: Html = {
            type: 'html',
            value: `<span style="color:${c}">${t}</span>`,
          };
          return node;
        },
      ],
    ]);
  };
};

export default remarkTextColor;
