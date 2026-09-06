'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type SupplementPeriod = 'morning' | 'evening';
type ReminderKind = 'water' | 'eye';
type CompanionState = {
  dateKey: string; task: string; waterCount: number; waterGoal: number; eyeCount: number;
  focusSecondsToday: number; catXp: number; waterInterval: number; eyeInterval: number;
  nextWaterAt: number; nextEyeAt: number; morningSupplement: string; eveningSupplement: string;
  morningTime: string; eveningTime: string; supplements: Record<SupplementPeriod, boolean>;
};

const STORAGE_KEY = 'focus-nest-state-v1';
const todayKey = () => new Date().toLocaleDateString('en-CA');

function freshState(): CompanionState {
  const now = Date.now();
  return {
    dateKey: todayKey(), task: '', waterCount: 0, waterGoal: 8, eyeCount: 0,
    focusSecondsToday: 0, catXp: 0, waterInterval: 45, eyeInterval: 20,
    nextWaterAt: now + 45 * 60000, nextEyeAt: now + 20 * 60000,
    morningSupplement: '填写你的保健品', eveningSupplement: '填写你的保健品',
    morningTime: '09:00', eveningTime: '19:00', supplements: { morning: false, evening: false },
  };
}

function reminderTimestamp(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.getTime();
}

