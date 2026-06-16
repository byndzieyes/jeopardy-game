/**
 * Get or create a unique user ID.
 * If the ID doesn't exist, generate a new one using the browser's Crypto API.
 */
export function getOrCreateUserId(): string {
  const STORAGE_KEY = 'jeopardy_userid';
  let userId = localStorage.getItem(STORAGE_KEY);

  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, userId);
  }

  return userId;
}
