import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, TrendingUp, Wrench, Code2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArticleCard } from '@/components/ArticleCard';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { useArticles, useDailySummaries } from '@/hooks/useArticles';
import { LANES, LANE_ORDER, type Lane } from '@/lib/lanes';

const LANE_ICONS: Record<Lane, React.ReactNode> = {
  pulse: <Activity className="h-4 w-4" />,
  business_impact: <TrendingUp className="h-4 w-4" />,
  tool_radar: <Wrench className="h-4 w-4" />,
  builder_lab: <Code2 className="h-4 w-4" />,
};

export default function HomePage() {
  const { data: articles, isLoading } = useArticles({ limit: 20 });
  const { data: todaySummary } = useDailySummaries();

  const topPicks = useMemo(() => {
    if (!articles) return [];
    // Pick top 2 from each lane for variety
    const byLane: Record<string, typeof articles> = {};
    articles.forEach(a => {
      if (!byLane[a.primary_lane]) byLane[a.primary_lane] = [];
      byLane[a.primary_lane].push(a);
    });
    const picks: typeof articles = [];
    LANE_ORDER.forEach(lane => {
      const laneArticles = byLane[lane] || [];
      picks.push(...laneArticles.slice(0, 2));
    });
    return picks.slice(0, 8);
  }, [articles]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="space-y-2">
        <h1 className="font-heading text-2xl font-bold tracking-tight">AI Operating Portal</h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          Your daily intelligence feed for AI developments, business impact, tools, and builder resources — curated for operators, founders, and professionals.
        </p>
      </section>

      {/* Today in AI strip */}
      {todaySummary?.summary_text && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <h2 className="font-heading text-xs font-semibold uppercase tracking-wider text-primary mb-1">Today in AI</h2>
            <p className="text-sm text-foreground/80">{todaySummary.summary_text}</p>
          </CardContent>
        </Card>
      )}

      {/* Lane jump cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {LANE_ORDER.map(id => {
          const lane = LANES[id];
          return (
            <Link key={id} to={`/${id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4 space-y-2">
                  <div className={`flex items-center gap-2 ${lane.textClass}`}>
                    {LANE_ICONS[id]}
                    <span className="font-heading font-semibold text-sm">{lane.label}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{lane.question}</p>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
                    <span>Explore</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top picks */}
        <section className="lg:col-span-2 space-y-3">
          <h2 className="font-heading font-semibold text-base">Top picks today</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
            </div>
          ) : topPicks.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {topPicks.map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
          )}
        </section>

        {/* Newsletter */}
        <aside className="space-y-4">
          <NewsletterSignup />
        </aside>
      </div>
    </div>
  );
}
