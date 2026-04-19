import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ArticleCard } from '@/components/ArticleCard';
import { EmptyState } from '@/components/EmptyState';
import { useArticles } from '@/hooks/useArticles';
import { usePreferences } from '@/hooks/usePreferences';
import { useInteractionSets } from '@/hooks/useInteractions';
import { rankArticles } from '@/lib/ranking';
import { getRecentClicks } from '@/lib/anon';
import { SuggestionsPanel } from '@/components/SuggestionsPanel';

export default function ForYouPage() {
  const { data: articles, isLoading } = useArticles({ limit: 120 });
  const { data: prefs } = usePreferences();
  const { data: sets } = useInteractionSets();

  const ranked = useMemo(() => {
    if (!articles || !prefs) return [];
    return rankArticles({
      articles,
      prefs,
      recentClicks: getRecentClicks(),
      saved: sets?.save,
      liked: sets?.like,
      hidden: sets?.hide,
    }).slice(0, 30);
  }, [articles, prefs, sets]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h1 className="font-heading text-2xl font-bold tracking-tight">For You</h1>
      </div>
      <p className="text-sm text-muted-foreground max-w-xl">
        Personalized feed based on your preferences and activity. Like, save, or hide articles to refine it.
      </p>

      <SuggestionsPanel articles={articles ?? []} />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
        </div>
      ) : ranked.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ranked.map(a => <ArticleCard key={a.id} article={a} />)}
        </div>
      )}
    </div>
  );
}
