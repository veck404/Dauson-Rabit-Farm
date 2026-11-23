import { createClient } from "@supabase/supabase-js";
import {
  breedingRecords,
  feedRecords,
  healthRecords,
  initialRabbits,
  initialTasks,
  transactions,
} from "./farm-data";
import type {
  BreedingRecord,
  FarmTask,
  FeedRecord,
  HealthRecord,
  Rabbit,
  Transaction,
} from "./types";

export type FarmDatabase = {
  version: 1;
  revision: number;
  updatedAt: string;
  rabbits: Rabbit[];
  transactions: Transaction[];
  inventory: FeedRecord[];
  breeding: BreedingRecord[];
  health: HealthRecord[];
  tasks: FarmTask[];
};

export type FarmCollection = keyof Pick<
  FarmDatabase,
  "rabbits" | "transactions" | "inventory" | "breeding" | "health" | "tasks"
>;

// ---------------------------------------------------------------------------
// Supabase client (server-side only — uses the service role key)
// ---------------------------------------------------------------------------
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

const ROW_ID = "singleton"; // We store the whole DB in one row

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const collectionNames: FarmCollection[] = [
  "rabbits",
  "transactions",
  "inventory",
  "breeding",
  "health",
  "tasks",
];

const idFormats: Record<FarmCollection, { prefix: string; width: number }> = {
  rabbits: { prefix: "RB-", width: 4 },
  transactions: { prefix: "TX-", width: 3 },
  inventory: { prefix: "ST-", width: 3 },
  breeding: { prefix: "BR-", width: 3 },
  health: { prefix: "HL-", width: 3 },
  tasks: { prefix: "T-", width: 1 },
};

function seededDatabase(): FarmDatabase {
  return {
    version: 1,
    revision: 1,
    updatedAt: new Date().toISOString(),
    rabbits: initialRabbits,
    transactions,
    inventory: feedRecords,
    breeding: breedingRecords,
    health: healthRecords,
    tasks: initialTasks,
  };
}

function isCollection(value: unknown): value is FarmCollection {
  return collectionNames.includes(value as FarmCollection);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeDatabase(value: unknown): FarmDatabase {
  const seed = seededDatabase();
  if (!isRecord(value)) return seed;
  return {
    version: 1,
    revision:
      typeof value.revision === "number" && value.revision > 0
        ? value.revision
        : seed.revision,
    updatedAt:
      typeof value.updatedAt === "string" ? value.updatedAt : seed.updatedAt,
    rabbits: Array.isArray(value.rabbits) ? (value.rabbits as Rabbit[]) : seed.rabbits,
    transactions: Array.isArray(value.transactions)
      ? (value.transactions as Transaction[])
      : seed.transactions,
    inventory: Array.isArray(value.inventory)
      ? (value.inventory as FeedRecord[])
      : seed.inventory,
    breeding: Array.isArray(value.breeding)
      ? (value.breeding as BreedingRecord[])
      : seed.breeding,
    health: Array.isArray(value.health)
      ? (value.health as HealthRecord[])
      : seed.health,
    tasks: Array.isArray(value.tasks) ? (value.tasks as FarmTask[]) : seed.tasks,
  };
}

function nextId(collection: FarmCollection, records: Array<{ id: string }>) {
  const { prefix, width } = idFormats[collection];
  const next =
    Math.max(0, ...records.map(({ id }) => Number(id.replace(/\D/g, "")) || 0)) + 1;
  return `${prefix}${String(next).padStart(width, "0")}`;
}

// ---------------------------------------------------------------------------
// Row shape returned by Supabase (snake_case column names)
// ---------------------------------------------------------------------------
type DbRow = {
  id: string;
  version: number;
  revision: number;
  updated_at: string;
  rabbits: unknown;
  transactions: unknown;
  inventory: unknown;
  breeding: unknown;
  health: unknown;
  tasks: unknown;
};

function rowToDatabase(row: DbRow): FarmDatabase {
  return normalizeDatabase({
    version: row.version,
    revision: row.revision,
    updatedAt: row.updated_at,
    rabbits: row.rabbits,
    transactions: row.transactions,
    inventory: row.inventory,
    breeding: row.breeding,
    health: row.health,
    tasks: row.tasks,
  });
}

function databaseToRow(db: FarmDatabase): Omit<DbRow, "id"> {
  return {
    version: db.version,
    revision: db.revision,
    updated_at: db.updatedAt,
    rabbits: db.rabbits,
    transactions: db.transactions,
    inventory: db.inventory,
    breeding: db.breeding,
    health: db.health,
    tasks: db.tasks,
  };
}

// ---------------------------------------------------------------------------
// Core read / write
// ---------------------------------------------------------------------------
async function loadDatabase(): Promise<FarmDatabase> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("farm_data")
    .select("*")
    .eq("id", ROW_ID)
    .maybeSingle<DbRow>();

  if (error) throw new Error(`Supabase read error: ${error.message}`);

  if (!data) {
    // First run — seed the database
    const seed = seededDatabase();
    await saveDatabase(seed);
    return seed;
  }

  return rowToDatabase(data);
}

