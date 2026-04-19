import type { Database } from '@/integrations/supabase/types';
import type { Preferences } from '@/hooks/usePreferences';

type Article = Database['public']['Tables']['articles']['Row'];

interface RankingInput {
  articles: Article[];
  prefs: Preferences;
  recentClicks?: string[];
  saved?: Set<string>;
  liked?: Set<string>;
  hidden?: Set<string>;
}

const LANE_WEIGHT_KEY: Record<string, keyof Preferences> = {
  pulse: 'pulse_weight',
  business_impact: 'business_weight',
  tool_radar: 'tools_weight',
  builder_lab: 'builder_weight',
};

/**
 * Deterministic personalized ranking. Score components:
 *  - freshness (recency of ingested_at/published_at)
 *  - lane preference (preferred_lanes + per-lane weight)
 *  - tag preference (preferred_tags overlap)
 *  - source preference (preferred_sources match)
 *  - engagement signal (saved/liked = boost, recent click = small boost)
 *  - small popularity proxy from secondary_tags length
 *  - exploration: light random jitter so feed isn't stuck
 * Hidden articles are excluded.
 */
export function rankArticles({ articles, prefs, recentClicks = [], saved, liked, hidden }: RankingInput): Article[] {
  const recentSet = new Set(recentClicks);
  const now = Date.now();

  const scored = articles
    .filter(a => !hidden?.has(a.id))
    .map(a => {
      const ts = new Date(a.ingested_at || a.published_at || now).getTime();
      const ageHours = Math.max(0, (now - ts) / 3_600_000);
      const freshness = Math.exp(-ageHours / 36); // half-life ~25h

      const laneWeightKey = LANE_WEIGHT_KEY[a.primary_lane];
      const laneWeight = laneWeightKey ? Number(prefs[laneWeightKey] ?? 1) : 1;
      const lanePreferred = prefs.preferred_lanes.includes(a.primary_lane) ? 0.4 : 0;

      const tags = Array.isArray(a.secondary_tags) ? (a.secondary_tags as string[]) : [];
      const tagOverlap = tags.filter(t => prefs.preferred_tags.includes(t)).length;
      const tagBoost = Math.min(tagOverlap * 0.15, 0.6);

      const sourceBoost = a.source && prefs.preferred_sources.includes(a.source) ? 0.3 : 0;

      const engaged = (saved?.has(a.id) ? 0.25 : 0) + (liked?.has(a.id) ? 0.25 : 0) + (recentSet.has(a.id) ? 0.1 : 0);
      const popularity = Math.min(tags.length * 0.02, 0.1);
      const jitter = Math.random() * 0.05;

      const score = (freshness * laneWeight) + lanePreferred + tagBoost + sourceBoost + engaged + popularity + jitter;
      return { a, score };
    })
    .sort((x, y) => y.score - x.score);

  return scored.map(s => s.a);
}
