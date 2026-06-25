import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { relativeTime } from '@/lib/time';

interface Props {
  lane?: string;
}

export function LastUpdatedBadge({ lane }: Props) {
  const { data } = useQuery({
    queryKey: ['last-ingested', lane ?? 'all'],
    queryFn: async () => {
      let q = supabase
        .from('articles')
        .select('ingested_at')
        .order('ingested_at', { ascending: false })
        .limit(1);
      if (lane) q = q.eq('primary_lane', lane);
      const { data, error } = await q;
      if (error) throw error;
      return data?.[0]?.ingested_at ?? null;
    },
    refetchInterval: 60_000,
  });

  if (!data) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
      <RefreshCw className="h-3 w-3 text-primary" />
      Last updated {relativeTime(data)}
    </span>
  );
}