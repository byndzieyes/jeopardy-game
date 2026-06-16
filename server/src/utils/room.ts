/**
 * Generate a random 4-character alphanumeric room code (e.g., XF4G).
 */
export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}