export function useAttentionCompanion() {
  const [state, setState] = useState<CompanionState>(freshState);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(0);
  const [focusDuration, setFocusDuration] = useState(5 * 60);
  const [focusRemaining, setFocusRemaining] = useState(5 * 60);
  const [focusRunning, setFocusRunning] = useState(false);
  const [focusEndAt, setFocusEndAt] = useState(0);
  const [eyeBreakRemaining, setEyeBreakRemaining] = useState(0);
  const [eyeBreakActive, setEyeBreakActive] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const notified = useRef(new Set<string>());

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const base = freshState();
      if (saved) {
        try {
          const parsed = { ...base, ...JSON.parse(saved) } as CompanionState;
          setState(parsed.dateKey === todayKey() ? parsed : {
            ...parsed, dateKey: todayKey(), waterCount: 0, eyeCount: 0, focusSecondsToday: 0,
            supplements: { morning: false, evening: false },
            nextWaterAt: Date.now() + parsed.waterInterval * 60000,
            nextEyeAt: Date.now() + parsed.eyeInterval * 60000,
          });
        } catch { setState(base); }
      }
      setNow(Date.now());
      setNotificationPermission('Notification' in window ? Notification.permission : 'denied');
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (focusRunning) setFocusRemaining(Math.max(0, Math.ceil((focusEndAt - current) / 1000)));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [focusEndAt, focusRunning]);

  const finishFocus = useCallback(() => {
    const elapsed = Math.max(0, focusDuration - focusRemaining);
    if (elapsed > 0) setState((current) => ({ ...current, focusSecondsToday: current.focusSecondsToday + elapsed, catXp: current.catXp + (elapsed >= 300 ? 8 : 3) }));
    setFocusRunning(false); setFocusRemaining(focusDuration); setFocusEndAt(0);
  }, [focusDuration, focusRemaining]);

  useEffect(() => {
    if (!focusRunning || focusRemaining !== 0) return;
    const completionTimer = window.setTimeout(finishFocus, 0);
    return () => window.clearTimeout(completionTimer);
  }, [finishFocus, focusRemaining, focusRunning]);

  useEffect(() => {
    if (!eyeBreakActive) return;
    if (eyeBreakRemaining <= 0) {
      const completionTimer = window.setTimeout(() => {
        setEyeBreakActive(false);
        setState((current) => ({ ...current, eyeCount: current.eyeCount + 1, catXp: current.catXp + 3, nextEyeAt: Date.now() + current.eyeInterval * 60000 }));
      }, 0);
      return () => window.clearTimeout(completionTimer);
    }
    const timer = window.setTimeout(() => setEyeBreakRemaining((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [eyeBreakActive, eyeBreakRemaining]);

  const logWater = useCallback(() => setState((current) => ({
    ...current, waterCount: Math.min(current.waterGoal, current.waterCount + 1), catXp: current.catXp + 2,
    nextWaterAt: Date.now() + current.waterInterval * 60000,
  })), []);

  const startEyeBreak = useCallback(() => { setEyeBreakRemaining(20); setEyeBreakActive(true); }, []);
  const stopEyeBreak = useCallback(() => { setEyeBreakRemaining(0); }, []);
  const logSupplement = useCallback((period: SupplementPeriod) => setState((current) => ({
    ...current, supplements: { ...current.supplements, [period]: true }, catXp: current.catXp + 2,
  })), []);

  const dueItems = useMemo(() => {
    const items: Array<{ title: string; detail: string; actionLabel: string; action: () => void; key: string }> = [];
    if (now >= state.nextEyeAt) items.push({ title: '眼睛已经工作很久了', detail: '看向 6 米外 20 秒，让眼睛真正离开屏幕。', actionLabel: '开始护眼', action: startEyeBreak, key: `eye-${state.nextEyeAt}` });
    if (now >= state.nextWaterAt) items.push({ title: '喝几口水吧', detail: '离开屏幕，慢慢喝完再回来。', actionLabel: '我喝完了', action: logWater, key: `water-${state.nextWaterAt}` });
    if (!state.supplements.morning && now >= reminderTimestamp(state.morningTime)) items.push({ title: '早餐后的保健品', detail: state.morningSupplement, actionLabel: '记录完成', action: () => logSupplement('morning'), key: `morning-${state.dateKey}` });
    if (!state.supplements.evening && now >= reminderTimestamp(state.eveningTime)) items.push({ title: '晚餐后的保健品', detail: state.eveningSupplement, actionLabel: '记录完成', action: () => logSupplement('evening'), key: `evening-${state.dateKey}` });
    return items;
  }, [logSupplement, logWater, now, startEyeBreak, state]);

  useEffect(() => {
    if (notificationPermission !== 'granted' || dueItems.length === 0) return;
    const item = dueItems[0];
    if (!notified.current.has(item.key)) { new Notification(item.title, { body: item.detail }); notified.current.add(item.key); }
  }, [dueItems, notificationPermission]);

  function prepareFocus(minutes: number) {
    const seconds = minutes * 60;
    setFocusDuration(seconds); setFocusRemaining(seconds); setFocusEndAt(Date.now() + seconds * 1000); setFocusRunning(true);
  }

  function toggleFocus() {
    if (focusRunning) { setFocusRemaining(Math.max(0, Math.ceil((focusEndAt - Date.now()) / 1000))); setFocusRunning(false); }
    else { setFocusEndAt(Date.now() + focusRemaining * 1000); setFocusRunning(true); }
  }

  function updateInterval(kind: ReminderKind, value: number) {
    const safe = Math.max(kind === 'water' ? 15 : 10, value || 0);
    if (kind === 'water') setState((current) => ({ ...current, waterInterval: safe, nextWaterAt: Date.now() + safe * 60000 }));
    else setState((current) => ({ ...current, eyeInterval: safe, nextEyeAt: Date.now() + safe * 60000 }));
  }

  function requestNotifications() {
    if ('Notification' in window) Notification.requestPermission().then(setNotificationPermission);
  }

  return {
    state, now, hydrated, focusRemaining, focusRunning, eyeBreakRemaining, dueItems, notificationPermission,
    setTask: (task: string) => setState((current) => ({ ...current, task })), prepareFocus, toggleFocus,
    finishFocus, logWater, startEyeBreak, stopEyeBreak, logSupplement, updateInterval,
    updateSupplement: (period: SupplementPeriod, value: string) => setState((current) => ({ ...current, [`${period}Supplement`]: value })),
    updateSupplementTime: (period: SupplementPeriod, value: string) => setState((current) => ({ ...current, [`${period}Time`]: value })),
    requestNotifications,
  };
}

export type AttentionCompanion = ReturnType<typeof useAttentionCompanion>;
