'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'bluebottlecap_quota';
const DAILY_LIMIT = 8;

export function useDailyQuota() {
  const [used, setUsed] = useState(0);
  const [resetLabel, setResetLabel] = useState('today');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, used: 0 }));
      setUsed(0);
      return;
    }

    try {
      const data = JSON.parse(stored) as { date: string; used: number };
      const today = new Date().toISOString().slice(0, 10);
      if (data.date !== today) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, used: 0 }));
        setUsed(0);
      } else {
        setUsed(data.used);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setUsed(0);
    }
  }, []);

  const remaining = useMemo(() => Math.max(0, DAILY_LIMIT - used), [used]);
  const limited = remaining <= 0;

  useEffect(() => {
    const date = new Date();
    date.setHours(24, 0, 0, 0);
    const diff = date.getTime() - Date.now();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    setResetLabel(`${hours}h ${minutes}m`);
  }, [used]);

  const increment = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toISOString().slice(0, 10);
    const data = stored ? JSON.parse(stored) as { date: string; used: number } : { date: today, used: 0 };
    const next = data.date === today ? data.used + 1 : 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, used: next }));
    setUsed(next);
  };

  return { used, remaining, limited, resetLabel, increment, limit: DAILY_LIMIT };
}
