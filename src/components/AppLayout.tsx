import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from '@/components/TopNav';

export function AppLayout() {
  const [search, setSearch] = useState(() => localStorage.getItem('aop_search') || '');

  useEffect(() => {
    localStorage.setItem('aop_search', search);
  }, [search]);

  return (
    <div className="min-h-screen bg-background">
      <TopNav search={search} onSearchChange={setSearch} />
      <main className="container py-6">
        <Outlet context={{ search }} />
      </main>
      <footer className="border-t py-4">
        <div className="container text-center text-[11px] text-muted-foreground">
          AI Operating Portal — Built for operators, founders, and builders.
        </div>
      </footer>
    </div>
  );
}
