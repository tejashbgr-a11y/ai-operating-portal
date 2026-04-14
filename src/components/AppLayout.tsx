import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from '@/components/TopNav';

export function AppLayout() {
  const [search, setSearch] = useState(() => localStorage.getItem('aop_search') || '');

  useEffect(() => {
    localStorage.setItem('aop_search', search);
  }, [search]);

  return (
    <div className="min-h-screen bg-background bg-grid">
      <TopNav search={search} onSearchChange={setSearch} />
      <main className="container py-8">
        <Outlet context={{ search }} />
      </main>
      <footer className="border-t border-border/30 py-5">
        <div className="container text-center text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">
          AI Operating Portal — Signal for operators & builders
        </div>
      </footer>
    </div>
  );
}
