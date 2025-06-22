// lib/remark-image-to-figure.ts
import { visit } from 'unist-util-visit';
import { Node } from 'unist';

export default function remarkImageToFigure() {
  return (tree: Node) => {
    visit(tree, 'image', (node: any, index: number, parent: any) => {
      if (!parent || typeof index !== 'number') return;

      const url = node.url;
      const alt = node.alt || '';

      const figureHtml = `<figure class="flex flex-col items-center my-8">
  <img src="${url}" alt="${alt}"  class="block max-w-full" />
  <figcaption style="font-size: 12px; color: #9ca3af; margin-top: 0.5rem;">${alt}</figcaption>
</figure>`;

      parent.children[index] = {
        type: 'html',
        value: figureHtml,
      };
    });
  };
}
