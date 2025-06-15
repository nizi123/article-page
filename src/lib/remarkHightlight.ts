import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

export const remarkHighlight = (tagColor: string): Plugin => {
  return () => (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      const regex = /==([^=]+)==/g;
      const matches = [...node.value.matchAll(regex)];
      if (!matches.length) return;

      const children = [];
      let lastIndex = 0;

      for (const match of matches) {
        const start = match.index ?? 0;
        if (start > lastIndex) {
          children.push({ type: 'text', value: node.value.slice(lastIndex, start) });
        }

        children.push({
          type: 'html',
          value: `<mark style="background-color: ${tagColor}1A; padding: 0 0.2em; border-radius: 0.25rem;">${match[1]}</mark>`,
        });

        lastIndex = start + match[0].length;
      }

      if (lastIndex < node.value.length) {
        children.push({ type: 'text', value: node.value.slice(lastIndex) });
      }

      // ✅ parent에 적용
      if (parent && typeof index === 'number') {
        parent.children.splice(index, 1, ...children);
      }
    });
  };
};
