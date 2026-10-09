function getHoldKey(userId: number, sessionId: number): string {
  return `kino-hold-${userId}-${sessionId}`;
}

export function saveHoldId(
  userId: number,
  sessionId: number,
  holdId: string,
): void {
  try {
    localStorage.setItem(getHoldKey(userId, sessionId), holdId);
  } catch {
    // Persistence is optional; a live reservation must remain usable without it.
  }
}

export function getSavedHoldId(
  userId: number,
  sessionId: number,
): string | null {
  try {
    return localStorage.getItem(getHoldKey(userId, sessionId));
  } catch {
    return null;
  }
}

export function clearHoldId(userId: number, sessionId: number): void {
  try {
    localStorage.removeItem(getHoldKey(userId, sessionId));
  } catch {
    // The server remains authoritative if browser storage is unavailable.
  }
}
