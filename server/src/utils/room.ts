/**
 * Generate a random 4-character alphanumeric room code (e.g., XF4G).
 */
export function generateRoomCode(): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += charset[Math.floor(Math.random() * charset.length)];
  }
  return code;
}
