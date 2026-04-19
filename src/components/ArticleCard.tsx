import { ExternalLink, Bookmark, Heart, EyeOff, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getLaneBadgeClasses, getLaneLabel } from '@/lib/lanes';
import { relativeTime } from '@/lib/time';
import { useToast } from '@/hooks/use-toast';
import { useInteractionSets, useToggleInteraction, useRecordClick } from '@/hooks/useInteractions';
import type { Database } from '@/integrations/supabase/types';

type Article = Database['public']['Tables']['articles']['Row'];

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { data: sets } = useInteractionSets();
  const toggle = useToggleInteraction();
  const recordClick = useRecordClick();
  const { toast } = useToast();

  const saved = sets?.save.has(article.id) ?? false;
  const liked = sets?.like.has(article.id) ?? false;
  const hidden = sets?.hide.has(article.id) ?? false;

  if (hidden) return null;

  const tags = Array.isArray(article.secondary_tags)
    ? (article.secondary_tags as string[]).slice(0, 3)
    : [];

  const freshnessTimestamp = !article.published_at || new Date(article.ingested_at).getTime() > new Date(article.published_at).getTime()
    ? article.ingested_at
    : article.published_at;

  const handleSave = async () => {
    const r = await toggle.mutateAsync({ articleId: article.id, kind: 'save' });
    toast({ description: r.on ? 'Saved for later' : 'Removed from saved' });
  };
  const handleLike = async () => {
    await toggle.mutateAsync({ articleId: article.id, kind: 'like' });
  };
  const handleHide = async () => {
    await toggle.mutateAsync({ articleId: article.id, kind: 'hide' });
    toast({ description: 'Hidden from your feed' });
  };
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(article.url);
      toast({ description: 'Link copied to clipboard' });
    } catch {
      toast({ description: 'Failed to copy link', variant: 'destructive' });
    }
  };
  const handleClickTitle = () => { recordClick(article.id); };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_-8px_hsl(var(--primary)/0.15)] border-border/40 hover:border-primary/20">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-widest border ${getLaneBadgeClasses(article.primary_lane)}`}>
                {getLaneLabel(article.primary_lane)}
              </Badge>
              {article.source && (
                <span className="text-[10px] text-muted-foreground font-mono">{article.source}</span>
              )}
              <span className="text-[10px] text-muted-foreground font-mono">
                Updated {relativeTime(freshnessTimestamp)}
              </span>
            </div>
            <h3 className="font-heading font-semibold text-sm leading-snug line-clamp-2">
              <a href={article.url} target="_blank" rel="noopener noreferrer" onClick={handleClickTitle} className="hover:text-primary transition-colors">
                {article.title}
              </a>
            </h3>
          </div>
        </div>

        {article.description && (
          <p className={`text-xs text-muted-foreground leading-relaxed ${
            ['builder_lab', 'tool_radar'].includes(article.primary_lane) ? 'line-clamp-5' : 'line-clamp-2'
          }`}>
            {article.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-1.5 flex-wrap">
            {tags.map(tag => (
              <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-muted/60 text-muted-foreground border border-border/30">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary" onClick={handleLike} aria-label="Like">
              <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-primary text-primary' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary" onClick={handleSave} aria-label="Save">
              <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-primary text-primary' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={handleHide} aria-label="Hide">
              <EyeOff className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary" onClick={handleShare} aria-label="Share">
              <Share2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary" asChild>
              <a href={article.url} target="_blank" rel="noopener noreferrer" onClick={handleClickTitle} aria-label="Open original">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
