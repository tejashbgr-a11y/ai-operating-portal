import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ExternalLink, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LANE_ORDER, LANES, getLaneBadgeClasses, getLaneLabel } from '@/lib/lanes';
import { relativeTime } from '@/lib/time';
import { useArticles } from '@/hooks/useArticles';
import { UserMenu } from '@/components/auth/UserMenu';

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/for-you', label: 'For You' },
  ...LANE_ORDER.map(id => ({ path: `/${id}`, label: LANES[id].label })),
];

export function TopNav() {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: results } = useArticles({
    search: search.length >= 2 ? search : undefined,
    limit: 8,
  });

  const showDropdown = open && search.length >= 2 && results && results.length > 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setOpen(false);
    setSearch('');
  }, [location.pathname]);

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
        </nav>

        <div ref={wrapperRef} className="relative ml-auto w-40 lg:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search articles…"
            value={search}
            onChange={e => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            className="h-8 pl-8 pr-8 text-xs bg-muted/40 border-border/40 focus:border-primary/40 focus:shadow-[0_0_15px_-5px_hsl(var(--primary)/0.3)]"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setOpen(false); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {showDropdown && (
            <div className="absolute top-full mt-1.5 left-0 right-0 lg:-left-32 lg:w-[32rem] bg-card border border-border/60 rounded-lg shadow-[0_8px_40px_-10px_hsl(var(--primary)/0.2)] max-h-[28rem] overflow-y-auto z-[100]">
              <div className="p-2 border-b border-border/30">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest px-2">
                  {results.length} result{results.length !== 1 ? 's' : ''} for "{search}"
                </span>
              </div>
              <div className="divide-y divide-border/20">
                {results.map(article => (
                  <a
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors group/item"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-widest border ${getLaneBadgeClasses(article.primary_lane)}`}>
                          {getLaneLabel(article.primary_lane)}
                        </Badge>
                        {article.source && (
                          <span className="text-[9px] text-muted-foreground font-mono">{article.source}</span>
                        )}
                        <span className="text-[9px] text-muted-foreground font-mono">
                          {relativeTime(article.published_at)}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold leading-snug line-clamp-2 group-hover/item:text-primary transition-colors">
                        {article.title}
                      </h4>
                      {article.description && (
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-1">
                          {article.description}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {open && search.length >= 2 && results && results.length === 0 && (
            <div className="absolute top-full mt-1.5 left-0 right-0 lg:-left-32 lg:w-[32rem] bg-card border border-border/60 rounded-lg shadow-lg p-6 text-center z-[100]">
              <p className="text-xs text-muted-foreground">No articles found for "{search}"</p>
            </div>
          )}
        </div>

        <div className="shrink-0">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
