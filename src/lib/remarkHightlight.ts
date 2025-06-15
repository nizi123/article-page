import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { Literal, Parent } from 'unist';

export const remarkHighlight = (tagColor: string): Plugin => {
  return () => (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      const textNode = node as Literal;
      const value = textNode.value as string;

      const regex = /==([^=]+)==/g;
      const matches = [...value.matchAll(regex)];
      if (!matches.length || !parent || typeof index !== 'number') return;

      const children = [];
      let lastIndex = 0;

      for (const match of matches) {
        const start = match.index ?? 0;
        if (start > lastIndex) {
          children.push({
            type: 'text',
            value: value.slice(lastIndex, start),
          });
        }

        children.push({
          type: 'html',
          value: `<mark style="background-color: ${tagColor}1A; padding: 0 0.2em; border-radius: 0.25rem;">${match[1]}</mark>`,
        });

        lastIndex = start + match[0].length;
      }

      if (lastIndex < value.length) {
        children.push({
          type: 'text',
          value: value.slice(lastIndex),
        });
      }

      (parent as Parent).children.splice(index, 1, ...children);
    });
  };
};
