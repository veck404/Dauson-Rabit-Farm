"use client";

import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Icon } from "./Icon";
import {
  breedingRecords,
  feedRecords,
  healthRecords,
  initialRabbits,
  initialTasks,
  transactions,
} from "../lib/farm-data";
import type { Rabbit, Transaction } from "../lib/types";

type View =
  | "dashboard"
  | "rabbits"
  | "breeding"
  | "health"
  | "feed"
  | "finance"
  | "reports"
  | "settings";
type ExportRow = Record<string, string | number>;

const nav: {
  id: View;
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

const money = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
const shortDate = (value: string) =>
  new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
const daysUntil = (value: string) =>
  Math.ceil(
    (new Date(`${value}T12:00:00`).getTime() -
      new Date("2026-08-06T12:00:00").getTime()) /
      86400000,
  );
const age = (birth: string) => {
  const months = Math.max(
    0,
    Math.floor(
      (new Date("2026-08-06").getTime() - new Date(birth).getTime()) /
        2629800000,
    ),
  );
  return months >= 12
    ? `${Math.floor(months / 12)}y ${months % 12}m`
    : `${months}m`;
};

const rabbitRows = (items: Rabbit[]): ExportRow[] =>
  items.map((r) => ({
    ID: r.id,
    Tag: r.tag,
    Name: r.name,
    Breed: r.breed,
    Sex: r.sex,
    Status: r.status,
    Purpose: r.purpose,
    "Date of birth": r.dateOfBirth,
    "Weight (kg)": r.weightKg,
    Cage: r.cage,
    Color: r.color,
    Acquired: r.acquiredDate,
    Notes: r.notes,
  }));

function exportExcel(rows: ExportRow[], name: string) {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet["!cols"] = Object.keys(rows[0] ?? { Record: "" }).map(() => ({
    wch: 20,
  }));
  XLSX.utils.book_append_sheet(workbook, sheet, name.slice(0, 31));
  XLSX.writeFile(
    workbook,
    `dauson-${name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}

function exportPdf(rows: ExportRow[], title: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const columns = Object.keys(rows[0] ?? { Record: "No records" }).slice(0, 9);
  doc.setFillColor(15, 70, 59);
  doc.rect(0, 0, 842, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(19);
  doc.text(`Dauson Farm · ${title}`, 34, 32);
  doc.setFontSize(9);
  doc.text(
    `Generated 06 Aug 2026  •  ${rows.length} records  •  Farm management archive`,
    34,
    50,
  );
  autoTable(doc, {
    head: [columns],
    body: rows.map((row) => columns.map((key) => String(row[key] ?? "—"))),
    startY: 88,
    styles: { fontSize: 8, cellPadding: 5, textColor: [46, 54, 49] },
    headStyles: {
      fillColor: [226, 238, 231],
      textColor: [15, 70, 59],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [248, 250, 248] },
    margin: { left: 34, right: 34 },
  });
  doc.save(
    `dauson-${title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}

function Status({ children }: { children: string }) {
  const tone: Record<string, string> = {
    Healthy: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    Pregnant: "bg-violet-50 text-violet-700 ring-violet-600/15",
    Nursing: "bg-sky-50 text-sky-700 ring-sky-600/15",
    Treatment: "bg-amber-50 text-amber-800 ring-amber-600/15",
    Quarantine: "bg-rose-50 text-rose-700 ring-rose-600/15",
    Ongoing: "bg-amber-50 text-amber-800 ring-amber-600/15",
    Completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    Due: "bg-rose-50 text-rose-700 ring-rose-600/15",
    Paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    Pending: "bg-amber-50 text-amber-800 ring-amber-600/15",
    Good: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    Low: "bg-amber-50 text-amber-800 ring-amber-600/15",
    Critical: "bg-rose-50 text-rose-700 ring-rose-600/15",
    Kindled: "bg-sky-50 text-sky-700 ring-sky-600/15",
    "Palpation due": "bg-amber-50 text-amber-800 ring-amber-600/15",
    "Not pregnant": "bg-stone-100 text-stone-600 ring-stone-500/15",
  };
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${tone[children] ?? "bg-stone-100 text-stone-600 ring-stone-500/15"}`}
    >
      {children}
    </span>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-stone-200/80 bg-white shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

export default function FarmApp() {
  const [view, setView] = useState<View>("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [rabbits, setRabbits] = useState<Rabbit[]>(initialRabbits);
  const [financeTransactions, setFinanceTransactions] =
    useState<Transaction[]>(transactions);
  const [tasks, setTasks] = useState(initialTasks);
  const [hydrated, setHydrated] = useState(false);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [transactionModal, setTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
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

  const go = (next: View) => {
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
          {view === "feed" && <Feed />}
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
            <Reports rabbits={rabbits} transactions={financeTransactions} />
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

function Dashboard({
  rabbits,
  tasks,
  setTasks,
  healthy,
  dueThisMonth,
  profit,
  go,
  addRabbit,
}: {
  rabbits: Rabbit[];
  tasks: typeof initialTasks;
  setTasks: React.Dispatch<React.SetStateAction<typeof initialTasks>>;
  healthy: number;
  dueThisMonth: number;
  profit: number;
  go: (v: View) => void;
  addRabbit: () => void;
}) {
  const kpis = [
    {
      label: "Registered rabbits",
      value: rabbits.length,
      note: "+3 this month",
      icon: "rabbit" as const,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Healthy herd",
      value: `${Math.round((healthy / Math.max(rabbits.length, 1)) * 100)}%`,
      note: `${rabbits.length - healthy} need attention`,
      icon: "heart" as const,
      tone: "bg-sky-50 text-sky-700",
    },
    {
      label: "Expected litters",
      value: dueThisMonth,
      note: "Due this month",
      icon: "calendar" as const,
      tone: "bg-violet-50 text-violet-700",
    },
    {
      label: "Net farm position",
      value: money(profit),
      note: "Current period",
      icon: "trend" as const,
      tone: "bg-amber-50 text-amber-700",
    },
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#6c8b7e]">
            Thursday, 06 August 2026
          </p>
          <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[#183e34] sm:text-4xl">
            Good morning, David.
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Here’s what is happening across Dauson Farm today.
          </p>
        </div>
        <button
          onClick={addRabbit}
          className="flex w-fit items-center gap-2 rounded-xl bg-[#e9b949] px-4 py-2.5 text-xs font-bold text-[#173f35] hover:bg-[#dfaa32]"
        >
          <Icon name="plus" className="h-4 w-4" />
          Register new rabbit
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-5">
            <div className="flex items-start justify-between">
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl ${kpi.tone}`}
              >
                <Icon name={kpi.icon} className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-semibold text-emerald-700">
                ● Live
              </span>
            </div>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[.08em] text-stone-400">
              {kpi.label}
            </p>
            <div className="mt-1 flex items-end justify-between gap-2">
              <p className="text-2xl font-bold tracking-tight text-stone-800">
                {kpi.value}
              </p>
              <p className="pb-1 text-[10px] text-stone-400">{kpi.note}</p>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.55fr_.85fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
            <div>
              <h3 className="text-sm font-bold">Herd distribution</h3>
              <p className="mt-0.5 text-[11px] text-stone-400">
                Current animals by production group
              </p>
            </div>
            <button
              onClick={() => go("rabbits")}
              className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700"
            >
              View registry <Icon name="arrow" className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid gap-6 p-5 sm:grid-cols-[1fr_1.1fr]">
            <div className="relative mx-auto grid aspect-square w-full max-w-[210px] place-items-center rounded-full bg-[conic-gradient(#1b6654_0_42%,#70a691_42%_68%,#e9b949_68%_86%,#d9dfd7_86%_100%)]">
              <div className="grid h-[64%] w-[64%] place-items-center rounded-full bg-white text-center">
                <div>
                  <p className="text-3xl font-bold text-[#173f35]">
                    {rabbits.length}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">
                    Total herd
                  </p>
                </div>
              </div>
            </div>
            <div className="my-auto space-y-4">
              {[
                [
                  "Breeding does",
                  rabbits.filter(
                    (r) => r.sex === "Doe" && r.purpose === "Breeder",
                  ).length,
                  "bg-[#1b6654]",
                ],
                [
                  "Breeding bucks",
                  rabbits.filter(
                    (r) => r.sex === "Buck" && r.purpose === "Breeder",
                  ).length,
                  "bg-[#70a691]",
                ],
                [
                  "Grow-out",
                  rabbits.filter(
                    (r) => r.purpose === "Grow-out" || r.purpose === "Meat",
                  ).length,
                  "bg-[#e9b949]",
                ],
                [
                  "Care / quarantine",
                  rabbits.filter((r) =>
                    ["Treatment", "Quarantine"].includes(r.status),
                  ).length,
                  "bg-[#d9dfd7]",
                ],
              ].map(([label, count, color]) => (
                <div key={String(label)}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="flex items-center gap-2 text-stone-500">
                      <i className={`h-2 w-2 rounded-full ${color}`} />
                      {label}
                    </span>
                    <strong>{count}</strong>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{
                        width: `${Math.max(8, (Number(count) / Math.max(rabbits.length, 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
            <div>
              <h3 className="text-sm font-bold">Today’s tasks</h3>
              <p className="mt-0.5 text-[11px] text-stone-400">
                {tasks.filter((t) => t.done).length} of {tasks.length} completed
              </p>
            </div>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-700">
              <Icon name="calendar" className="h-4 w-4" />
            </span>
          </div>
          <div className="divide-y divide-stone-100 px-5">
            {tasks.map((task) => (
              <label
                key={task.id}
                className="flex cursor-pointer items-center gap-3 py-3.5"
              >
                <button
                  onClick={() =>
                    setTasks((current) =>
                      current.map((t) =>
                        t.id === task.id ? { ...t, done: !t.done } : t,
                      ),
                    )
                  }
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${task.done ? "border-emerald-700 bg-emerald-700 text-white" : "border-stone-300 bg-white"}`}
                >
                  {task.done && <Icon name="check" className="h-3 w-3" />}
                </button>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-xs font-semibold ${task.done ? "text-stone-400 line-through" : "text-stone-700"}`}
                  >
                    {task.title}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-stone-400">
                    {task.time} · {task.group}
                  </span>
                </span>
                {task.priority === "High" && !task.done && (
                  <i className="h-2 w-2 rounded-full bg-rose-400" />
                )}
              </label>
            ))}
          </div>
          <div className="p-4 pt-2">
            <button className="w-full rounded-xl border border-dashed border-stone-300 py-2.5 text-[11px] font-semibold text-stone-500 hover:border-emerald-600 hover:text-emerald-700">
              + Add farm task
            </button>
          </div>
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.55fr_.85fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
            <div>
              <h3 className="text-sm font-bold">Upcoming breeding events</h3>
              <p className="mt-0.5 text-[11px] text-stone-400">
                Kindling and checks for the next 30 days
              </p>
            </div>
            <button
              onClick={() => go("breeding")}
              className="text-[11px] font-semibold text-emerald-700"
            >
              Open breeding log
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50/70 text-[9px] uppercase tracking-[.1em] text-stone-400">
                  <th className="px-5 py-2.5">Doe</th>
                  <th className="px-4 py-2.5">Event</th>
                  <th className="px-4 py-2.5">Due date</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {breedingRecords.slice(0, 4).map((r) => (
                  <tr key={r.id} className="text-xs">
                    <td className="px-5 py-3 font-semibold">
                      {r.doe.split(" · ")[0]}
                      <span className="block text-[9px] font-normal text-stone-400">
                        {r.doe.split(" · ")[1]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      {r.status === "Kindled"
                        ? "Litter check"
                        : "Expected kindling"}
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      {shortDate(r.dueDate)}
                      <span className="block text-[9px] text-stone-400">
                        {daysUntil(r.dueDate) >= 0
                          ? `in ${daysUntil(r.dueDate)} days`
                          : `${Math.abs(daysUntil(r.dueDate))} days ago`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Status>{r.status}</Status>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="overflow-hidden">
          <div className="border-b border-stone-100 px-5 py-4">
            <h3 className="text-sm font-bold">Stock watch</h3>
            <p className="mt-0.5 text-[11px] text-stone-400">
              Items that need attention
            </p>
          </div>
          <div className="space-y-3 p-5">
            {feedRecords
              .filter((r) => r.stockStatus !== "Good")
              .map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-xl bg-stone-50 p-3"
                >
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-lg ${r.stockStatus === "Critical" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-700"}`}
                  >
                    <Icon name="box" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{r.item}</p>
                    <p className="text-[10px] text-stone-400">
                      {r.quantity} {r.unit} remaining
                    </p>
                  </div>
                  <Status>{r.stockStatus}</Status>
                </div>
              ))}
          </div>
          <button
            onClick={() => go("feed")}
            className="mx-5 mb-5 flex items-center gap-1 text-[11px] font-semibold text-emerald-700"
          >
            Manage inventory <Icon name="arrow" className="h-3 w-3" />
          </button>
        </Card>
      </div>
    </div>
  );
}

