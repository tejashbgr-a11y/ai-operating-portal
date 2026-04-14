import { AlertTriangle, CheckCircle2, Clock, Database, Users, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useIngestionRuns, useArticleCountsByLane } from '@/hooks/useArticles';
import { getLaneLabel } from '@/lib/lanes';
import { relativeTime } from '@/lib/time';

export default function AdminPage() {
  const { data: runs, isLoading: runsLoading } = useIngestionRuns();
  const { data: counts, isLoading: countsLoading } = useArticleCountsByLane();

  const latestRun = runs?.[0];
  const totalArticles = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;

  const noRecentIngestion = latestRun
    ? (Date.now() - new Date(latestRun.started_at).getTime()) > 86400000
    : true;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-xl font-bold">Admin Dashboard</h1>

      {noRecentIngestion && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-destructive">No successful ingestion in the last 24 hours</p>
              <p className="text-xs text-muted-foreground">Check the ingestion pipeline and source configuration.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Database className="h-4 w-4" />
              <span className="text-xs font-medium">Total Articles</span>
            </div>
            {countsLoading ? <Skeleton className="h-7 w-16" /> : (
              <p className="font-heading font-bold text-2xl">{totalArticles}</p>
            )}
          </CardContent>
        </Card>

        {counts && Object.entries(counts).map(([lane, count]) => (
          <Card key={lane}>
            <CardContent className="p-4">
              <span className="text-xs font-medium text-muted-foreground">{getLaneLabel(lane)}</span>
              <p className="font-heading font-bold text-2xl">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Latest run */}
      {latestRun && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Latest Ingestion Run
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Status</span>
              <div className="mt-0.5">
                <Badge variant={latestRun.status === 'completed' ? 'default' : 'destructive'} className="text-[10px]">
                  {latestRun.status}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Source</span>
              <p className="font-medium">{latestRun.source_name || '—'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Fetched / Inserted</span>
              <p className="font-medium">{latestRun.articles_fetched} / {latestRun.articles_inserted}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Dupes / Malformed / Failed</span>
              <p className="font-medium">{latestRun.duplicates_skipped} / {latestRun.malformed_skipped} / {latestRun.failed_count}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent runs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Recent Runs</CardTitle>
        </CardHeader>
        <CardContent>
          {runsLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : !runs?.length ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No ingestion runs recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Time</TableHead>
                  <TableHead className="text-xs">Source</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Fetched</TableHead>
                  <TableHead className="text-xs">Inserted</TableHead>
                  <TableHead className="text-xs">Dupes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map(run => (
                  <TableRow key={run.id}>
                    <TableCell className="text-xs">{relativeTime(run.started_at)}</TableCell>
                    <TableCell className="text-xs">{run.source_name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={run.status === 'completed' ? 'default' : run.status === 'running' ? 'secondary' : 'destructive'} className="text-[10px]">
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{run.articles_fetched}</TableCell>
                    <TableCell className="text-xs">{run.articles_inserted}</TableCell>
                    <TableCell className="text-xs">{run.duplicates_skipped}</TableCell>
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
