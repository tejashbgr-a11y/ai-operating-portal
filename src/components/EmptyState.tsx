import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ title = 'No articles yet', description = 'New content will appear here once the ingestion pipeline runs.' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-4 border border-border/30">
        <Inbox className="h-5 w-5 text-muted-foreground/50" />
      </div>
      <h3 className="font-heading font-semibold text-sm text-muted-foreground">{title}</h3>
      <p className="text-[11px] text-muted-foreground/60 mt-1 max-w-xs font-mono">{description}</p>
    </div>
  );
}
