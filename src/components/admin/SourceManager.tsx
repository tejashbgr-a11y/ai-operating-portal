import { useState } from 'react';
import { Plus, ToggleLeft, ToggleRight, Globe, Rss } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

function useAllSources() {
  return useQuery({
    queryKey: ['all_sources'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sources').select('*').order('name');
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function SourceManager() {
  const { data: sources, isLoading } = useAllSources();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<string>('rss');
  const [category, setCategory] = useState('');
  const [adding, setAdding] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    setAdding(true);
    try {
      const { error } = await supabase.from('sources').insert({
        name: name.trim(),
        base_url: url.trim(),
        type,
        source_category: category.trim() || null,
        is_active: true,
      });
      if (error) throw error;
      toast({ description: `Source "${name}" added successfully.` });
      setName('');
      setUrl('');
      setCategory('');
      setShowAdd(false);
      queryClient.invalidateQueries({ queryKey: ['all_sources'] });
    } catch (err: any) {
      toast({ description: `Failed to add source: ${err.message}`, variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id: string, currentlyActive: boolean) => {
    setTogglingId(id);
    try {
      const { error } = await supabase
        .from('sources')
        .update({ is_active: !currentlyActive })
        .eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['all_sources'] });
      toast({ description: `Source ${!currentlyActive ? 'activated' : 'deactivated'}.` });
    } catch (err: any) {
      toast({ description: `Toggle failed: ${err.message}`, variant: 'destructive' });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <Card className="border-border/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Sources
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 border-border/40"
            onClick={() => setShowAdd(!showAdd)}
          >
            <Plus className="h-3 w-3" />
            Add Source
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showAdd && (
          <form onSubmit={handleAdd} className="space-y-2 p-3 rounded-md border border-border/30 bg-muted/20">
            <Input
              placeholder="Source name (e.g. AI Weekly)"
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-8 text-xs"
              required
            />
            <Input
              placeholder="Feed URL (e.g. https://example.substack.com)"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="h-8 text-xs"
              required
            />
            <div className="flex gap-2">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rss">RSS</SelectItem>
                  <SelectItem value="substack">Substack</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Category (optional)"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="h-8 text-xs flex-1"
              />
            </div>
            <Button type="submit" size="sm" className="text-xs w-full" disabled={adding}>
              {adding ? 'Adding…' : 'Add Source'}
            </Button>
          </form>
        )}

        {isLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : !sources?.length ? (
          <p className="text-xs text-muted-foreground py-4 text-center font-mono">No sources configured yet.</p>
        ) : (
          <div className="space-y-1.5">
            {sources.map((src) => (
              <div
                key={src.id}
                className={`flex items-center justify-between p-2.5 rounded-md border transition-colors ${
                  src.is_active ? 'border-border/30 bg-card' : 'border-border/20 bg-muted/30 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Rss className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{src.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">{src.base_url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[9px]">{src.type}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleToggle(src.id, src.is_active)}
                    disabled={togglingId === src.id}
                  >
                    {src.is_active ? (
                      <ToggleRight className="h-4 w-4 text-primary" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
