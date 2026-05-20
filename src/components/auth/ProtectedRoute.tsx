import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GoogleButton } from './GoogleButton';
import { Loader2 } from 'lucide-react';

interface Props {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(requireAdmin);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!requireAdmin || !user) { setChecking(false); return; }
    setChecking(true);
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) { setIsAdmin(!!data); setChecking(false); }
      });
    return () => { cancelled = true; };
  }, [user, requireAdmin]);

  if (loading || checking) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div>
          <div className="text-lg font-semibold">Sign in required</div>
          <div className="text-sm text-muted-foreground mt-1">You need to sign in to view this page.</div>
        </div>
        <GoogleButton size="default" />
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}