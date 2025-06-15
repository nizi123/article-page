// lib/remark-image-to-figure.ts
import { visit } from 'unist-util-visit';
import { Node } from 'unist';

export default function remarkImageToFigure() {
  return (tree: Node) => {
    visit(tree, 'image', (node: any, index: number, parent: any) => {
      if (!parent || typeof index !== 'number') return;

      const url = node.url;
      const alt = node.alt || '';

      const figureHtml = `<figure style="text-align: center; margin: 2rem 0;">
  <img src="${url}" alt="${alt}" />
  <figcaption style="font-size: 16px; color: #9ca3af; margin-top: 0.5rem;">${alt}</figcaption>
</figure>`;

      parent.children[index] = {
        type: 'html',
        value: figureHtml,
      };
    });
  };
}