function RabbitRegistry({
  rabbits,
  allCount,
  breeds,
  search,
  setSearch,
  breed,
  setBreed,
  status,
  setStatus,
  sex,
  setSex,
  sort,
  setSort,
  edit,
  remove,
  add,
  clear,
}: {
  rabbits: Rabbit[];
  allCount: number;
  breeds: string[];
  search: string;
  setSearch: (v: string) => void;
  breed: string;
  setBreed: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  sex: string;
  setSex: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  edit: (r: Rabbit) => void;
  remove: (r: Rabbit) => void;
  add: () => void;
  clear: () => void;
}) {
  const activeFilters = [
    breed !== "All breeds",
    status !== "All statuses",
    sex !== "All sexes",
    !!search,
  ].filter(Boolean).length;
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Digital herd register</p>
          <h2 className="page-title">Every rabbit. One trusted record.</h2>
          <p className="page-subtitle">
            Search identity, location, production status and care history.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportPdf(rabbitRows(rabbits), "Rabbit registry")}
            className="btn-secondary"
          >
            <Icon name="download" className="h-4 w-4" />
            PDF
          </button>
          <button
            onClick={() => exportExcel(rabbitRows(rabbits), "Rabbit registry")}
            className="btn-secondary"
          >
            <Icon name="download" className="h-4 w-4" />
            Excel
          </button>
          <button onClick={add} className="btn-primary">
            <Icon name="plus" className="h-4 w-4" />
            New record
          </button>
        </div>
      </div>
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_repeat(4,1fr)]">
          <label className="relative">
            <Icon
              name="search"
              className="absolute left-3.5 top-3 h-4 w-4 text-stone-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, tag, breed or cage…"
              className="control pl-10"
            />
          </label>
          <select
            className="control"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
          >
            <option>All breeds</option>
            {breeds.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <select
            className="control"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>All statuses</option>
            {[
              "Healthy",
              "Pregnant",
              "Nursing",
              "Treatment",
              "Quarantine",
              "Sold",
              "Deceased",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <select
            className="control"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
          >
            <option>All sexes</option>
            <option>Doe</option>
            <option>Buck</option>
          </select>
          <select
            className="control"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="tag-asc">Tag: A–Z</option>
            <option value="tag-desc">Tag: Z–A</option>
            <option value="name">Name</option>
            <option value="weight">Weight: high–low</option>
            <option value="youngest">Youngest first</option>
          </select>
        </div>
        {activeFilters > 0 && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-stone-500">
            <Icon name="filter" className="h-3.5 w-3.5" />
            {activeFilters} active filter{activeFilters > 1 ? "s" : ""}
            <button onClick={clear} className="font-semibold text-emerald-700">
              Clear all
            </button>
          </div>
        )}
      </Card>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <p className="text-xs text-stone-500">
            <strong className="text-stone-800">{rabbits.length}</strong> of{" "}
            {allCount} rabbit records
          </p>
          <p className="hidden text-[10px] text-stone-400 sm:block">
            Saved automatically on this device
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="bg-stone-50/70 text-[9px] uppercase tracking-[.12em] text-stone-400">
                <th className="px-5 py-3">Rabbit</th>
                <th className="px-4 py-3">Breed / sex</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Weight</th>
                <th className="px-4 py-3">Cage</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rabbits.map((r, index) => (
                <tr key={r.id} className="group text-xs hover:bg-emerald-50/25">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid h-9 w-9 place-items-center rounded-full font-serif text-xs font-bold ${["bg-amber-100 text-amber-800", "bg-emerald-100 text-emerald-800", "bg-stone-200 text-stone-700", "bg-sky-100 text-sky-800"][index % 4]}`}
                      >
                        {r.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-bold text-stone-800">{r.name}</p>
                        <p className="mt-0.5 text-[10px] font-medium text-stone-400">
                          {r.tag} · {r.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-stone-600">
                    {r.breed}
                    <span className="block text-[10px] text-stone-400">
                      {r.sex} · {r.color}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-medium">
                    {age(r.dateOfBirth)}
                  </td>
                  <td className="px-4 py-3.5 font-medium">
                    {r.weightKg.toFixed(1)} kg
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-md bg-stone-100 px-2 py-1 font-mono text-[10px] font-bold">
                      {r.cage}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-stone-500">{r.purpose}</td>
                  <td className="px-4 py-3.5">
                    <Status>{r.status}</Status>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-1">
                      <button
                        aria-label={`Edit ${r.name}`}
                        onClick={() => edit(r)}
                        className="action bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                      >
                        <Icon name="edit" className="h-3.5 w-3.5" />
                      </button>
                      <button
                        aria-label={`Delete ${r.name}`}
                        onClick={() => remove(r)}
                        className="action bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700"
                      >
                        <Icon name="trash" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rabbits.length === 0 && (
            <div className="p-14 text-center">
              <Icon name="rabbit" className="mx-auto h-9 w-9 text-stone-300" />
              <p className="mt-3 text-sm font-semibold">
                No rabbit records match
              </p>
              <button
                onClick={clear}
                className="mt-2 text-xs font-semibold text-emerald-700"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function Breeding() {
  const rows: ExportRow[] = breedingRecords.map((r) => ({
    ID: r.id,
    Doe: r.doe,
    Buck: r.buck,
    "Bred date": r.bredDate,
    "Due date": r.dueDate,
    Status: r.status,
    "Litter size": r.litterSize ?? "—",
    "Born alive": r.bornAlive ?? "—",
  }));
  return (
    <Module
      title="Breeding & litter management"
      eyebrow="Reproduction records"
      description="Plan matings, monitor pregnancy, record kindling and trace every litter to its parents."
      actions={
        <>
          <button
            onClick={() => exportExcel(rows, "Breeding records")}
            className="btn-secondary"
          >
            <Icon name="download" className="h-4 w-4" />
            Export
          </button>
          <button className="btn-primary">
            <Icon name="plus" className="h-4 w-4" />
            Record mating
          </button>
        </>
      }
      stats={[
        ["Active pregnancies", "2", "Due in August"],
        ["Palpation due", "1", "Next: Ivy"],
        ["Kits born YTD", "184", "91% born alive"],
        ["Avg. litter size", "7.4", "+0.3 vs last year"],
      ]}
    >
      <RecordTable
        headers={[
          "Breeding ID",
          "Doe",
          "Buck",
          "Mated",
          "Due / kindled",
          "Outcome",
          "Status",
        ]}
        rows={breedingRecords.map((r) => [
          r.id,
          r.doe,
          r.buck,
          shortDate(r.bredDate),
          shortDate(r.dueDate),
          r.litterSize ? `${r.bornAlive}/${r.litterSize} alive` : "Pending",
          <Status key={r.id}>{r.status}</Status>,
        ])}
      />
    </Module>
  );
}

function Health() {
  const rows: ExportRow[] = healthRecords.map((r) => ({
    ID: r.id,
    Rabbit: r.rabbit,
    Tag: r.tag,
    Date: r.date,
    Type: r.type,
    Details: r.details,
    Medication: r.medication,
    Status: r.status,
    "Next due": r.nextDue,
  }));
  return (
    <Module
      title="Health & care records"
      eyebrow="Welfare control"
      description="A complete clinical trail for checks, treatments, vaccinations and withdrawal periods."
      actions={
        <>
          <button
            onClick={() => exportPdf(rows, "Health records")}
            className="btn-secondary"
          >
            <Icon name="download" className="h-4 w-4" />
            PDF report
          </button>
          <button className="btn-primary">
            <Icon name="plus" className="h-4 w-4" />
            New health record
          </button>
        </>
      }
      stats={[
        ["Herd health", "92%", "11 of 12 clear"],
        ["Active treatment", "1", "Clover · DF-2420"],
        ["In quarantine", "1", "Review 12 Aug"],
        ["Checks due", "3", "Next 7 days"],
      ]}
    >
      <RecordTable
        headers={[
          "Date",
          "Rabbit",
          "Record type",
          "Observation / diagnosis",
          "Medication",
          "Next due",
          "Status",
        ]}
        rows={healthRecords.map((r) => [
          shortDate(r.date),
          <strong key={r.id}>
            {r.rabbit}
            <small className="block font-normal text-stone-400">{r.tag}</small>
          </strong>,
          r.type,
          r.details,
          r.medication,
          shortDate(r.nextDue),
          <Status key={r.id}>{r.status}</Status>,
        ])}
      />
    </Module>
  );
}

function Feed() {
  const rows: ExportRow[] = feedRecords.map((r) => ({
    ID: r.id,
    Date: r.date,
    Item: r.item,
    Category: r.category,
    Quantity: r.quantity,
    Unit: r.unit,
    Cost: r.cost,
    Supplier: r.supplier,
    Status: r.stockStatus,
  }));
  return (
    <Module
      title="Feed & farm inventory"
      eyebrow="Stock control"
      description="Track purchases, usage, suppliers, reorder levels and total input cost."
      actions={
        <>
          <button
            onClick={() => exportExcel(rows, "Feed inventory")}
            className="btn-secondary"
          >
            <Icon name="download" className="h-4 w-4" />
            Excel
          </button>
          <button className="btn-primary">
            <Icon name="plus" className="h-4 w-4" />
            Add stock
          </button>
        </>
      }
      stats={[
        ["Feed on hand", "675 kg", "~18 days cover"],
        ["Monthly feed cost", money(547000), "August to date"],
        ["Low-stock items", "3", "1 critical item"],
        ["Daily consumption", "36.8 kg", "2.9 kg / rabbit"],
      ]}
    >
      <RecordTable
        headers={[
          "Stock item",
          "Category",
          "On hand",
          "Supplier",
          "Last updated",
          "Value",
          "Status",
        ]}
        rows={feedRecords.map((r) => [
          <strong key={r.id}>
            {r.item}
            <small className="block font-normal text-stone-400">{r.id}</small>
          </strong>,
          r.category,
          `${r.quantity} ${r.unit}`,
          r.supplier,
          shortDate(r.date),
          money(r.cost),
          <Status key={r.id}>{r.stockStatus}</Status>,
        ])}
      />
    </Module>
  );
}

function Finance({
  income,
  expense,
  transactions,
  add,
  edit,
}: {
  income: number;
  expense: number;
  transactions: Transaction[];
  add: () => void;
  edit: (transaction: Transaction) => void;
}) {
  const receivables = transactions
    .filter(
      (transaction) =>
        transaction.type === "Income" && transaction.status === "Pending",
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const pendingPayments = transactions.filter(
    (transaction) =>
      transaction.type === "Income" && transaction.status === "Pending",
  ).length;
  const rows: ExportRow[] = transactions.map((t) => ({
    ID: t.id,
    Date: t.date,
    Type: t.type,
    Category: t.category,
    Description: t.description,
    Amount: t.amount,
    Status: t.status,
  }));
  return (
    <Module
      title="Farm finance"
      eyebrow="Income & expenditure"
      description="See the true cost and return of the rabbit enterprise, with every transaction documented."
      actions={
        <>
          <button
            onClick={() => exportPdf(rows, "Financial ledger")}
            className="btn-secondary"
          >
            <Icon name="download" className="h-4 w-4" />
            Statement
          </button>
          <button onClick={add} className="btn-primary">
            <Icon name="plus" className="h-4 w-4" />
            Add transaction
          </button>
        </>
      }
      stats={[
        ["Income", money(income), "Current period"],
        ["Expenses", money(expense), "Current period"],
        [
          "Net position",
          money(income - expense),
          income - expense >= 0 ? "Positive balance" : "Cost-heavy period",
        ],
        [
          "Receivables",
          money(receivables),
          `${pendingPayments} pending payment${pendingPayments === 1 ? "" : "s"}`,
        ],
      ]}
    >
      <RecordTable
        headers={[
          "Date",
          "Type",
          "Category",
          "Description",
          "Amount",
          "Reference",
          "Status",
          "Actions",
        ]}
        rows={transactions.map((t) => [
          shortDate(t.date),
          <span
            key={t.id}
            className={
              t.type === "Income"
                ? "font-semibold text-emerald-700"
                : "font-semibold text-rose-600"
            }
          >
            {t.type}
          </span>,
          t.category,
          t.description,
          <strong key={`a${t.id}`}>
            {t.type === "Income" ? "+" : "−"}
            {money(t.amount)}
          </strong>,
          t.id,
          <Status key={`s${t.id}`}>{t.status}</Status>,
          <button
            key={`edit-${t.id}`}
            type="button"
            aria-label={`Edit transaction ${t.id}`}
            title="Adjust entry"
            onClick={() => edit(t)}
            className="action bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
          >
            <Icon name="edit" className="h-3.5 w-3.5" />
          </button>,
        ])}
      />
    </Module>
  );
}

function Module({
  title,
  eyebrow,
  description,
  actions,
  stats,
  children,
}: {
  title: string;
  eyebrow: string;
  description: string;
  actions: React.ReactNode;
  stats: string[][];
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="page-title">{title}</h2>
          <p className="page-subtitle">{description}</p>
        </div>
        <div className="flex gap-2">{actions}</div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, note], i) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[.1em] text-stone-400">
                {label}
              </p>
              <span
                className={`h-2 w-2 rounded-full ${["bg-emerald-500", "bg-amber-400", "bg-sky-500", "bg-violet-500"][i]}`}
              />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-stone-800">
              {value}
            </p>
            <p className="mt-1 text-[10px] text-stone-400">{note}</p>
          </Card>
        ))}
      </div>
      {children}
    </div>
  );
}

function RecordTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-bold">Digital record log</h3>
          <p className="mt-0.5 text-[10px] text-stone-400">
            {rows.length} current records · newest activity first
          </p>
        </div>
        <button className="action">
          <Icon name="more" className="h-4 w-4" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="bg-stone-50/70 text-[9px] uppercase tracking-[.11em] text-stone-400">
              {headers.map((h) => (
                <th key={h} className="px-5 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((row, i) => (
              <tr key={i} className="text-xs hover:bg-emerald-50/20">
                {row.map((cell, j) => (
                  <td key={j} className="px-5 py-4 text-stone-600">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Reports({
  rabbits,
  transactions,
}: {
  rabbits: Rabbit[];
  transactions: Transaction[];
}) {
  const reports = [
    {
      name: "Complete rabbit register",
      desc: "Identity, breed, weight, cage and current status",
      count: rabbits.length,
      rows: rabbitRows(rabbits),
      icon: "rabbit" as const,
    },
    {
      name: "Breeding performance",
      desc: "Matings, pregnancy outcomes, kindling and litter survival",
      count: breedingRecords.length,
      rows: breedingRecords as unknown as ExportRow[],
      icon: "dna" as const,
    },
    {
      name: "Health & medication",
      desc: "Checks, treatments, vaccinations and future care dates",
      count: healthRecords.length,
      rows: healthRecords as unknown as ExportRow[],
      icon: "heart" as const,
    },
    {
      name: "Feed & inventory ledger",
      desc: "Stock on hand, purchases, suppliers and reorder status",
      count: feedRecords.length,
      rows: feedRecords as unknown as ExportRow[],
      icon: "wheat" as const,
    },
    {
      name: "Income & expense ledger",
      desc: "Sales, farm inputs, balances and pending payments",
      count: transactions.length,
      rows: transactions as unknown as ExportRow[],
      icon: "wallet" as const,
    },
  ];
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Audit & backup centre</p>
        <h2 className="page-title">Reports ready when you are.</h2>
        <p className="page-subtitle">
          Export clean, dated farm records for analysis, compliance, partners or
          safekeeping.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {reports.map((report) => (
          <Card
            key={report.name}
            className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Icon name={report.icon} className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold">{report.name}</h3>
              <p className="mt-1 text-[11px] leading-5 text-stone-400">
                {report.desc}
              </p>
              <p className="mt-2 text-[10px] font-semibold text-emerald-700">
                {report.count} records available
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button
                title="Export PDF"
                onClick={() => exportPdf(report.rows, report.name)}
                className="rounded-lg border border-stone-200 px-2.5 py-2 text-[10px] font-bold hover:border-emerald-600 hover:text-emerald-700"
              >
                PDF
              </button>
              <button
                title="Export Excel"
                onClick={() => exportExcel(report.rows, report.name)}
                className="rounded-lg border border-stone-200 px-2.5 py-2 text-[10px] font-bold hover:border-emerald-600 hover:text-emerald-700"
              >
                XLSX
              </button>
            </div>
          </Card>
        ))}
      </div>
      {/* <Card className="overflow-hidden bg-[#123f34] text-white">
        <div className="grid gap-8 p-7 lg:grid-cols-[1fr_.7fr]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#e9b949]">
              Data promise
            </p>
            <h3 className="mt-2 font-serif text-2xl font-bold">
              Your farm history belongs to you.
            </h3>
            <p className="mt-3 max-w-xl text-xs leading-6 text-emerald-50/65">
              Every operational register can be downloaded in open spreadsheet
              format or as a print-ready PDF. Create regular backups to preserve
              the farm’s complete production history.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold">Recommended backup rhythm</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e9b949] text-[#123f34]">
                <Icon name="calendar" className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold">Every Friday</p>
                <p className="text-[10px] text-emerald-50/50">
                  Last backup: 31 Jul 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card> */}
    </div>
  );
}

function Settings({ saved, onSave }: { saved: boolean; onSave: () => void }) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="eyebrow">Configuration</p>
        <h2 className="page-title">Farm settings</h2>
        <p className="page-subtitle">
          Maintain the identity and operating defaults used across your records.
        </p>
      </div>
      <Card className="p-6">
        <h3 className="text-sm font-bold">Farm profile</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="field">
            Farm name
            <input
              className="control mt-1.5"
              defaultValue="Dauson Rabbit Farm"
            />
          </label>
          <label className="field">
            Manager
            <input className="control mt-1.5" defaultValue="David Afolayan" />
          </label>
          <label className="field">
            Phone
            <input
              className="control mt-1.5"
              defaultValue="+234 803 000 0000"
            />
          </label>
          <label className="field">
            Currency
            <select className="control mt-1.5" defaultValue="NGN">
              <option value="NGN">Nigerian Naira (₦)</option>
              <option value="USD">US Dollar ($)</option>
            </select>
          </label>
          <label className="field sm:col-span-2">
            Farm address
            <textarea
              className="control mt-1.5 min-h-20"
              defaultValue="Dauson Farm Estate, Ogun State, Nigeria"
            />
          </label>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="text-sm font-bold">Record preferences</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="field">
            Rabbit tag prefix
            <input className="control mt-1.5" defaultValue="DF-" />
          </label>
          <label className="field">
            Weight unit
            <select className="control mt-1.5">
              <option>Kilograms (kg)</option>
              <option>Pounds (lb)</option>
            </select>
          </label>
          <label className="field">
            Default gestation period
            <input className="control mt-1.5" defaultValue="31 days" />
          </label>
          <label className="field">
            Low feed alert
            <input className="control mt-1.5" defaultValue="7 days remaining" />
          </label>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={onSave} className="btn-primary">
            {saved ? (
              <>
                <Icon name="check" className="h-4 w-4" />
                Saved
              </>
            ) : (
              "Save settings"
            )}
          </button>
        </div>
      </Card>
    </div>
  );
}

function TransactionModal({
  transaction,
  close,
  save,
}: {
  transaction: Transaction | null;
  close: () => void;
  save: (transaction: Omit<Transaction, "id">, transactionId?: string) => void;
}) {
  const [draft, setDraft] = useState<Omit<Transaction, "id">>(() =>
    transaction
      ? {
          date: transaction.date,
          type: transaction.type,
          category: transaction.category,
          description: transaction.description,
          amount: transaction.amount,
          status: transaction.status,
        }
      : {
          date: new Date().toISOString().slice(0, 10),
          type: "Expense",
          category: "Feed",
          description: "",
          amount: 0,
          status: "Paid",
        },
  );
  const categories =
    draft.type === "Income"
      ? ["Rabbit sales", "Breeding stock", "Manure", "Other income"]
      : [
          "Feed",
          "Veterinary",
          "Equipment",
          "Transport",
          "Utilities",
          "Other expense",
        ];
  const update = <K extends keyof Omit<Transaction, "id">>(
    key: K,
    value: Omit<Transaction, "id">[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  const changeType = (type: Transaction["type"]) => {
    setDraft((current) => ({
      ...current,
      type,
      category: type === "Income" ? "Rabbit sales" : "Feed",
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-3 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
      >
        <div className="relative shrink-0 overflow-hidden bg-[#123f34] px-5 py-5 text-white sm:px-7 sm:py-6">
          <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border-[28px] border-white/5" />
          <div className="relative flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9b949] text-[#123f34]">
              <Icon name="wallet" className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[.18em] text-emerald-100/60">
                Financial ledger
              </p>
              <h2
                id="transaction-modal-title"
                className="mt-1 font-serif text-2xl font-bold"
              >
                {transaction ? `Adjust ${transaction.id}` : "Add transaction"}
              </h2>
              <p className="mt-1 text-[11px] text-emerald-50/60">
                {transaction
                  ? "Update this financial record while keeping its reference."
                  : "Record farm income or expenditure in the ledger."}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close transaction form"
              onClick={close}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20"
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            save(draft, transaction?.id);
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain bg-[#fbfcfa] p-4 sm:p-7">
            <fieldset>
              <legend className="field mb-2">Transaction type *</legend>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-stone-100 p-1.5">
                {(["Income", "Expense"] as const).map((type) => (
                  <label
                    key={type}
                    className={`cursor-pointer rounded-xl px-4 py-3 text-center text-xs font-bold transition ${draft.type === type ? (type === "Income" ? "bg-white text-emerald-700 shadow-sm" : "bg-white text-rose-600 shadow-sm") : "text-stone-400"}`}
                  >
                    <input
                      type="radio"
                      name="transactionType"
                      value={type}
                      checked={draft.type === type}
                      onChange={() => changeType(type)}
                      className="sr-only"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field">
                Date *
                <input
                  required
                  type="date"
                  value={draft.date}
                  onChange={(event) => update("date", event.target.value)}
                  className="control mt-1.5"
                />
              </label>
              <label className="field">
                Status *
                <select
                  value={draft.status}
                  onChange={(event) =>
                    update(
                      "status",
                      event.target.value as Transaction["status"],
                    )
                  }
                  className="control mt-1.5"
                >
                  <option>Paid</option>
                  <option>Pending</option>
                </select>
              </label>
              <label className="field">
                Category *
                <select
                  required
                  value={draft.category}
                  onChange={(event) => update("category", event.target.value)}
                  className="control mt-1.5"
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Amount (₦) *
                <input
                  required
                  autoFocus
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={draft.amount || ""}
                  onChange={(event) =>
                    update("amount", Number(event.target.value))
                  }
                  placeholder="0"
                  className="control mt-1.5"
                />
              </label>
              <label className="field sm:col-span-2">
                Description *
                <textarea
                  required
                  value={draft.description}
                  onChange={(event) =>
                    update("description", event.target.value)
                  }
                  placeholder="What was this transaction for?"
                  className="control mt-1.5 min-h-24 resize-y"
                />
              </label>
            </div>
          </div>

          <div className="flex shrink-0 gap-2 border-t border-stone-200 bg-white px-4 py-4 sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={close}
              className="btn-secondary flex-1 sm:flex-none"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 sm:flex-none">
              <Icon name="check" className="h-4 w-4" />
              {transaction ? "Save changes" : "Save transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RabbitModal({
  draft,
  setDraft,
  mode,
  close,
  save,
}: {
  draft: Omit<Rabbit, "id"> & { id?: string };
  setDraft: React.Dispatch<
    React.SetStateAction<Omit<Rabbit, "id"> & { id?: string }>
  >;
  mode: "add" | "edit";
  close: () => void;
  save: (e: React.FormEvent) => void;
}) {
  const update = (key: keyof Rabbit, value: string | number) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const sectionTitle = (
    icon: "rabbit" | "box" | "calendar" | "report",
    title: string,
    note: string,
  ) => (
    <div className="mb-4 flex items-center gap-3 border-b border-stone-100 pb-3 sm:col-span-2">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <div>
        <h3 className="text-xs font-bold text-stone-800">{title}</h3>
        <p className="mt-0.5 text-[10px] text-stone-400">{note}</p>
      </div>
    </div>
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-3 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${mode} rabbit`}
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
      >
        <div className="relative shrink-0 overflow-hidden bg-[#123f34] px-5 py-5 text-white sm:px-8 sm:py-6">
          <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border-[28px] border-white/5" />
          <div className="relative flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9b949] text-[#123f34]">
              <Icon name="rabbit" className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[.18em] text-emerald-100/60">
                Rabbit registry
              </p>
              <h2 className="mt-1 font-serif text-2xl font-bold">
                {mode === "add"
                  ? "Register a new rabbit"
                  : `Edit ${draft.name || "rabbit"}`}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Close form"
              onClick={close}
              className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20"
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>
        </div>
        <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain bg-[#fbfcfa] p-4 sm:p-8">
            <section className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:grid-cols-2">
              {sectionTitle(
                "rabbit",
                "Identity",
                "How this rabbit appears throughout the farm records",
              )}
              <label className="field">
                Tag number *
                <input
                  autoFocus
                  required
                  className="control mt-1.5"
                  value={draft.tag}
                  onChange={(e) => update("tag", e.target.value)}
                  placeholder="e.g. DF-2461"
                />
                <span className="mt-1.5 block text-[9px] font-normal text-stone-400">
                  Use the tag attached to the cage or animal.
                </span>
              </label>
              <label className="field">
                Rabbit name *
                <input
                  required
                  className="control mt-1.5"
                  value={draft.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Hazel"
                />
              </label>
              <label className="field">
                Breed *
                <select
                  className="control mt-1.5"
                  value={draft.breed}
                  onChange={(e) => update("breed", e.target.value)}
                >
                  {[
                    "New Zealand White",
                    "Californian",
                    "Rex",
                    "Flemish Giant",
                    "Dutch",
                    "English Spot",
                    "Chinchilla",
                    "Angora",
                    "Mixed",
                  ].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <fieldset>
                <legend className="field mb-1.5">Sex *</legend>
                <div className="grid grid-cols-2 gap-2">
                  {["Doe", "Buck"].map((option) => (
                    <label
                      key={option}
                      className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-xs font-semibold transition ${draft.sex === option ? "border-emerald-700 bg-emerald-50 text-emerald-800" : "border-stone-200 text-stone-500 hover:border-stone-300"}`}
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        name="sex"
                        value={option}
                        checked={draft.sex === option}
                        onChange={(e) => update("sex", e.target.value)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>
            </section>
            <section className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:grid-cols-2">
              {sectionTitle(
                "box",
                "Farm placement",
                "Production role, condition and current location",
              )}
              <label className="field">
                Purpose *
                <select
                  className="control mt-1.5"
                  value={draft.purpose}
                  onChange={(e) => update("purpose", e.target.value)}
                >
                  {["Breeder", "Grow-out", "Pet", "Meat"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Current status *
                <select
                  className="control mt-1.5"
                  value={draft.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  {[
                    "Healthy",
                    "Pregnant",
                    "Nursing",
                    "Treatment",
                    "Quarantine",
                    "Sold",
                    "Deceased",
                  ].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Cage or pen *
                <input
                  required
                  className="control mt-1.5 uppercase"
                  value={draft.cage}
                  onChange={(e) => update("cage", e.target.value.toUpperCase())}
                  placeholder="e.g. A-01"
                />
              </label>
              <label className="field">
                Current weight *
                <div className="relative mt-1.5">
                  <input
                    required
                    min="0.1"
                    step="0.1"
                    type="number"
                    className="control pr-12"
                    value={draft.weightKg || ""}
                    onChange={(e) => update("weightKg", Number(e.target.value))}
                    placeholder="0.0"
                  />
                  <span className="pointer-events-none absolute right-3 top-2.5 text-[10px] font-bold text-stone-400">
                    KG
                  </span>
                </div>
              </label>
            </section>
            <section className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:grid-cols-2">
              {sectionTitle(
                "calendar",
                "Dates & appearance",
                "Age, entry date and quick visual identification",
              )}
              <label className="field">
                Date of birth *
                <input
                  required
                  type="date"
                  className="control mt-1.5"
                  value={draft.dateOfBirth}
                  onChange={(e) => update("dateOfBirth", e.target.value)}
                />
              </label>
              <label className="field">
                Added to farm *
                <input
                  required
                  type="date"
                  className="control mt-1.5"
                  value={draft.acquiredDate}
                  onChange={(e) => update("acquiredDate", e.target.value)}
                />
              </label>
              <label className="field sm:col-span-2">
                Colour or markings
                <input
                  className="control mt-1.5"
                  value={draft.color}
                  onChange={(e) => update("color", e.target.value)}
                  placeholder="e.g. White with black ears"
                />
              </label>
            </section>
            <section className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:grid-cols-2">
              {sectionTitle(
                "report",
                "Farm notes",
                "Optional observations that help staff care for this rabbit",
              )}
              <label className="field sm:col-span-2">
                Notes
                <textarea
                  className="control mt-1.5 min-h-24 resize-y"
                  value={draft.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Temperament, feeding behaviour, production notes or identifying details…"
                />
                <span className="mt-1.5 block text-right text-[9px] font-normal text-stone-400">
                  Optional
                </span>
              </label>
            </section>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-stone-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="hidden text-[10px] text-stone-400 sm:block">
              Records save automatically to the farm register.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={close}
                className="btn-secondary flex-1 sm:flex-none"
              >
                Cancel
              </button>
              <button className="btn-primary flex-1 sm:flex-none">
                <Icon name="check" className="h-4 w-2" />
                {mode === "add" ? "Add to registry" : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
