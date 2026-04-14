import { useState } from 'react';
import { Mail } from 'lucide-react';
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
    // TODO: call edge function to subscribe
    setTimeout(() => {
      toast({ description: 'Subscribed! Check your inbox.' });
      setEmail('');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-primary" />
        <h3 className="font-heading font-semibold text-base">Get AI intelligence in your inbox</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Curated AI updates for operators, builders, and professionals. No spam, no fluff.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="h-9 text-sm"
          required
        />
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 text-xs">
            <Checkbox checked={dailyBrief} onCheckedChange={v => setDailyBrief(!!v)} />
            Daily Brief
          </label>
          <label className="flex items-center gap-1.5 text-xs">
            <Checkbox checked={weeklyRoundup} onCheckedChange={v => setWeeklyRoundup(!!v)} />
            Weekly Roundup
          </label>
        </div>
        <Button type="submit" className="w-full h-9 text-sm" disabled={loading}>
          {loading ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </form>
    </div>
  );
}
