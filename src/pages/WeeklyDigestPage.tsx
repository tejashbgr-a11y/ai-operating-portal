import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Sparkles, Calendar, ExternalLink } from 'lucide-react';

interface DigestSection {
  lane: string;
  label: string;
  headline: string;
  blurb: string;
  articleUrl: string;
  articleTitle: string;
}

interface WildcardPick {
  headline: string;
  blurb: string;
  articleUrl: string;
  articleTitle: string;
}

function useLatestDigest() {
  return useQuery({
    queryKey: ['weekly_digest_latest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_digests')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

const LANE_COLORS: Record<string, string> = {
  pulse: 'from-lane-pulse/20 to-lane-pulse/5 border-lane-pulse/30',
  business_impact: 'from-lane-business/20 to-lane-business/5 border-lane-business/30',
  tool_radar: 'from-lane-tools/20 to-lane-tools/5 border-lane-tools/30',
  builder_lab: 'from-lane-builder/20 to-lane-builder/5 border-lane-builder/30',
};

const LANE_ACCENT: Record<string, string> = {
  pulse: 'text-lane-pulse',
  business_impact: 'text-lane-business',
  tool_radar: 'text-lane-tools',
  builder_lab: 'text-lane-builder',
};

function formatDateRange(start: string, end: string) {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
}

export default function WeeklyDigestPage() {
  const { data: digest, isLoading } = useLatestDigest();

  const sections = useMemo(() => {
    if (!digest?.sections) return [];
    return (digest.sections as unknown as DigestSection[]);
  }, [digest]);

  const wildcards = useMemo(() => {
    if (!digest?.wildcard_picks) return [];
    return (digest.wildcard_picks as unknown as WildcardPick[]);
  }, [digest]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <Sparkles className="h-12 w-12 text-muted-foreground mx-auto" />
        <h1 className="font-heading text-2xl font-bold">No Digest Yet</h1>
        <p className="text-muted-foreground text-sm">The weekly digest hasn't been generated yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <article className="max-w-2xl mx-auto py-8 space-y-8">
      {/* Header */}
      <header className="space-y-4 border-b border-border/40 pb-8">
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDateRange(digest.week_start, digest.week_end)}</span>
          <span className="text-border">•</span>
          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
            Weekly Digest
          </Badge>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight leading-tight">
          {digest.title}
        </h1>
        <p className="text-foreground/70 leading-relaxed text-[15px]">
          {digest.intro}
        </p>
      </header>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, i) => (
          <Card
            key={i}
            className={`border bg-gradient-to-br ${LANE_COLORS[section.lane] || 'border-border/30'} overflow-hidden`}
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-widest ${LANE_ACCENT[section.lane] || 'text-muted-foreground'}`}>
                  {section.label}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">0{i + 1}</span>
              </div>
              <h2 className="font-heading text-lg font-bold leading-snug">
                {section.headline}
              </h2>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {section.blurb}
              </p>
              <a
                href={section.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors group"
              >
                Read: {section.articleTitle}
                <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Wildcard Picks */}
      {wildcards.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            <h2 className="font-heading font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground shrink-0 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Wildcard Picks
            </h2>
            <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
          </div>
          <div className="grid gap-3">
            {wildcards.map((pick, i) => (
              <Card key={i} className="border-border/30 bg-card/50">
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-heading text-sm font-bold">{pick.headline}</h3>
                  <p className="text-xs text-foreground/60 leading-relaxed">{pick.blurb}</p>
                  <a
                    href={pick.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {pick.articleTitle}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/40 pt-6 text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          Curated by AI Operating Portal • Auto-generated weekly digest
        </p>
      </footer>
    </article>
  );
}
