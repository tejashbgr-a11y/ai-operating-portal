const SAVED_KEY = 'aop_saved_articles';

export function getSavedArticles(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
  } catch { return []; }
}

export function toggleSavedArticle(id: string): boolean {
  const saved = getSavedArticles();
  const idx = saved.indexOf(id);
  if (idx >= 0) {
    saved.splice(idx, 1);
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    return false;
  }
  saved.push(id);
  localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  return true;
}

export function isArticleSaved(id: string): boolean {
  return getSavedArticles().includes(id);
}
