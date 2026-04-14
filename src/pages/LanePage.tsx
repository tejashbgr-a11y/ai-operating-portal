import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ArticleCard } from '@/components/ArticleCard';
import { Filters } from '@/components/Filters';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { useArticles } from '@/hooks/useArticles';
import { LANES, type Lane } from '@/lib/lanes';

const LANE_EMPTY: Record<Lane, { title: string; description: string }> = {
  pulse: { title: 'No Pulse updates yet', description: 'Major AI developments and news will show up here.' },
  business_impact: { title: 'No Business Impact stories yet', description: 'Enterprise AI, ROI, and adoption stories will appear here.' },
  tool_radar: { title: 'No tools discovered yet', description: 'New AI tools and products you can try will land here.' },
  builder_lab: { title: 'No Builder Lab posts yet', description: 'APIs, SDKs, frameworks, and dev workflows will show here.' },
};

export default function LanePage() {
  const { lane } = useParams<{ lane: string }>();
  const laneConfig = LANES[lane as Lane];

  const [timeRange, setTimeRange] = useState('');
  const [source, setSource] = useState('');

  const { data: articles, isLoading } = useArticles({
    lane,
    timeRange: timeRange as any,
    source: source || undefined,
    limit: 50,
  });

  const uniqueSources = useMemo(() => {
    if (!articles) return [];
    return [...new Set(articles.map(a => a.source).filter(Boolean))] as string[];
  }, [articles]);

  if (!laneConfig) {
    return <EmptyState title="Lane not found" description="This section doesn't exist." />;
  }

  const empty = LANE_EMPTY[lane as Lane];

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className={`font-heading text-xl font-bold ${laneConfig.textClass}`}>{laneConfig.label}</h1>
        <p className="text-sm text-muted-foreground">{laneConfig.shortDescription}</p>
      </div>

      <Filters
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        sources={uniqueSources}
        selectedSource={source}
        onSourceChange={setSource}
      />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
        </div>
      ) : !articles?.length ? (
        <EmptyState title={empty.title} description={empty.description} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {articles.map(a => <ArticleCard key={a.id} article={a} />)}
        </div>
      )}
    </div>
  );
}
