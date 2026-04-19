import { useState, useEffect } from 'react';
import { Settings, EyeOff, LogOut } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferences } from '@/hooks/usePreferences';
import { useToggleInteraction, useInteractionSets } from '@/hooks/useInteractions';
import { LANE_ORDER, LANES } from '@/lib/lanes';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { useToast } from '@/hooks/use-toast';
import { useSources } from '@/hooks/useArticles';

export default function SettingsPage() {
  const { user, signOut, loading } = useAuth();
  const { data: prefs, update } = usePreferences();
  const { data: sources } = useSources();
  const { data: sets } = useInteractionSets();
  const toggle = useToggleInteraction();
  const { toast } = useToast();

  const [local, setLocal] = useState(prefs);
  useEffect(() => { if (prefs) setLocal(prefs); }, [prefs]);

  if (loading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  if (!user) {
    return (
      <div className="max-w-md space-y-4">
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Sign in with Google to manage your preferences and sync them across devices.</p>
        <GoogleButton />
      </div>
    );
  }

  if (!local) return null;

  const toggleArr = (arr: string[], v: string) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  const save = async () => {
    await update(local);
    toast({ description: 'Preferences saved' });
  };

  const resetHidden = async () => {
    if (!sets) return;
    const hiddenIds = Array.from(sets.hide);
    await Promise.all(hiddenIds.map(id => toggle.mutateAsync({ articleId: id, kind: 'hide' })));
    toast({ description: `Cleared ${hiddenIds.length} hidden article(s)` });
  };

  const tagOptions = ['enterprise','roi','adoption','automation','launch','tools','product','workflow','API','SDK','framework','open_source','agents','MCP','RAG','vector_db','model_release','research','regulation','funding','productivity','case_study','tutorial'];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h1 className="font-heading text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      <Card><CardContent className="p-5 space-y-3">
        <h2 className="font-heading text-sm font-bold">Preferred lanes</h2>
        <div className="flex flex-wrap gap-2">
          {LANE_ORDER.map(id => (
            <button key={id} onClick={() => setLocal({ ...local, preferred_lanes: toggleArr(local.preferred_lanes, id) })}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                local.preferred_lanes.includes(id) ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border/40 hover:border-primary/30'
              }`}>{LANES[id].label}</button>
          ))}
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-5 space-y-4">
        <h2 className="font-heading text-sm font-bold">Lane weights</h2>
        {([['pulse_weight','Pulse'],['business_weight','Business Impact'],['tools_weight','Tool Radar'],['builder_weight','Builder Lab']] as const).map(([k, label]) => (
          <div key={k} className="space-y-1">
            <div className="flex justify-between text-xs"><span>{label}</span><span className="font-mono text-muted-foreground">{Number(local[k]).toFixed(1)}</span></div>
            <Slider min={0} max={2} step={0.1} value={[Number(local[k])]} onValueChange={([v]) => setLocal({ ...local, [k]: v })} />
          </div>
        ))}
      </CardContent></Card>

      <Card><CardContent className="p-5 space-y-3">
        <h2 className="font-heading text-sm font-bold">Preferred topics</h2>
        <div className="flex flex-wrap gap-1.5">
          {tagOptions.map(t => (
            <button key={t} onClick={() => setLocal({ ...local, preferred_tags: toggleArr(local.preferred_tags, t) })}
              className={`text-[10px] font-mono px-2 py-1 rounded-sm border transition-colors ${
                local.preferred_tags.includes(t) ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border/40 hover:border-primary/30'
              }`}>{t}</button>
          ))}
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-5 space-y-3">
        <h2 className="font-heading text-sm font-bold">Preferred sources</h2>
        <div className="flex flex-wrap gap-1.5">
          {(sources ?? []).map(s => (
            <button key={s.id} onClick={() => setLocal({ ...local, preferred_sources: toggleArr(local.preferred_sources, s.name) })}
              className={`text-[10px] font-mono px-2 py-1 rounded-sm border transition-colors ${
                local.preferred_sources.includes(s.name) ? 'bg-primary/15 border-primary/40 text-primary' : 'border-border/40 hover:border-primary/30'
              }`}>{s.name}</button>
          ))}
        </div>
      </CardContent></Card>

      <div className="flex items-center justify-between">
        <Button onClick={save}>Save preferences</Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetHidden}>
            <EyeOff className="h-3.5 w-3.5 mr-1.5" />Reset hidden ({sets?.hide.size ?? 0})
          </Button>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-3.5 w-3.5 mr-1.5" />Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
