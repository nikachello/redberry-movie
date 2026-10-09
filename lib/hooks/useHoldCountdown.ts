"use client";

import { useEffect, useState } from "react";

export function useHoldCountdown(expiresAt?: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [expiresAt]);

  const expirationTime = expiresAt ? new Date(expiresAt).getTime() : 0;

  const secondsRemaining = expiresAt
    ? Math.max(0, Math.ceil((expirationTime - now) / 1000))
    : 0;

  const isExpired = Boolean(expiresAt) && secondsRemaining === 0;

  return {
    secondsRemaining,
    isExpired,
  };
}
