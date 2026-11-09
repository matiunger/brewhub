// Tiny client-side store that tracks autosave state for the "Saving… / Saved" indicator.
//
// - markDirty(key): a debounced save is waiting to fire
// - clearDirty(key): the debounce fired (the save itself is tracked separately)
// - tracked(fn): wraps a server action so each call counts as an in-flight save

export type SaveState = "idle" | "saving" | "saved" | "error";

const dirtyKeys = new Set<string>();
let inFlight = 0;
let hasError = false;
let hasSaved = false;
let snapshot: SaveState = "idle";
const listeners = new Set<() => void>();

function emit() {
  const next: SaveState =
    dirtyKeys.size > 0 || inFlight > 0 ? "saving" : hasError ? "error" : hasSaved ? "saved" : "idle";
  if (next === snapshot) return;
  snapshot = next;
  listeners.forEach((l) => l());
}

export function subscribeSaveStatus(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSaveStatus(): SaveState {
  return snapshot;
}

export function getServerSaveStatus(): SaveState {
  return "idle";
}

export function hasUnsavedChanges() {
  return dirtyKeys.size > 0 || inFlight > 0;
}

export function markDirty(key: string) {
  dirtyKeys.add(key);
  emit();
}

export function clearDirty(key: string) {
  dirtyKeys.delete(key);
  emit();
}

export function resetSaveStatus() {
  dirtyKeys.clear();
  inFlight = 0;
  hasError = false;
  hasSaved = false;
  emit();
}

// Cache wrappers so the same action always gets the same wrapped function
// (keeps useCallback / useEffect dependencies stable).
const wrapped = new WeakMap<object, unknown>();
const wrappers = new WeakSet<object>();

export function tracked<A extends unknown[], R>(fn: (...args: A) => Promise<R>): (...args: A) => Promise<R> {
  if (wrappers.has(fn)) return fn; // already tracked
  const cached = wrapped.get(fn);
  if (cached) return cached as (...args: A) => Promise<R>;
  const wrapper = async (...args: A): Promise<R> => {
    inFlight++;
    emit();
    try {
      const result = await fn(...args);
      hasError = false;
      hasSaved = true;
      return result;
    } catch (err) {
      hasError = true;
      throw err;
    } finally {
      inFlight--;
      emit();
    }
  };
  wrapped.set(fn, wrapper);
  wrappers.add(wrapper);
  return wrapper;
}
