import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  getSaved, getLiked, getHidden, toggleSaved, toggleLiked, toggleHidden,
  recordClick, bumpInteraction,
} from '@/lib/anon';

export type InteractionKind = 'save' | 'like' | 'hide';

export function useInteractionSets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['interactions', user?.id ?? 'anon'],
    queryFn: async (): Promise<Record<InteractionKind, Set<string>>> => {
      if (!user) return {
        save: new Set(getSaved()), like: new Set(getLiked()), hide: new Set(getHidden()),
      };
      const { data } = await supabase
        .from('article_interactions')
        .select('article_id, interaction_type')
        .eq('user_id', user.id)
        .in('interaction_type', ['save', 'like', 'hide']);
      const sets: Record<InteractionKind, Set<string>> = { save: new Set(), like: new Set(), hide: new Set() };
      data?.forEach(r => {
        const t = r.interaction_type as InteractionKind;
        if (sets[t]) sets[t].add(r.article_id);
      });
      return sets;
    },
  });
}

export function useToggleInteraction() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ articleId, kind }: { articleId: string; kind: InteractionKind }) => {
      bumpInteraction();
      if (!user) {
        const fns = { save: toggleSaved, like: toggleLiked, hide: toggleHidden };
        const nowOn = fns[kind](articleId);
        return { kind, articleId, on: nowOn };
      }
      // Check if exists
      const { data: existing } = await supabase.from('article_interactions')
        .select('id').eq('user_id', user.id).eq('article_id', articleId).eq('interaction_type', kind).maybeSingle();
      if (existing) {
        await supabase.from('article_interactions').delete().eq('id', existing.id);
        return { kind, articleId, on: false };
      }
      await supabase.from('article_interactions').insert({ user_id: user.id, article_id: articleId, interaction_type: kind });
      return { kind, articleId, on: true };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interactions'] }),
  });
}

export function useRecordClick() {
  const { user } = useAuth();
  return async (articleId: string) => {
    bumpInteraction();
    recordClick(articleId);
    if (user) {
      await supabase.from('article_interactions').insert({
        user_id: user.id, article_id: articleId, interaction_type: 'click',
      });
    }
  };
}
