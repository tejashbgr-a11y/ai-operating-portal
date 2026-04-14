import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseArticlesOptions {
  lane?: string;
  search?: string;
  source?: string;
  timeRange?: '24h' | '7d' | '30d';
  limit?: number;
}

function getTimeFilter(range?: string) {
  if (!range) return null;
  const now = new Date();
  switch (range) {
    case '24h': return new Date(now.getTime() - 86400000).toISOString();
    case '7d': return new Date(now.getTime() - 604800000).toISOString();
    case '30d': return new Date(now.getTime() - 2592000000).toISOString();
    default: return null;
  }
}

export function useArticles(options: UseArticlesOptions = {}) {
  const { lane, search, source, timeRange, limit = 50 } = options;
  const queryClient = useQueryClient();

  const queryKey = ['articles', lane, search, source, timeRange, limit];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      let q = supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (lane) q = q.eq('primary_lane', lane);
      if (source) q = q.eq('source', source);
      if (search) q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

      const timeFilter = getTimeFilter(timeRange);
      if (timeFilter) q = q.gte('published_at', timeFilter);

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('articles-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'articles' }, () => {
        queryClient.invalidateQueries({ queryKey: ['articles'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
}

export function useSources() {
  return useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useDailySummaries(lane?: string) {
  return useQuery({
    queryKey: ['daily_summaries', lane],
    queryFn: async () => {
      let q = supabase
        .from('daily_summaries')
        .select('*')
        .order('summary_date', { ascending: false })
        .limit(1);
      if (lane) q = q.eq('lane', lane);
      const { data, error } = await q;
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

export function useIngestionRuns() {
  return useQuery({
    queryKey: ['ingestion_runs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingestion_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useArticleCountsByLane() {
  return useQuery({
    queryKey: ['article_counts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('articles').select('primary_lane');
      if (error) throw error;
      const counts: Record<string, number> = {};
      data?.forEach(a => {
        counts[a.primary_lane] = (counts[a.primary_lane] || 0) + 1;
      });
      return counts;
    },
  });
}
