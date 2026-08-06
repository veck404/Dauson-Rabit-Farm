"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "./Icon";
import { Dashboard } from "./farm/Dashboard";
import { Finance, TransactionModal } from "./farm/Finance";
import { Breeding, Feed, Health, StockModal } from "./farm/Operations";
import { RabbitModal, RabbitRegistry } from "./farm/RabbitRegistry";
import { Reports, Settings } from "./farm/ReportsSettings";
import {
  breedingRecords,
  feedRecords,
  initialRabbits,
  initialTasks,
  transactions,
} from "../lib/farm-data";
import type { FarmView, FeedRecord, Rabbit, Transaction } from "../lib/types";

const nav: {
  id: FarmView;
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
}[] = [
  { id: "dashboard", label: "Overview", icon: "grid" },
  { id: "rabbits", label: "Rabbit registry", icon: "rabbit" },
  { id: "breeding", label: "Breeding & litters", icon: "dna" },
  { id: "health", label: "Health & care", icon: "heart" },
  { id: "feed", label: "Feed & inventory", icon: "wheat" },
  { id: "finance", label: "Finance", icon: "wallet" },
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

export default function FarmApp() {
  const [view, setView] = useState<FarmView>("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [rabbits, setRabbits] = useState<Rabbit[]>(initialRabbits);
  const [financeTransactions, setFinanceTransactions] =
    useState<Transaction[]>(transactions);
  const [inventory, setInventory] = useState<FeedRecord[]>(feedRecords);
  const [tasks, setTasks] = useState(initialTasks);
  const [hydrated, setHydrated] = useState(false);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [transactionModal, setTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [stockModal, setStockModal] = useState(false);
  const [editingStock, setEditingStock] = useState<FeedRecord | null>(null);
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

  useEffect(() => {
    const stored = window.localStorage.getItem("dauson-rabbits-v2");
    if (stored) {
      try {
        const savedRabbits = JSON.parse(stored) as Array<
          Rabbit & { sire?: string; dam?: string }
        >;
        setRabbits(
          savedRabbits.map(({ sire: _sire, dam: _dam, ...rabbit }) => rabbit),
        );
      } catch {
        /* keep seeded records */
      }
    }
    const storedTransactions = window.localStorage.getItem(
      "dauson-transactions-v1",
    );
    if (storedTransactions) {
      try {
        setFinanceTransactions(JSON.parse(storedTransactions) as Transaction[]);
      } catch {
        /* keep seeded transactions */
      }
    }
    const storedInventory = window.localStorage.getItem("dauson-inventory-v1");
    if (storedInventory) {
      try {
        setInventory(JSON.parse(storedInventory) as FeedRecord[]);
      } catch {
        /* keep seeded inventory */
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem("dauson-rabbits-v2", JSON.stringify(rabbits));
  }, [rabbits, hydrated]);
  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem(
        "dauson-transactions-v1",
        JSON.stringify(financeTransactions),
      );
  }, [financeTransactions, hydrated]);
  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem(
        "dauson-inventory-v1",
        JSON.stringify(inventory),
      );
  }, [inventory, hydrated]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

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
  const dueThisMonth = breedingRecords.filter(
    (r) => r.status === "Pregnant",
  ).length;
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
  const saveRabbit = (event: React.FormEvent) => {
    event.preventDefault();
    if (modal === "edit" && draft.id) {
      setRabbits((current) =>
        current.map((r) =>
          r.id === draft.id ? ({ ...draft, id: draft.id } as Rabbit) : r,
        ),
      );
      setToast(`${draft.name} was updated`);
    } else {
      const next =
        Math.max(0, ...rabbits.map((r) => Number(r.id.replace(/\D/g, "")))) + 1;
      setRabbits((current) => [
        { ...draft, id: `RB-${String(next).padStart(4, "0")}` } as Rabbit,
        ...current,
      ]);
      setToast(`${draft.name} was added to the herd`);
    }
    setModal(null);
  };
  const removeRabbit = (rabbit: Rabbit) => {
    if (
      !window.confirm(
        `Delete ${rabbit.name} (${rabbit.tag}) from the digital register?`,
      )
    )
      return;
    setRabbits((current) => current.filter((r) => r.id !== rabbit.id));
    setToast(`${rabbit.name} was removed`);
  };
  const saveTransaction = (
    transaction: Omit<Transaction, "id">,
    transactionId?: string,
  ) => {
    if (transactionId) {
      setFinanceTransactions((current) =>
        current.map((item) =>
          item.id === transactionId
            ? { ...transaction, id: transactionId }
            : item,
        ),
      );
      setTransactionModal(false);
      setEditingTransaction(null);
      setToast(`${transactionId} was updated`);
      return;
    }
    const next =
      Math.max(
        0,
        ...financeTransactions.map((item) =>
          Number(item.id.replace(/\D/g, "")),
        ),
      ) + 1;
    setFinanceTransactions((current) => [
      { ...transaction, id: `TX-${String(next).padStart(3, "0")}` },
      ...current,
    ]);
    setTransactionModal(false);
    setEditingTransaction(null);
    setToast("Transaction added to the financial ledger");
  };
  const saveStock = (stock: Omit<FeedRecord, "id">, stockId?: string) => {
    if (stockId) {
      setInventory((current) =>
        current.map((item) =>
          item.id === stockId ? { ...stock, id: stockId } : item,
        ),
      );
      setStockModal(false);
      setEditingStock(null);
      setToast(`${stock.item} was updated`);
      return;
    }
    const next =
      Math.max(
        0,
        ...inventory.map((item) => Number(item.id.replace(/\D/g, ""))),
      ) + 1;
    setInventory((current) => [
      { ...stock, id: `ST-${String(next).padStart(3, "0")}` },
      ...current,
    ]);
    setStockModal(false);
    setEditingStock(null);
    setToast(`${stock.item} was added to inventory`);
  };

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
              <p className="font-serif text-[19px] font-bold tracking-tight">
                Dauson Farm
              </p>
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
                {item.id === "health" && (
                  <span className="ml-auto rounded-full bg-[#e9b949] px-1.5 py-0.5 text-[9px] font-bold text-[#123f34]">
                    2
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
                <p className="truncate text-xs font-semibold">David Afolayan</p>
                <p className="truncate text-[10px] text-emerald-50/45">
                  Farm administrator
                </p>
              </div>
              <Icon name="more" className="ml-auto h-4 w-4 text-white/50" />
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
              onClick={addRabbit}
              className="flex items-center gap-2 rounded-xl bg-[#123f34] px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0d332a]"
            >
              <Icon name="plus" className="h-4 w-4" />
              <span className="hidden sm:inline">Add rabbit</span>
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-4 sm:p-7 lg:p-9">
          {view === "dashboard" && (
            <Dashboard
              rabbits={rabbits}
              tasks={tasks}
              setTasks={setTasks}
              inventory={inventory}
              healthy={healthy}
              dueThisMonth={dueThisMonth}
              profit={income - expense}
              go={go}
              addRabbit={addRabbit}
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
          {view === "breeding" && <Breeding />}
          {view === "health" && <Health />}
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
            />
          )}
          {view === "reports" && (
            <Reports
              rabbits={rabbits}
              inventory={inventory}
              transactions={financeTransactions}
            />
          )}
          {view === "settings" && (
            <Settings
              saved={settingsSaved}
              onSave={() => {
                setSettingsSaved(true);
                setToast("Farm settings saved");
                window.setTimeout(() => setSettingsSaved(false), 1800);
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
