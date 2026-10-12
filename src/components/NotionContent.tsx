import './notion-content.css';

// html is produced exclusively by the escaping, allowlisted Notion renderer.
export default function NotionContent({ html }: { html: string }) {
  return <div className="notion-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
