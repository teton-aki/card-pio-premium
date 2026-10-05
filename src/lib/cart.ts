"use client";

import { useSyncExternalStore } from "react";
import { restaurant } from "@/data/restaurant";
import { restoreCart, subtotal } from "./order";
import type { CartLine } from "./types";

const empty: CartLine[] = [];
let snapshot = empty;
let lastRaw: string | null | undefined;
let memoryOnly = false;
const listeners = new Set<() => void>();
const subscribeHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
export const useHydrated = () =>
  useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
function getSnapshot() {
  if (memoryOnly) return snapshot;
  try {
    const raw = localStorage.getItem(restaurant.cartStorageKey);
    if (raw !== lastRaw) {
      lastRaw = raw;
      snapshot = restoreCart(raw);
    }
  } catch {
    memoryOnly = true;
  }
  return snapshot;
}
function notify() {
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", notify);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", notify);
  };
}
function save(lines: CartLine[]) {
  snapshot = lines;
  lastRaw = JSON.stringify(lines);
  try {
    localStorage.setItem(restaurant.cartStorageKey, lastRaw);
  } catch {
    memoryOnly = true;
  }
  notify();
}
export function useCart() {
  const lines = useSyncExternalStore(subscribe, getSnapshot, () => empty);
  return {
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: subtotal(lines),
    memoryOnly,
    add: (line: CartLine) => save([...getSnapshot(), line]),
    update: (line: CartLine) =>
      save(
        getSnapshot().map((current) =>
          current.id === line.id ? line : current,
        ),
      ),
    quantity: (id: string, quantity: number) =>
      save(
        getSnapshot().flatMap((line) =>
          line.id === id
            ? quantity > 0
              ? [{ ...line, quantity: Math.min(99, quantity) }]
              : []
            : [line],
        ),
      ),
    remove: (id: string) =>
      save(getSnapshot().filter((line) => line.id !== id)),
    clear: () => save([]),
  };
}
