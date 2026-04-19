import { useMemo } from 'react';
import { Heart } from 'lucide-react';
import { ArticleCard } from '@/components/ArticleCard';
import { EmptyState } from '@/components/EmptyState';
import { useArticles } from '@/hooks/useArticles';
import { useInteractionSets } from '@/hooks/useInteractions';

export default function LikedPage() {
  const { data: articles } = useArticles({ limit: 200 });
  const { data: sets } = useInteractionSets();
  const list = useMemo(() => (articles ?? []).filter(a => sets?.like.has(a.id)), [articles, sets]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary" />
        <h1 className="font-heading text-2xl font-bold tracking-tight">Liked</h1>
      </div>
      {list.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map(a => <ArticleCard key={a.id} article={a} />)}
        </div>
      )}
    </div>
  );
}
