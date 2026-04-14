import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ title = 'No articles yet', description = 'New content will appear here once the ingestion pipeline runs.' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Inbox className="h-10 w-10 text-muted-foreground/40 mb-3" />
      <h3 className="font-heading font-semibold text-sm text-muted-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs">{description}</p>
    </div>
  );
}
