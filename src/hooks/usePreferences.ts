import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getAnonPrefs, setAnonPrefs, AnonPrefs } from '@/lib/anon';

export interface Preferences extends AnonPrefs {}

const DEFAULT: Preferences = {
  preferred_lanes: [], preferred_tags: [], preferred_sources: [],
  pulse_weight: 1, business_weight: 1, tools_weight: 1, builder_weight: 1,
};

export function usePreferences() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['preferences', user?.id ?? 'anon'],
    queryFn: async (): Promise<Preferences> => {
      if (!user) return getAnonPrefs();
      const { data } = await supabase.from('user_preferences').select('*').eq('user_id', user.id).maybeSingle();
      if (!data) return DEFAULT;
      return {
        preferred_lanes: (data.preferred_lanes as string[]) || [],
        preferred_tags: (data.preferred_tags as string[]) || [],
        preferred_sources: (data.preferred_sources as string[]) || [],
        pulse_weight: Number(data.pulse_weight ?? 1),
        business_weight: Number(data.business_weight ?? 1),
        tools_weight: Number(data.tools_weight ?? 1),
        builder_weight: Number(data.builder_weight ?? 1),
      };
    },
  });

  const mutation = useMutation({
    mutationFn: async (patch: Partial<Preferences>) => {
      const next = { ...(query.data ?? DEFAULT), ...patch };
      if (!user) { setAnonPrefs(next); return next; }
      const { error } = await supabase.from('user_preferences').upsert({
        user_id: user.id,
        preferred_lanes: next.preferred_lanes,
        preferred_tags: next.preferred_tags,
        preferred_sources: next.preferred_sources,
        pulse_weight: next.pulse_weight,
        business_weight: next.business_weight,
        tools_weight: next.tools_weight,
        builder_weight: next.builder_weight,
      }, { onConflict: 'user_id' });
      if (error) throw error;
      return next;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['preferences'] }),
  });

  return { ...query, update: mutation.mutateAsync, updating: mutation.isPending };
}
