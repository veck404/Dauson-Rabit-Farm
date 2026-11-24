"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./Icon";
import { LoginScreen } from "./LoginScreen";
import { Dashboard, TaskModal } from "./farm/Dashboard";
import { Finance, TransactionModal } from "./farm/Finance";
import {
  Breeding,
  BreedingModal,
  Feed,
  Health,
  HealthModal,
  StockModal,
} from "./farm/Operations";
import { RabbitModal, RabbitRegistry } from "./farm/RabbitRegistry";
import { Reports, Settings } from "./farm/ReportsSettings";
import {
  breedingRecords,
  feedRecords,
  healthRecords,
  initialRabbits,
  initialTasks,
  transactions,
} from "../lib/farm-data";
import { defaultFarmSettings } from "../lib/types";
import { money } from "../lib/farm-utils";
import type {
  FarmSettings,
  BreedingRecord,
  FarmTask,
  FarmView,
  FeedRecord,
  HealthRecord,
  Rabbit,
  Transaction,
} from "../lib/types";
import type { FarmCollection, FarmDatabase } from "../lib/farm-store";

const nav: {
  id: FarmView;
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
}[] = [
  { id: "dashboard", label: "Overview", icon: "grid" },
  { id: "finance", label: "Finance", icon: "wallet" },
  { id: "rabbits", label: "Rabbit registry", icon: "rabbit" },
  { id: "breeding", label: "Breeding & litters", icon: "dna" },
  { id: "health", label: "Health & care", icon: "heart" },
  { id: "feed", label: "Feed & inventory", icon: "wheat" },
  { id: "reports", label: "Reports & exports", icon: "report" },
];

const emptyRabbit: Omit<Rabbit, "id"> = {
  tag: "",
  name: "",
  breed: "New Zealand White",
  sex: "Doe",
  status: "Healthy",
  purpose: "Breeder",
  dateOfBirth: "",
  weightKg: 0,
  cage: "",
  color: "",
  acquiredDate: new Date().toISOString().slice(0, 10),
  notes: "",
};

const AUTH_SESSION_KEY = "dauson-auth-v1";
const FARM_SETTINGS_KEY = "dauson-farm-settings-v1";
const AUTH_SESSION_DURATION = 6 * 60 * 60 * 1000;
const LEGACY_STORAGE_KEYS = {
  rabbits: "dauson-rabbits-v2",
  transactions: "dauson-transactions-v1",
  inventory: "dauson-inventory-v1",
  breeding: "dauson-breeding-v1",
  health: "dauson-health-v1",
  tasks: "dauson-tasks-v1",
} satisfies Record<FarmCollection, string>;

