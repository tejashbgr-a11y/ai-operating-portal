import { Link, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { LANE_ORDER, LANES } from '@/lib/lanes';

interface TopNavProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  ...LANE_ORDER.map(id => ({ path: `/${id}`, label: LANES[id].label })),
];

export function TopNav({ search, onSearchChange }: TopNavProps) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-14 items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-[0_0_20px_-4px_hsl(var(--primary)/0.5)] group-hover:shadow-[0_0_25px_-2px_hsl(var(--primary)/0.6)] transition-shadow">
            <span className="text-primary-foreground font-heading font-bold text-[10px]">AI</span>
          </div>
          <span className="font-heading font-bold text-sm hidden sm:inline tracking-tight">
            AI Operating Portal
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 overflow-x-auto">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap',
                location.pathname === item.path
                  ? 'bg-primary/15 text-primary shadow-[inset_0_0_12px_-4px_hsl(var(--primary)/0.2)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/weekly-digest"
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap',
              location.pathname === '/weekly-digest'
                ? 'bg-primary/15 text-primary shadow-[inset_0_0_12px_-4px_hsl(var(--primary)/0.2)]'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            Weekly Digest
          </Link>
          <Link
            to="/admin"
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap',
              location.pathname === '/admin'
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            Admin
          </Link>
        </nav>

        <div className="relative ml-auto w-48 lg:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search articles…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="h-8 pl-8 text-xs bg-muted/40 border-border/40 focus:border-primary/40 focus:shadow-[0_0_15px_-5px_hsl(var(--primary)/0.3)]"
          />
        </div>
      </div>
    </header>
  );
}
