import { readJson, writeJson, isoNow } from "./storage";

const KEY = "taskmaster.updateEvents.v1";
const MAX_EVENTS = 500;

export type UpdateType =
  | "task_created"
  | "task_completed"
  | "task_reopened"
  | "task_deleted"
  | "task_updated"; // optional if/when you implement edits

export type UpdateEvent = {
  id: string;         // unique
  type: UpdateType;
  occurredAt: string; // ISO
  taskId: string;
  listId: string;
  title: string;      // snapshot title at time of event
  parentTaskId?: string | null;
};

type Store = { events: UpdateEvent[] };
const DEFAULTS: Store = { events: [] };

function getStore(): Store {
  return readJson<Store>(KEY, DEFAULTS);
}
function setStore(next: Store) {
  writeJson(KEY, next);
}

function makeId(prefix: string) {
  const core =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${core}`;
}

export const updatesEventStore = {
  append(evt: Omit<UpdateEvent, "id" | "occurredAt">): UpdateEvent {
    const store = getStore();
    const full: UpdateEvent = {
      ...evt,
      id: makeId("evt"),
      occurredAt: isoNow(),
    };

    const next = [full, ...(store.events ?? [])].slice(0, MAX_EVENTS);
    setStore({ events: next });
    return full;
  },

  getAll(): UpdateEvent[] {
    return getStore().events ?? [];
  },

  clearAll() {
    setStore(DEFAULTS);
  },
};