async function farmDataRequest(body?: Record<string, unknown>) {
  const response = await fetch("/api/farm-data", {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const result = (await response.json()) as FarmDatabase & { error?: string };
  if (!response.ok) throw new Error(result.error ?? "Unable to save farm records");
  return result;
}

function readLegacyData() {
  const database: Partial<Record<FarmCollection, unknown[]>> = {};
  const keysToRemove: string[] = [];
  for (const [collection, key] of Object.entries(LEGACY_STORAGE_KEYS) as Array<
    [FarmCollection, string]
  >) {
    const stored = window.localStorage.getItem(key);
    if (!stored) continue;
    try {
      const records = JSON.parse(stored) as unknown;
      if (Array.isArray(records)) {
        database[collection] = records;
        keysToRemove.push(key);
      }
    } catch {
      // Leave invalid legacy data untouched so it can be inspected manually.
    }
  }
  return { database, keysToRemove };
}

function validSessionExpiry(storage: Storage) {
  const stored = storage.getItem(AUTH_SESSION_KEY);
  if (!stored) return null;
  try {
    const session = JSON.parse(stored) as { expiresAt?: unknown };
    if (
      typeof session.expiresAt === "number" &&
      session.expiresAt > Date.now()
    ) {
      return session.expiresAt;
    }
  } catch {
    /* remove invalid or legacy sessions below */
  }
  storage.removeItem(AUTH_SESSION_KEY);
  return null;
}

export default function FarmApp() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authExpiresAt, setAuthExpiresAt] = useState<number | null>(null);
  const [view, setView] = useState<FarmView>("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [rabbits, setRabbits] = useState<Rabbit[]>(initialRabbits);
  const [financeTransactions, setFinanceTransactions] =
    useState<Transaction[]>(transactions);
  const [inventory, setInventory] = useState<FeedRecord[]>(feedRecords);
  const [breeding, setBreeding] = useState<BreedingRecord[]>(breedingRecords);
  const [health, setHealth] = useState<HealthRecord[]>(healthRecords);
  const [tasks, setTasks] = useState<FarmTask[]>(initialTasks);
  const [dataReady, setDataReady] = useState(false);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [transactionModal, setTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [stockModal, setStockModal] = useState(false);
  const [editingStock, setEditingStock] = useState<FeedRecord | null>(null);
  const [breedingModal, setBreedingModal] = useState(false);
  const [editingBreeding, setEditingBreeding] = useState<BreedingRecord | null>(
    null,
  );
  const [healthModal, setHealthModal] = useState(false);
  const [editingHealth, setEditingHealth] = useState<HealthRecord | null>(null);
  const [taskModal, setTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<FarmTask | null>(null);
  const [draft, setDraft] = useState<Omit<Rabbit, "id"> & { id?: string }>(
    emptyRabbit,
  );
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [breed, setBreed] = useState("All breeds");
  const [status, setStatus] = useState("All statuses");
  const [sex, setSex] = useState("All sexes");
  const [sort, setSort] = useState("tag-asc");
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settings, setSettings] = useState<FarmSettings>(defaultFarmSettings);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FARM_SETTINGS_KEY);
      if (stored) {
        setSettings({ ...defaultFarmSettings, ...JSON.parse(stored) });
      }
    } catch {
      // fallback to default
    }
  }, []);
  const revisionRef = useRef(0);

  const applyDatabase = useCallback((database: FarmDatabase) => {
    if (database.revision < revisionRef.current) return;
    revisionRef.current = database.revision;
    setRabbits(database.rabbits);
    setFinanceTransactions(database.transactions);
    setInventory(database.inventory);
    setBreeding(database.breeding);
    setHealth(database.health);
    setTasks(database.tasks);
  }, []);

  useEffect(() => {
    const expiresAt =
      validSessionExpiry(window.localStorage) ??
      validSessionExpiry(window.sessionStorage);
    setAuthExpiresAt(expiresAt);
    setAuthenticated(expiresAt !== null);
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!authenticated || authExpiresAt === null) return;

    const expireSession = () => {
      window.localStorage.removeItem(AUTH_SESSION_KEY);
      window.sessionStorage.removeItem(AUTH_SESSION_KEY);
      setAuthenticated(false);
      setAuthExpiresAt(null);
      setMobileNav(false);
      setModal(null);
      setTransactionModal(false);
      setStockModal(false);
      setBreedingModal(false);
      setHealthModal(false);
      setTaskModal(false);
    };

    const remaining = authExpiresAt - Date.now();
    if (remaining <= 0) {
      expireSession();
      return;
    }

    const timeout = window.setTimeout(expireSession, remaining);
    return () => window.clearTimeout(timeout);
  }, [authenticated, authExpiresAt]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const legacy = readLegacyData();
        const database = await farmDataRequest(
          legacy.keysToRemove.length
            ? { action: "merge-legacy", database: legacy.database }
            : undefined,
        );
        if (!active) return;
        applyDatabase(database);
        for (const key of legacy.keysToRemove) window.localStorage.removeItem(key);
      } catch (error) {
        if (active) {
          setToast(error instanceof Error ? error.message : "Unable to load shared records");
        }
      } finally {
        if (active) setDataReady(true);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [applyDatabase]);

  useEffect(() => {
    if (!dataReady) return;
    const refresh = () => void farmDataRequest().then(applyDatabase).catch(() => undefined);
    const interval = window.setInterval(refresh, 15_000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [applyDatabase, dataReady]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setView("rabbits");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return rabbits
      .filter(
        (r) =>
          (!query ||
            Object.values(r).join(" ").toLowerCase().includes(query)) &&
          (breed === "All breeds" || r.breed === breed) &&
          (status === "All statuses" || r.status === status) &&
          (sex === "All sexes" || r.sex === sex),
      )
      .sort((a, b) => {
        if (sort === "tag-desc") return b.tag.localeCompare(a.tag);
        if (sort === "name") return a.name.localeCompare(b.name);
        if (sort === "weight") return b.weightKg - a.weightKg;
        if (sort === "youngest")
          return b.dateOfBirth.localeCompare(a.dateOfBirth);
        return a.tag.localeCompare(b.tag);
      });
  }, [rabbits, search, breed, status, sex, sort]);

  const breeds = Array.from(new Set(rabbits.map((r) => r.breed))).sort();
  const healthy = rabbits.filter((r) =>
    ["Healthy", "Pregnant", "Nursing"].includes(r.status),
  ).length;
  const dueThisMonth = breeding.filter((r) => r.status === "Pregnant").length;
  const income = financeTransactions
    .filter((t) => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = financeTransactions
    .filter((t) => t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const go = (next: FarmView) => {
    setView(next);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const addRabbit = () => {
    setDraft(emptyRabbit);
    setModal("add");
  };
  const editRabbit = (rabbit: Rabbit) => {
    setDraft(rabbit);
    setModal("edit");
  };
  const persistRecord = async (
    collection: FarmCollection,
    record: object,
  ) => {
    const database = await farmDataRequest({ collection, action: "upsert", record });
    applyDatabase(database);
  };

  const saveRabbit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await persistRecord("rabbits", draft);
      setToast(
        modal === "edit"
          ? `${draft.name} was updated`
          : `${draft.name} was added to the herd`,
      );
      setModal(null);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Rabbit could not be saved");
    }
  };
  const removeRabbit = async (rabbit: Rabbit) => {
    if (
      !window.confirm(
        `Delete ${rabbit.name} (${rabbit.tag}) from the digital register?`,
      )
    )
      return;
    try {
      const database = await farmDataRequest({
        collection: "rabbits",
        action: "delete",
        id: rabbit.id,
      });
      applyDatabase(database);
      setToast(`${rabbit.name} was removed`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Rabbit could not be removed");
    }
  };

  const deleteRecord = async (
    collection: FarmCollection,
    id: string,
    label: string,
  ) => {
    if (!window.confirm(`Delete ${label} permanently from records?`)) return;
    try {
      const database = await farmDataRequest({
        collection,
        action: "delete",
        id,
      });
      applyDatabase(database);
      setToast(`${label} was deleted`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not delete record");
    }
  };

  const removeTransaction = (t: Transaction) =>
    deleteRecord("transactions", t.id, `Transaction ${t.id} (${t.description || money(t.amount)})`);

  const removeStock = (s: FeedRecord) =>
    deleteRecord("inventory", s.id, `Stock item "${s.item}"`);

  const removeBreeding = (b: BreedingRecord) =>
    deleteRecord("breeding", b.id, `Breeding record ${b.id} (${b.doe})`);

  const removeHealth = (h: HealthRecord) =>
    deleteRecord("health", h.id, `Health record ${h.id} (${h.rabbit})`);

  const removeTask = (t: FarmTask) =>
    deleteRecord("tasks", t.id, `Task "${t.title}"`);
  const saveTransaction = async (
    transaction: Omit<Transaction, "id">,
    transactionId?: string,
  ) => {
    try {
      await persistRecord("transactions", {
        ...transaction,
        ...(transactionId ? { id: transactionId } : {}),
      });
      setTransactionModal(false);
      setEditingTransaction(null);
      setToast(
        transactionId
          ? `${transactionId} was updated`
          : "Transaction added to the financial ledger",
      );
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Transaction could not be saved");
    }
  };
  const saveStock = async (stock: Omit<FeedRecord, "id">, stockId?: string) => {
    try {
      await persistRecord("inventory", {
        ...stock,
        ...(stockId ? { id: stockId } : {}),
      });
      setStockModal(false);
      setEditingStock(null);
      setToast(stockId ? `${stock.item} was updated` : `${stock.item} was added to inventory`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Inventory could not be saved");
    }
  };
  const saveBreeding = async (
    record: Omit<BreedingRecord, "id">,
    recordId?: string,
  ) => {
    try {
      await persistRecord("breeding", {
        ...record,
        ...(recordId ? { id: recordId } : {}),
      });
      setBreedingModal(false);
      setEditingBreeding(null);
      setToast(recordId ? `${recordId} was updated` : "Mating added to the breeding register");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Breeding record could not be saved");
    }
  };
  const saveHealth = async (record: Omit<HealthRecord, "id">, recordId?: string) => {
    try {
      await persistRecord("health", {
        ...record,
        ...(recordId ? { id: recordId } : {}),
      });
      setHealthModal(false);
      setEditingHealth(null);
      setToast(recordId ? `${recordId} was updated` : "Entry added to the health register");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Health record could not be saved");
    }
  };
  const saveTask = async (task: Omit<FarmTask, "id">, taskId?: string) => {
    try {
      await persistRecord("tasks", {
        ...task,
        ...(taskId ? { id: taskId } : {}),
      });
      setTaskModal(false);
      setEditingTask(null);
      setToast(taskId ? `${taskId} was updated` : "Task added to today’s work plan");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Task could not be saved");
    }
  };

  const toggleTask = async (task: FarmTask) => {
    try {
      await persistRecord("tasks", { ...task, done: !task.done });
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Task could not be updated");
    }
  };

  const login = (remember: boolean) => {
    const persistentStorage = remember
      ? window.localStorage
      : window.sessionStorage;
    const otherStorage = remember
      ? window.sessionStorage
      : window.localStorage;
    const expiresAt = Date.now() + AUTH_SESSION_DURATION;
    persistentStorage.setItem(
      AUTH_SESSION_KEY,
      JSON.stringify({ expiresAt }),
    );
    otherStorage.removeItem(AUTH_SESSION_KEY);
    setAuthExpiresAt(expiresAt);
    setToast(`Login successful. Welcome back, ${settings.manager}.`);
    setAuthenticated(true);
  };

  const logout = () => {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    window.sessionStorage.removeItem(AUTH_SESSION_KEY);
    setAuthExpiresAt(null);
    setMobileNav(false);
    setView("dashboard");
    setModal(null);
    setTransactionModal(false);
    setStockModal(false);
    setBreedingModal(false);
    setHealthModal(false);
    setTaskModal(false);
    setAuthenticated(false);
  };

  if (!authReady) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-[#eff4f1]">
        <div className="grid h-12 w-12 animate-pulse place-items-center rounded-2xl bg-[#123f34] text-[#efc557] shadow-xl shadow-emerald-950/10">
          <Icon name="rabbit" className="h-6 w-6" />
        </div>
      </div>
    );
  }

  if (!authenticated) return <LoginScreen onLogin={login} />;

  const title = nav.find((item) => item.id === view)?.label ?? "Settings";
  return (
    <div className="min-h-screen bg-[#f6f7f3] text-stone-900">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[256px] border-r border-[#2d5a4a] bg-[#123f34] text-white transition-transform lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-[84px] items-center gap-3 border-b border-white/10 px-6">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9b949] text-[#123f34]">
              <Icon name="rabbit" className="h-6 w-6" />
            </div>
            <div>
              <p className="font-serif text-[19px] font-bold tracking-tight">{settings.farmName}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-emerald-100/60">
                Farm OS
              </p>
            </div>
            <button
              aria-label="Close navigation"
              className="ml-auto lg:hidden"
              onClick={() => setMobileNav(false)}
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-6">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-emerald-100/45">
              Workspace
            </p>
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${view === item.id ? "bg-white text-[#123f34] shadow-sm" : "text-emerald-50/70 hover:bg-white/8 hover:text-white"}`}
              >
                <Icon name={item.icon} className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
                {item.id === "dashboard" &&
                  tasks.filter((t) => !t.done).length > 0 && (
                    <span className="ml-auto rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-200">
                      {tasks.filter((t) => !t.done).length}
                    </span>
                  )}
                {item.id === "health" &&
                  health.filter((record) => record.status === "Ongoing")
                    .length > 0 && (
                    <span className="ml-auto rounded-full bg-[#e9b949] px-1.5 py-0.5 text-[9px] font-bold text-[#123f34]">
                      {
                        health.filter((record) => record.status === "Ongoing")
                          .length
                      }
                    </span>
                  )}
              </button>
            ))}
          </nav>
          <div className="p-3">
            <button
              onClick={() => go("settings")}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium ${view === "settings" ? "bg-white text-[#123f34]" : "text-emerald-50/70 hover:bg-white/8"}`}
            >
              <Icon name="settings" className="h-[18px] w-[18px]" />
              Farm settings
            </button>
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#e9b949] text-xs font-bold text-[#123f34]">
                DA
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{settings.manager}</p>
                <p className="truncate text-[10px] text-emerald-50/45">
                  Farm administrator
                </p>
              </div>
              <button
                type="button"
                aria-label="Sign out"
                title="Sign out"
                onClick={logout}
                className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
              >
                <Icon name="logout" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
      {mobileNav && (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-stone-950/30 lg:hidden"
          onClick={() => setMobileNav(false)}
        />
      )}

      <main className="lg:pl-[256px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center border-b border-stone-200 bg-[#f6f7f3]/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <button
            aria-label="Open navigation"
            onClick={() => setMobileNav(true)}
            className="mr-3 rounded-lg border border-stone-200 bg-white p-2 lg:hidden"
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>
          <div>
            <p className="text-[11px] font-medium text-stone-400">
              Farm operations
            </p>
            <h1 className="text-base font-bold tracking-tight">{title}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => go("rabbits")}
              className="hidden items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-medium text-stone-500 sm:flex"
            >
              <Icon name="search" className="h-4 w-4" />
              Search records{" "}
              <kbd className="ml-3 rounded bg-stone-100 px-1.5 py-0.5 text-[9px]">
                ⌘ K
              </kbd>
            </button>
            <button
              aria-label="Notifications"
              onClick={() => setToast("You have 3 upcoming farm reminders")}
              className="relative rounded-xl border border-stone-200 bg-white p-2.5 text-stone-600"
            >
              <Icon name="bell" className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            <button
              onClick={
                view === "dashboard"
                  ? () => { setEditingTask(null); setTaskModal(true); }
                  : view === "finance"
                  ? () => { setEditingTransaction(null); setTransactionModal(true); }
                  : view === "feed"
                  ? () => { setEditingStock(null); setStockModal(true); }
                  : view === "breeding"
                  ? () => { setEditingBreeding(null); setBreedingModal(true); }
                  : view === "health"
                  ? () => { setEditingHealth(null); setHealthModal(true); }
                  : addRabbit
              }
              className="flex items-center gap-2 rounded-xl bg-[#123f34] px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0d332a]"
            >
              <Icon name="plus" className="h-4 w-4" />
              <span className="hidden sm:inline">
                {view === "dashboard"
                  ? "Add Task"
                  : view === "finance"
                  ? "Add Transaction"
                  : view === "feed"
                  ? "Add Stock"
                  : view === "breeding"
                  ? "Record Mating"
                  : view === "health"
                  ? "New Health Record"
                  : "Add Rabbit"}
              </span>
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-4 sm:p-7 lg:p-9">
          {view === "dashboard" && (
            <Dashboard
              rabbits={rabbits}
              tasks={tasks}
              toggleTask={toggleTask}
              inventory={inventory}
              breeding={breeding}
              healthy={healthy}
              dueThisMonth={dueThisMonth}
              profit={income - expense}
              go={go}
              addRabbit={addRabbit}
              addTask={() => {
                setEditingTask(null);
                setTaskModal(true);
              }}
              editTask={(task) => {
                setEditingTask(task);
                setTaskModal(true);
              }}
              removeTask={removeTask}
              adminName={settings.manager}
              farmName={settings.farmName}
            />
          )}
          {view === "rabbits" && (
            <RabbitRegistry
              rabbits={filtered}
              allCount={rabbits.length}
              breeds={breeds}
              search={search}
              setSearch={setSearch}
              breed={breed}
              setBreed={setBreed}
              status={status}
              setStatus={setStatus}
              sex={sex}
              setSex={setSex}
              sort={sort}
              setSort={setSort}
              edit={editRabbit}
              remove={removeRabbit}
              add={addRabbit}
              clear={() => {
                setSearch("");
                setBreed("All breeds");
                setStatus("All statuses");
                setSex("All sexes");
              }}
            />
          )}
          {view === "breeding" && (
            <Breeding
              records={breeding}
              add={() => {
                setEditingBreeding(null);
                setBreedingModal(true);
              }}
              edit={(record) => {
                setEditingBreeding(record);
                setBreedingModal(true);
              }}
              remove={removeBreeding}
            />
          )}
          {view === "health" && (
            <Health
              records={health}
              rabbitCount={rabbits.length}
              add={() => {
                setEditingHealth(null);
                setHealthModal(true);
              }}
              edit={(record) => {
                setEditingHealth(record);
                setHealthModal(true);
              }}
              remove={removeHealth}
            />
          )}
          {view === "feed" && (
            <Feed
              inventory={inventory}
              add={() => {
                setEditingStock(null);
                setStockModal(true);
              }}
              edit={(record) => {
                setEditingStock(record);
                setStockModal(true);
              }}
              remove={removeStock}
              dailyConsumptionKg={settings.dailyConsumptionKg}
            />
          )}
          {view === "finance" && (
            <Finance
              income={income}
              expense={expense}
              transactions={financeTransactions}
              add={() => {
                setEditingTransaction(null);
                setTransactionModal(true);
              }}
              edit={(transaction) => {
                setEditingTransaction(transaction);
                setTransactionModal(true);
              }}
              remove={removeTransaction}
            />
          )}
          {view === "reports" && (
            <Reports
              rabbits={rabbits}
              breeding={breeding}
              health={health}
              inventory={inventory}
              transactions={financeTransactions}
            />
          )}
          {view === "settings" && (
            <Settings
              settings={settings}
              onSave={(updated) => {
                setSettings(updated);
                try {
                  window.localStorage.setItem(FARM_SETTINGS_KEY, JSON.stringify(updated));
                } catch {
                  // ignore
                }
                setToast("Farm settings saved successfully");
              }}
            />
          )}
        </div>
      </main>

      {modal && (
        <RabbitModal
          draft={draft}
          setDraft={setDraft}
          mode={modal}
          close={() => setModal(null)}
          save={saveRabbit}
        />
      )}
      {transactionModal && (
        <TransactionModal
          transaction={editingTransaction}
          close={() => {
            setTransactionModal(false);
            setEditingTransaction(null);
          }}
          save={saveTransaction}
        />
      )}
      {stockModal && (
        <StockModal
          record={editingStock}
          close={() => {
            setStockModal(false);
            setEditingStock(null);
          }}
          save={saveStock}
        />
      )}
      {breedingModal && (
        <BreedingModal
          record={editingBreeding}
          rabbits={rabbits}
          close={() => {
            setBreedingModal(false);
            setEditingBreeding(null);
          }}
          save={saveBreeding}
        />
      )}
      {healthModal && (
        <HealthModal
          record={editingHealth}
          rabbits={rabbits}
          close={() => {
            setHealthModal(false);
            setEditingHealth(null);
          }}
          save={saveHealth}
        />
      )}
      {taskModal && (
        <TaskModal
          task={editingTask}
          close={() => {
            setTaskModal(false);
            setEditingTask(null);
          }}
          save={saveTask}
        />
      )}
      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[70] flex items-center gap-3 rounded-xl bg-[#173f35] px-4 py-3 text-xs font-semibold text-white shadow-2xl"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-400 text-[#123f34]">
            <Icon name="check" className="h-3.5 w-3.5" />
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}
