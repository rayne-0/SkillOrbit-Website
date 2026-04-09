/**
 * GamificationContext.jsx
 * 
 * Global context that tracks XP, level, badges, and streak.
 * - Fetches from backend on mount (when authenticated)
 * - Caches in localStorage for instant UI
 * - Exposes awardXP() helper called after lesson completion
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const GamificationContext = createContext(null);

const API_BASE = 'http://localhost:8000';

// XP thresholds per level (index = level - 1)
export const LEVEL_XP_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,
  3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450,
];

export const getLevelForXP = (xp) => {
  let level = 1;
  for (let i = 0; i < LEVEL_XP_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_XP_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, 20);
};

export const getNextLevelXP = (xp) => {
  const level = getLevelForXP(xp);
  if (level >= 20) return LEVEL_XP_THRESHOLDS[19];
  return LEVEL_XP_THRESHOLDS[level];
};

export const getCurrentLevelXP = (xp) => {
  const level = getLevelForXP(xp);
  return LEVEL_XP_THRESHOLDS[level - 1];
};

const DEFAULT_PROFILE = {
  xp: 0, level: 1, badges: [], badges_full: [], streak: 0,
  total_lessons_completed: 0, ai_questions_asked: 0, notes_created: 0,
  next_level_xp: 100, current_level_xp: 0,
};

export function GamificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(() => {
    try {
      const cached = localStorage.getItem('skillorbit_gamification');
      return cached ? JSON.parse(cached) : DEFAULT_PROFILE;
    } catch { return DEFAULT_PROFILE; }
  });
  const [loading, setLoading] = useState(false);
  const [newBadges, setNewBadges] = useState([]); // badges just earned (for toast)

  const getTokens = () => {
    try {
      const stored = localStorage.getItem('skillorbit_tokens');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  };

  const fetchProfile = useCallback(async () => {
    const tokens = getTokens();
    if (!tokens?.access) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/gamification/profile/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        localStorage.setItem('skillorbit_gamification', JSON.stringify(data.profile));
      }
    } catch (e) {
      console.warn('Gamification fetch failed, using cache');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchProfile();
    else { setProfile(DEFAULT_PROFILE); localStorage.removeItem('skillorbit_gamification'); }
  }, [isAuthenticated, fetchProfile]);

  /**
   * Award XP optimistically (update UI immediately, sync with backend).
   * Returns the gamification result from the backend.
   */
  const awardXP = useCallback(async (xpAmount = 50, action = 'lesson') => {
    const tokens = getTokens();
    if (!tokens?.access) return null;

    // Optimistic update
    setProfile(prev => {
      const newXP = prev.xp + xpAmount;
      const updated = {
        ...prev,
        xp: newXP,
        level: getLevelForXP(newXP),
        next_level_xp: getNextLevelXP(newXP),
        current_level_xp: getCurrentLevelXP(newXP),
      };
      localStorage.setItem('skillorbit_gamification', JSON.stringify(updated));
      return updated;
    });

    try {
      const res = await fetch(`${API_BASE}/api/gamification/award/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.access}` },
        body: JSON.stringify({ xp: xpAmount, action }),
      });
      const data = await res.json();
      if (data.success) {
        const r = data.result;
        // Sync accurate profile from server
        await fetchProfile();
        // Trigger badge notifications
        if (r.new_badges_full?.length > 0) setNewBadges(r.new_badges_full);
        return r;
      }
    } catch (e) {
      console.warn('XP award sync failed (optimistic update applied)');
    }
    return null;
  }, [fetchProfile]);

  const clearNewBadges = useCallback(() => setNewBadges([]), []);

  return (
    <GamificationContext.Provider value={{
      profile, loading, newBadges, awardXP, fetchProfile, clearNewBadges,
      getLevelForXP, getNextLevelXP, getCurrentLevelXP, LEVEL_XP_THRESHOLDS,
    }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider');
  return ctx;
}
