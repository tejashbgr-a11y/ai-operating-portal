import { Link } from 'react-router-dom';
import { LogOut, Bookmark, Heart, Settings, Sparkles, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleButton } from './GoogleButton';

export function UserMenu() {
  const { user, signOut, loading } = useAuth();

  if (loading) return <div className="h-8 w-8 rounded-full bg-muted/50 animate-pulse" />;
  if (!user) return <GoogleButton size="sm" variant="default" label="Sign in" />;

  const meta = user.user_metadata || {};
  const name = (meta.full_name as string) || (meta.name as string) || user.email?.split('@')[0] || 'User';
  const avatar = (meta.avatar_url as string) || (meta.picture as string) || '';
  const initials = name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-[10px] bg-primary/15 text-primary font-semibold">
              {initials || <UserIcon className="h-3.5 w-3.5" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="font-normal">
          <div className="text-xs font-semibold truncate">{name}</div>
          <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/for-you" className="cursor-pointer text-xs"><Sparkles className="h-3.5 w-3.5 mr-2" />For You</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/saved" className="cursor-pointer text-xs"><Bookmark className="h-3.5 w-3.5 mr-2" />Saved</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/liked" className="cursor-pointer text-xs"><Heart className="h-3.5 w-3.5 mr-2" />Liked</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer text-xs"><Settings className="h-3.5 w-3.5 mr-2" />Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-xs">
          <LogOut className="h-3.5 w-3.5 mr-2" />Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
