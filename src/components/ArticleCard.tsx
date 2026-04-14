import { useState } from 'react';
import { ExternalLink, Bookmark, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getLaneBadgeClasses, getLaneLabel } from '@/lib/lanes';
import { relativeTime } from '@/lib/time';
import { toggleSavedArticle, isArticleSaved } from '@/lib/saved';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Article = Database['public']['Tables']['articles']['Row'];

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const [saved, setSaved] = useState(() => isArticleSaved(article.id));
  const { toast } = useToast();

  const tags = Array.isArray(article.secondary_tags)
    ? (article.secondary_tags as string[]).slice(0, 3)
    : [];

  const handleSave = () => {
    const nowSaved = toggleSavedArticle(article.id);
    setSaved(nowSaved);
    toast({ description: nowSaved ? 'Saved for later' : 'Removed from saved' });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(article.url);
      toast({ description: 'Link copied to clipboard' });
    } catch {
      toast({ description: 'Failed to copy link', variant: 'destructive' });
    }
  };

  return (
    <Card className="group transition-shadow hover:shadow-md border-border/60">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-wider border ${getLaneBadgeClasses(article.primary_lane)}`}>
                {getLaneLabel(article.primary_lane)}
              </Badge>
              {article.source && (
                <span className="text-[11px] text-muted-foreground font-medium">{article.source}</span>
              )}
              <span className="text-[11px] text-muted-foreground">
                {relativeTime(article.published_at)}
              </span>
            </div>
            <h3 className="font-heading font-semibold text-sm leading-snug line-clamp-2">
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                {article.title}
              </a>
            </h3>
          </div>
        </div>

        {article.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {article.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-1 flex-wrap">
            {tags.map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSave} title={saved ? 'Unsave' : 'Save for later'}>
              <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleShare} title="Copy link">
              <Share2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
              <a href={article.url} target="_blank" rel="noopener noreferrer" title="Read original">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
