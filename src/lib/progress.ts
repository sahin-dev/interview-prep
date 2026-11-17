"use client";
import { useSyncExternalStore } from "react";

export type Status = "todo" | "learning" | "done";
interface ProgressState {
  topics: Record<string, Status>;
  bookmarks: Record<string, true>;
  problems: Record<string, true>;
}

const KEY = "faang-prep-progress-v1";
const EMPTY: ProgressState = { topics: {}, bookmarks: {}, problems: {} };
let state: ProgressState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    /* storage unavailable */
  }
}

function save() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      loaded = false;
      load();
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useProgress() {
  const snap = useSyncExternalStore(
    subscribe,
    () => {
      load();
      return state;
    },
    () => EMPTY,
  );
  return snap;
}

export function setTopicStatus(slug: string, status: Status) {
  load();
  const topics = { ...state.topics };
  if (status === "todo") delete topics[slug];
  else topics[slug] = status;
  state = { ...state, topics };
  save();
}

export function toggleBookmark(slug: string) {
  load();
  const bookmarks = { ...state.bookmarks };
  if (bookmarks[slug]) delete bookmarks[slug];
  else bookmarks[slug] = true;
  state = { ...state, bookmarks };
  save();
}

export function setProblemSolved(id: string, solved: boolean) {
  load();
  const problems = { ...state.problems };
  if (solved) problems[id] = true;
  else delete problems[id];
  state = { ...state, problems };
  save();
}

export function resetProgress() {
  state = EMPTY;
  save();
}
