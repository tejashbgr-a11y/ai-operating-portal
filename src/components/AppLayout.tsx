import { Outlet } from 'react-router-dom';
import { TopNav } from '@/components/TopNav';
import { SignInPrompt } from '@/components/auth/SignInPrompt';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background bg-grid">
      <TopNav />
      <main className="container py-8">
        <Outlet />
      </main>
      <footer className="border-t border-border/30 py-5">
        <div className="container text-center text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">
          AI Operating Portal — Signal for operators & builders
        </div>
      </footer>
      <SignInPrompt />
    </div>
  );
}
