// Anonymous-only local state. Merged into the user's account on sign-in.
const SAVED_KEY = 'aop_saved_articles';
const LIKED_KEY = 'aop_liked_articles';
const HIDDEN_KEY = 'aop_hidden_articles';
const RECENT_CLICKS_KEY = 'aop_recent_clicks';
const PREFS_KEY = 'aop_anon_prefs';
const INTERACTION_COUNT_KEY = 'aop_interaction_count';
const SIGNIN_PROMPT_DISMISSED_KEY = 'aop_signin_prompt_dismissed';
const ANON_SESSION_KEY = 'aop_anon_session_id';

function read<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; }
  catch { return fallback; }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* noop */ }
}

export function getAnonSessionId(): string {
  let id = localStorage.getItem(ANON_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANON_SESSION_KEY, id);
  }
  return id;
}

export const getSaved   = () => read<string[]>(SAVED_KEY, []);
export const getLiked   = () => read<string[]>(LIKED_KEY, []);
export const getHidden  = () => read<string[]>(HIDDEN_KEY, []);
export const getRecentClicks = () => read<string[]>(RECENT_CLICKS_KEY, []);

export function toggleInList(key: string, id: string): boolean {
  const list = read<string[]>(key, []);
  const idx = list.indexOf(id);
  if (idx >= 0) { list.splice(idx, 1); write(key, list); return false; }
  list.push(id); write(key, list); return true;
}
export const toggleSaved  = (id: string) => toggleInList(SAVED_KEY, id);
export const toggleLiked  = (id: string) => toggleInList(LIKED_KEY, id);
export const toggleHidden = (id: string) => toggleInList(HIDDEN_KEY, id);
export const isSaved  = (id: string) => getSaved().includes(id);
export const isLiked  = (id: string) => getLiked().includes(id);
export const isHidden = (id: string) => getHidden().includes(id);

export function recordClick(id: string) {
  const clicks = read<string[]>(RECENT_CLICKS_KEY, []);
  const filtered = clicks.filter(x => x !== id);
  filtered.unshift(id);
  write(RECENT_CLICKS_KEY, filtered.slice(0, 50));
}

export interface AnonPrefs {
  preferred_lanes: string[];
  preferred_tags: string[];
  preferred_sources: string[];
  pulse_weight: number;
  business_weight: number;
  tools_weight: number;
  builder_weight: number;
}
const DEFAULT_PREFS: AnonPrefs = {
  preferred_lanes: [], preferred_tags: [], preferred_sources: [],
  pulse_weight: 1, business_weight: 1, tools_weight: 1, builder_weight: 1,
};
export const getAnonPrefs = (): AnonPrefs => ({ ...DEFAULT_PREFS, ...read<Partial<AnonPrefs>>(PREFS_KEY, {}) });
export const setAnonPrefs = (p: Partial<AnonPrefs>) => write(PREFS_KEY, { ...getAnonPrefs(), ...p });

// Soft sign-in prompt: count meaningful interactions
export function bumpInteraction(): number {
  const n = (read<number>(INTERACTION_COUNT_KEY, 0) || 0) + 1;
  write(INTERACTION_COUNT_KEY, n);
  return n;
}
export const interactionCount = () => read<number>(INTERACTION_COUNT_KEY, 0);
export const isSignInPromptDismissed = () => read<boolean>(SIGNIN_PROMPT_DISMISSED_KEY, false);
export const dismissSignInPrompt = () => write(SIGNIN_PROMPT_DISMISSED_KEY, true);

export function clearAnonAfterMerge() {
  // Keep saved/liked locally too, but clear merge-only flags
  localStorage.removeItem(SAVED_KEY);
  localStorage.removeItem(LIKED_KEY);
  localStorage.removeItem(HIDDEN_KEY);
  localStorage.removeItem(PREFS_KEY);
}
