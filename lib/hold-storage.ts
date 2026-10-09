function getHoldKey(userId: number, sessionId: number): string {
  return `kino-hold-${userId}-${sessionId}`;
}

export function saveHoldId(
  userId: number,
  sessionId: number,
  holdId: string,
): void {
  localStorage.setItem(getHoldKey(userId, sessionId), holdId);
}

export function getSavedHoldId(
  userId: number,
  sessionId: number,
): string | null {
  return localStorage.getItem(getHoldKey(userId, sessionId));
}

export function clearHoldId(userId: number, sessionId: number): void {
  localStorage.removeItem(getHoldKey(userId, sessionId));
}
