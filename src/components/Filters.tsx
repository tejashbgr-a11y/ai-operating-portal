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
  { value: '', label: 'All time' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
];

export function Filters({ timeRange, onTimeRangeChange, sources = [], selectedSource, onSourceChange }: FiltersProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-muted-foreground font-medium mr-1">Time:</span>
        {TIME_OPTIONS.map(opt => (
          <Button
            key={opt.value}
            variant="ghost"
            size="sm"
            className={cn('h-7 text-[11px] px-2', timeRange === opt.value && 'bg-muted font-semibold')}
            onClick={() => onTimeRangeChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {sources.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="text-[11px] text-muted-foreground font-medium mr-1">Source:</span>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 text-[11px] px-2', !selectedSource && 'bg-muted font-semibold')}
            onClick={() => onSourceChange('')}
          >
            All
          </Button>
          {sources.map(s => (
            <Button
              key={s}
              variant="ghost"
              size="sm"
              className={cn('h-7 text-[11px] px-2 whitespace-nowrap', selectedSource === s && 'bg-muted font-semibold')}
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
