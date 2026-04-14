import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FiltersProps {
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  sources?: string[];
  selectedSource: string;
  onSourceChange: (source: string) => void;
}

const TIME_OPTIONS = [
  { value: '', label: 'All' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
];

export function Filters({ timeRange, onTimeRangeChange, sources = [], selectedSource, onSourceChange }: FiltersProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-0.5 bg-muted/30 rounded-lg p-0.5 border border-border/30">
        {TIME_OPTIONS.map(opt => (
          <Button
            key={opt.value}
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 text-[11px] font-mono px-2.5 rounded-md',
              timeRange === opt.value ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => onTimeRangeChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {sources.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto">
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 text-[11px] font-mono px-2', !selectedSource && 'bg-primary/15 text-primary')}
            onClick={() => onSourceChange('')}
          >
            All sources
          </Button>
          {sources.map(s => (
            <Button
              key={s}
              variant="ghost"
              size="sm"
              className={cn('h-7 text-[11px] font-mono px-2 whitespace-nowrap', selectedSource === s && 'bg-primary/15 text-primary')}
              onClick={() => onSourceChange(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