async function saveDatabase(database: FarmDatabase): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("farm_data")
    .upsert({ id: ROW_ID, ...databaseToRow(database) }, { onConflict: "id" });
  if (error) throw new Error(`Supabase write error: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Serialised operation queue (prevents concurrent writes racing each other)
// ---------------------------------------------------------------------------
let operationQueue: Promise<void> = Promise.resolve();

function withLock<T>(operation: () => Promise<T>): Promise<T> {
  const result = operationQueue.then(operation, operation);
  operationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

// ---------------------------------------------------------------------------
// Public API  (identical signatures to the old file-based version)
// ---------------------------------------------------------------------------
export function readFarmDatabase() {
  return withLock(loadDatabase);
}

export function mutateFarmDatabase(input: {
  collection: unknown;
  action: unknown;
  record?: unknown;
  id?: unknown;
}) {
  return withLock(async () => {
    if (!isCollection(input.collection)) throw new Error("Invalid collection");
    if (input.action !== "upsert" && input.action !== "delete") {
      throw new Error("Invalid action");
    }

    const database = await loadDatabase();
    const collection = input.collection;
    const records = database[collection] as Array<Record<string, unknown> & { id: string }>;

    if (input.action === "delete") {
      if (typeof input.id !== "string") throw new Error("A record id is required");
      (database[collection] as unknown[]) = records.filter(({ id }) => id !== input.id);
    } else {
      if (!isRecord(input.record)) throw new Error("A record is required");
      const suppliedId = typeof input.record.id === "string" ? input.record.id : null;
      const id = suppliedId ?? nextId(collection, records);
      const record = { ...input.record, id };
      const existingIndex = records.findIndex((item) => item.id === id);
      if (existingIndex === -1) records.unshift(record);
      else records[existingIndex] = record;
    }

    database.revision += 1;
    database.updatedAt = new Date().toISOString();
    await saveDatabase(database);
    return database;
  });
}

export function mergeLegacyDatabase(input: unknown) {
  return withLock(async () => {
    if (!isRecord(input)) throw new Error("Invalid legacy data");
    const database = await loadDatabase();

    for (const collection of collectionNames) {
      const incoming = (input as Record<string, unknown>)[collection];
      if (!Array.isArray(incoming)) continue;
      const merged = new Map(
        (database[collection] as Array<{ id: string }>).map((record) => [record.id, record]),
      );
      for (const record of incoming) {
        if (isRecord(record) && typeof record.id === "string")
          merged.set(record.id, record as { id: string });
      }
      (database[collection] as unknown[]) = Array.from(merged.values());
    }

    database.revision += 1;
    database.updatedAt = new Date().toISOString();
    await saveDatabase(database);
    return database;
  });
}
