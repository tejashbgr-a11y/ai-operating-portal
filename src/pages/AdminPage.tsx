import { useState } from 'react';
import { AlertTriangle, Clock, Database, RefreshCw, Play, Sparkles, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useIngestionRuns, useArticleCountsByLane } from '@/hooks/useArticles';
import { getLaneLabel } from '@/lib/lanes';
import { relativeTime } from '@/lib/time';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SourceManager } from '@/components/admin/SourceManager';

export default function AdminPage() {
  const { data: runs, isLoading: runsLoading, refetch: refetchRuns } = useIngestionRuns();
  const { data: counts, isLoading: countsLoading, refetch: refetchCounts } = useArticleCountsByLane();
  const [triggering, setTriggering] = useState(false);
  const [directIngesting, setDirectIngesting] = useState(false);
  const [generatingDigest, setGeneratingDigest] = useState(false);
  const { toast } = useToast();

  const handleGenerateDigest = async () => {
    setGeneratingDigest(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-weekly-digest');
      if (error) throw error;
      toast({ description: 'Weekly digest generated successfully!' });
    } catch (e: any) {
      toast({ description: `Digest generation failed: ${e.message}`, variant: 'destructive' });
    } finally {
      setGeneratingDigest(false);
    }
  };

  const latestRun = runs?.[0];
  const totalArticles = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;

  const noRecentIngestion = latestRun
    ? (Date.now() - new Date(latestRun.started_at).getTime()) > 86400000
    : true;

  const handleTriggerIngestion = async () => {
    setTriggering(true);
    try {
      const { data, error } = await supabase.functions.invoke('trigger-ingestion', {
        body: { source: 'all' },
      });
      if (error) throw error;
      toast({ description: 'Ingestion triggered via Inngest. Results will appear shortly.' });
    } catch (e: any) {
      toast({ description: `Trigger failed: ${e.message}`, variant: 'destructive' });
    } finally {
      setTriggering(false);
    }
  };

  const handleDirectIngest = async () => {
    setDirectIngesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('ingest-articles', {
        body: { source: 'all' },
      });
      if (error) throw error;
      toast({
        description: `Ingestion complete: ${data.inserted} new, ${data.duplicates} dupes, ${data.failed} failed`,
      });
      refetchRuns();
      refetchCounts();
    } catch (e: any) {
      toast({ description: `Ingestion failed: ${e.message}`, variant: 'destructive' });
    } finally {
      setDirectIngesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 border-border/40"
            onClick={handleTriggerIngestion}
            disabled={triggering}
          >
            <Play className="h-3 w-3" />
            {triggering ? 'Triggering…' : 'Trigger via Inngest'}
          </Button>
          <Button
            size="sm"
            className="text-xs gap-1.5 shadow-[0_0_15px_-5px_hsl(var(--primary)/0.4)]"
            onClick={handleDirectIngest}
            disabled={directIngesting}
          >
            <RefreshCw className={`h-3 w-3 ${directIngesting ? 'animate-spin' : ''}`} />
            {directIngesting ? 'Ingesting…' : 'Run Ingestion Now'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
            onClick={handleGenerateDigest}
            disabled={generatingDigest}
          >
            <Sparkles className={`h-3 w-3 ${generatingDigest ? 'animate-pulse' : ''}`} />
            {generatingDigest ? 'Generating…' : 'Generate Weekly Digest'}
          </Button>
        </div>
      </div>

      {noRecentIngestion && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-destructive">No successful ingestion in the last 24 hours</p>
              <p className="text-xs text-muted-foreground">Click "Run Ingestion Now" to fetch articles from all sources.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inngest Cron Schedule */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-center gap-3">
          <Timer className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Automated Ingestion Schedule</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Inngest cron: <code className="bg-background/50 px-1 py-0.5 rounded text-[10px] font-mono">0 * * * *</code> — Articles ingested every hour + summaries regenerated.
              Daily full summary at <code className="bg-background/50 px-1 py-0.5 rounded text-[10px] font-mono">6:00 UTC</code>.
            </p>
          </div>
          <Badge variant="default" className="text-[10px]">Active</Badge>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Database className="h-4 w-4" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Total</span>
            </div>
            {countsLoading ? <Skeleton className="h-7 w-16" /> : (
              <p className="font-heading font-bold text-2xl">{totalArticles}</p>
            )}
          </CardContent>
        </Card>

        {counts && Object.entries(counts).map(([lane, count]) => (
          <Card key={lane} className="border-border/30">
            <CardContent className="p-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{getLaneLabel(lane)}</span>
              <p className="font-heading font-bold text-2xl">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Latest run */}
      {latestRun && (
        <Card className="border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Latest Ingestion Run
              <span className="text-[10px] font-mono text-muted-foreground ml-auto">{relativeTime(latestRun.started_at)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Status</span>
              <div className="mt-1">
                <Badge variant={latestRun.status === 'completed' ? 'default' : latestRun.status === 'running' ? 'secondary' : 'destructive'} className="text-[10px]">
                  {latestRun.status}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Source</span>
              <p className="font-medium mt-1">{latestRun.source_name || '—'}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Fetched / Inserted</span>
              <p className="font-medium mt-1">{latestRun.articles_fetched} / {latestRun.articles_inserted}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Dupes / Failed</span>
              <p className="font-medium mt-1">{latestRun.duplicates_skipped} / {latestRun.failed_count}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Source Manager */}
      <SourceManager />

      {/* Recent runs table */}
      <Card className="border-border/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Recent Runs</CardTitle>
        </CardHeader>
        <CardContent>
          {runsLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : !runs?.length ? (
            <p className="text-xs text-muted-foreground py-8 text-center font-mono">No ingestion runs recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/30">
                  <TableHead className="text-[10px] font-mono">Time</TableHead>
                  <TableHead className="text-[10px] font-mono">Source</TableHead>
                  <TableHead className="text-[10px] font-mono">Status</TableHead>
                  <TableHead className="text-[10px] font-mono">Fetched</TableHead>
                  <TableHead className="text-[10px] font-mono">Inserted</TableHead>
                  <TableHead className="text-[10px] font-mono">Dupes</TableHead>
                  <TableHead className="text-[10px] font-mono">Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map(run => (
                  <TableRow key={run.id} className="border-border/20">
                    <TableCell className="text-xs font-mono">{relativeTime(run.started_at)}</TableCell>
                    <TableCell className="text-xs">{run.source_name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={run.status === 'completed' ? 'default' : run.status === 'running' ? 'secondary' : 'destructive'} className="text-[10px]">
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{run.articles_fetched}</TableCell>
                    <TableCell className="text-xs font-mono">{run.articles_inserted}</TableCell>
                    <TableCell className="text-xs font-mono">{run.duplicates_skipped}</TableCell>
                    <TableCell className="text-xs text-destructive">{run.error_message ? '⚠' : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
