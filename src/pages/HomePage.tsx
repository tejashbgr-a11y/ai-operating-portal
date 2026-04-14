import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, TrendingUp, Wrench, Code2, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  const { data: articles, isLoading } = useArticles({ limit: 80 });
  const { data: todaySummary } = useDailySummaries('general');

  const topPicks = useMemo(() => {
    if (!articles) return [];
    const byLane: Record<string, typeof articles> = {};
    articles.forEach(a => {
      if (!byLane[a.primary_lane]) byLane[a.primary_lane] = [];
      byLane[a.primary_lane].push(a);
    });
    // Ensure at least 1 from each lane, then fill remaining slots
    const picks: typeof articles = [];
    const used = new Set<string>();
    LANE_ORDER.forEach(lane => {
      const first = (byLane[lane] || [])[0];
      if (first) { picks.push(first); used.add(first.id); }
    });
    // Fill remaining with top articles across lanes
    LANE_ORDER.forEach(lane => {
      (byLane[lane] || []).forEach(a => {
        if (picks.length < 8 && !used.has(a.id)) {
          picks.push(a);
          used.add(a.id);
        }
      });
    });
    return picks.slice(0, 8);
  }, [articles]);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative space-y-4 py-4">
        <div className="absolute inset-0 -z-10 bg-grid opacity-40" />
        <div className="flex items-center gap-2 text-primary">
          <Zap className="h-5 w-5" />
          <span className="text-[11px] font-mono font-medium uppercase tracking-widest">Intelligence Feed</span>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight leading-tight">
          AI Operating
          <span className="bg-gradient-to-r from-primary via-lane-tools to-lane-builder bg-clip-text text-transparent"> Portal</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
          Your daily signal for AI developments, business impact, tools, and builder resources — curated for operators, founders, and professionals.
        </p>
      </section>

      {/* Today in AI strip */}
      {todaySummary?.summary_text && (
        <Card className="border-primary/20 bg-primary/5 shadow-[0_0_30px_-10px_hsl(var(--primary)/0.15)]">
          <CardContent className="p-4">
            <h2 className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">Today in AI</h2>
            <ul className="space-y-1.5">
              {todaySummary.summary_text.split('\n').filter(Boolean).map((line, i) => {
                const cleaned = line.replace(/^[-•]\s*/, '');
                const [title, url] = cleaned.split('|||');
                return (
                  <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                    <span className="text-primary mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full bg-primary" />
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-foreground/80 hover:text-primary transition-colors underline-offset-2 hover:underline">
                        {title}
                      </a>
                    ) : (
                      <span className="text-foreground/80">{title}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Lane jump cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {LANE_ORDER.map(id => {
          const lane = LANES[id];
          return (
            <Link key={id} to={`/${id}`}>
              <Card className="h-full transition-all duration-300 cursor-pointer group border-border/30 hover:border-primary/20 hover:shadow-[0_0_25px_-8px_hsl(var(--primary)/0.12)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/[0.02] group-hover:to-primary/[0.05] transition-all" />
                <CardContent className="p-4 space-y-3 relative">
                  <div className={`flex items-center gap-2 ${lane.textClass}`}>
                    {LANE_ICONS[id]}
                    <span className="font-heading font-bold text-sm">{lane.label}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{lane.question}</p>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground group-hover:text-primary transition-colors">
                    <span>explore</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Top picks */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            <h2 className="font-heading font-bold text-sm uppercase tracking-widest text-muted-foreground shrink-0">Top Picks</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
          </div>
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
