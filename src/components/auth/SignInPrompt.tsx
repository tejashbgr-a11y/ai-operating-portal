import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleButton } from './GoogleButton';
import { dismissSignInPrompt, isSignInPromptDismissed, interactionCount } from '@/lib/anon';

const THRESHOLD = 3;

export function SignInPrompt() {
  const { user, loading } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (loading || user) { setShow(false); return; }
    if (isSignInPromptDismissed()) return;
    const tick = () => { if (interactionCount() >= THRESHOLD) setShow(true); };
    tick();
    const id = window.setInterval(tick, 1500);
    return () => window.clearInterval(id);
  }, [user, loading]);

  if (!show || user) return null;

  const close = () => { dismissSignInPrompt(); setShow(false); };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4 duration-300">
      <Card className="border-primary/30 bg-card/95 backdrop-blur shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.4)] p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 space-y-2">
            <h4 className="font-heading font-bold text-sm">Sync across devices</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Sign in with Google to sync your saves, likes, and preferences. No password needed.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <GoogleButton size="sm" />
              <Button variant="ghost" size="sm" className="text-[11px] h-8" onClick={close}>Not now</Button>
            </div>
          </div>
          <button onClick={close} className="text-muted-foreground hover:text-foreground -mr-1 -mt-1">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </Card>
    </div>
  );
}
