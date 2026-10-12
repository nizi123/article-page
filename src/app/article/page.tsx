import ArticleList from '@/components/ArticleList';
import { getArticles } from '@/lib/notion/articles';

export const dynamic = 'force-dynamic';

export default async function ArticleListPage() {
  const articles = await getArticles();
  return <ArticleList articles={articles.map(a => ({ ...a, content: '' }))} />;
}
