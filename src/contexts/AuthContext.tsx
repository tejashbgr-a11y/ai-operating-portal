import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import {
  getSaved, getLiked, getHidden, getAnonPrefs, clearAnonAfterMerge,
} from '@/lib/anon';

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

async function mergeAnonState(userId: string) {
  const saved = getSaved();
  const liked = getLiked();
  const hidden = getHidden();
  const prefs = getAnonPrefs();

  // Merge preferences (only if user has empty/default prefs)
  const { data: existing } = await supabase
    .from('user_preferences').select('*').eq('user_id', userId).maybeSingle();
  const isEmpty = !existing || (
    (Array.isArray(existing.preferred_lanes) && (existing.preferred_lanes as unknown[]).length === 0) &&
    (Array.isArray(existing.preferred_tags) && (existing.preferred_tags as unknown[]).length === 0)
  );
  if (isEmpty) {
    await supabase.from('user_preferences').upsert({
      user_id: userId,
      preferred_lanes: prefs.preferred_lanes,
      preferred_tags: prefs.preferred_tags,
      preferred_sources: prefs.preferred_sources,
      pulse_weight: prefs.pulse_weight,
      business_weight: prefs.business_weight,
      tools_weight: prefs.tools_weight,
      builder_weight: prefs.builder_weight,
    }, { onConflict: 'user_id' });
  }

  const rows = [
    ...saved.map(article_id => ({ user_id: userId, article_id, interaction_type: 'save' })),
    ...liked.map(article_id => ({ user_id: userId, article_id, interaction_type: 'like' })),
    ...hidden.map(article_id => ({ user_id: userId, article_id, interaction_type: 'hide' })),
  ];
  if (rows.length) {
    // upsert won't work cleanly with the partial unique index on (user,article,type) — ignore conflicts
    await supabase.from('article_interactions').insert(rows).select();
  }
  clearAnonAfterMerge();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [merged, setMerged] = useState(false);

  useEffect(() => {
    // 1) Subscribe FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (event === 'SIGNED_IN' && s?.user && !merged) {
        // defer DB calls to avoid auth-deadlock
        setTimeout(() => {
          mergeAnonState(s.user.id).catch(() => { /* swallow */ });
          setMerged(true);
        }, 0);
      }
      if (event === 'SIGNED_OUT') setMerged(false);
    });

    // 2) Then read existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    return () => { sub.subscription.unsubscribe(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<{ error?: string }> => {
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin + window.location.pathname,
      });
      if (result.error) return { error: result.error.message || 'Sign-in failed' };
      return {};
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Sign-in failed' };
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <Ctx.Provider value={{ user, session, loading, signInWithGoogle, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
