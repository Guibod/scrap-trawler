type EventPayloadMap = {
  "storage:changed": {
    table: string
    key: string
    action: "create" | "update" | "delete"
  },
  "test:event": { foo: string }
}
type EventName = keyof EventPayloadMap
type Handler<K extends EventName> = (payload: EventPayloadMap[K]) => void;


const listeners = new Map<EventName, Set<Handler<EventName>>>();
// Shared BroadcastChannel for cross-tab sync
const bc = new BroadcastChannel("scrap-trawler");

export const EventBus = {
  emit<K extends EventName>(type: K, payload: EventPayloadMap[K]) {
    // Local listeners
    listeners.get(type)?.forEach((fn) => fn(payload));
    // Cross-tab broadcast
    bc.postMessage({ type, payload });
  },

  on<K extends EventName>(type: K, fn: Handler<K>) {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type)!.add(fn);
    return () => {
      listeners.get(type)?.delete(fn);
    };
  },
};

// Listen to messages from other tabs
bc.onmessage = (e) => {
  const { type, payload } = e.data ?? {};
  if (!type) return;
  listeners.get(type)?.forEach((fn) => fn(payload));
};
