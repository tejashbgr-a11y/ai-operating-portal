import { useMemo } from 'react';
import { X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePreferences } from '@/hooks/usePreferences';
import { useInteractionSets } from '@/hooks/useInteractions';
import { LANES, getLaneLabel, type Lane } from '@/lib/lanes';
import type { Database } from '@/integrations/supabase/types';

type Article = Database['public']['Tables']['articles']['Row'];

export function SuggestionsPanel({ articles }: { articles: Article[] }) {
  const { data: prefs, update } = usePreferences();
  const { data: sets } = useInteractionSets();

  const { suggestedLane, suggestedTags, suggestedSources } = useMemo(() => {
    if (!prefs || !sets || !articles.length) return { suggestedLane: null as Lane | null, suggestedTags: [] as string[], suggestedSources: [] as string[] };
    const engagedIds = new Set([...sets.save, ...sets.like]);
    const engaged = articles.filter(a => engagedIds.has(a.id));
    const laneCount: Record<string, number> = {};
    const tagCount: Record<string, number> = {};
    const sourceCount: Record<string, number> = {};
    engaged.forEach(a => {
      laneCount[a.primary_lane] = (laneCount[a.primary_lane] || 0) + 1;
      const tags = Array.isArray(a.secondary_tags) ? (a.secondary_tags as string[]) : [];
      tags.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; });
      if (a.source) sourceCount[a.source] = (sourceCount[a.source] || 0) + 1;
    });
    const topLane = Object.entries(laneCount).filter(([k]) => !prefs.preferred_lanes.includes(k))
      .sort((a, b) => b[1] - a[1])[0]?.[0] as Lane | undefined;
    const topTags = Object.entries(tagCount).filter(([k]) => !prefs.preferred_tags.includes(k))
      .sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k);
    const topSources = Object.entries(sourceCount).filter(([k]) => !prefs.preferred_sources.includes(k))
      .sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
    return { suggestedLane: topLane ?? null, suggestedTags: topTags, suggestedSources: topSources };
  }, [articles, prefs, sets]);

  if (!prefs) return null;
  if (!suggestedLane && suggestedTags.length === 0 && suggestedSources.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5 p-4 space-y-3">
      <h3 className="font-heading font-bold text-[11px] uppercase tracking-widest text-primary">Suggested for you</h3>

      {suggestedLane && (
        <div className="flex items-center justify-between gap-3 text-xs">
          <div>
            You seem to be reading more <span className="font-semibold">{LANES[suggestedLane].label}</span> content.
          </div>
          <Button size="sm" variant="outline" className="h-7 text-[11px]"
            onClick={() => update({ preferred_lanes: [...prefs.preferred_lanes, suggestedLane] })}>
            Follow lane
          </Button>
        </div>
      )}

      {suggestedTags.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] text-muted-foreground">Suggested topics</div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedTags.map(t => (
              <button key={t} onClick={() => update({ preferred_tags: [...prefs.preferred_tags, t] })}
                className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-muted/60 hover:bg-primary/15 hover:text-primary border border-border/40 transition-colors">
                + {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {suggestedSources.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] text-muted-foreground">Suggested sources</div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedSources.map(s => (
              <button key={s} onClick={() => update({ preferred_sources: [...prefs.preferred_sources, s] })}
                className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-muted/60 hover:bg-primary/15 hover:text-primary border border-border/40 transition-colors">
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
