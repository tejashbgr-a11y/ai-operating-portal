import { useState } from 'react';
import { Mail, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [dailyBrief, setDailyBrief] = useState(true);
  const [weeklyRoundup, setWeeklyRoundup] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      toast({ description: 'Subscribed! Check your inbox.' });
      setEmail('');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="rounded-lg border border-border/40 bg-card p-5 space-y-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Zap className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-heading font-bold text-sm">Get AI intel in your inbox</h3>
      </div>
      <p className="text-[11px] text-muted-foreground font-mono">
        Curated signal for operators and builders. No spam.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="h-9 text-sm bg-muted/40 border-border/40 focus:border-primary/40"
          required
        />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Checkbox checked={dailyBrief} onCheckedChange={v => setDailyBrief(!!v)} />
            Daily Brief
          </label>
          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Checkbox checked={weeklyRoundup} onCheckedChange={v => setWeeklyRoundup(!!v)} />
            Weekly Roundup
          </label>
        </div>
        <Button type="submit" className="w-full h-9 text-sm bg-primary hover:bg-primary/90 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.4)]" disabled={loading}>
          {loading ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </form>
    </div>
  );
}
