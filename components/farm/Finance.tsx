"use client";

import { useState } from "react";
import type { Transaction } from "../../lib/types";
import type { ExportRow } from "../../lib/farm-utils";
import { exportPdf, money, shortDate } from "../../lib/farm-utils";
import { Icon } from "../Icon";
import { Module, RecordTable, Status } from "./ui";

export function Finance({
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
  const pendingIncome = transactions.filter(
    (item) => item.type === "Income" && item.status === "Pending",
  );
  const receivables = pendingIncome.reduce((sum, item) => sum + item.amount, 0);
  const rows: ExportRow[] = transactions.map((item) => ({
    ID: item.id,
    Date: item.date,
    Type: item.type,
    Category: item.category,
    Description: item.description,
    Amount: item.amount,
    Status: item.status,
  }));

  return (
    <Module
      title="Farm finance"
      eyebrow="Income & expenditure"
      description="See the true cost and return of the rabbit enterprise, with every transaction documented."
      actions={
        <>
          <button onClick={() => exportPdf(rows, "Financial ledger")} className="btn-secondary">
            <Icon name="download" className="h-4 w-4" />Statement
          </button>
          <button onClick={add} className="btn-primary">
            <Icon name="plus" className="h-4 w-4" />Add transaction
          </button>
        </>
      }
      stats={[
        ["Income", money(income), "Current period"],
        ["Expenses", money(expense), "Current period"],
        ["Net position", money(income - expense), income - expense >= 0 ? "Positive balance" : "Cost-heavy period"],
        ["Receivables", money(receivables), `${pendingIncome.length} pending payment${pendingIncome.length === 1 ? "" : "s"}`],
      ]}
    >
      <RecordTable
        headers={["Date", "Type", "Category", "Description", "Amount", "Reference", "Status", "Actions"]}
        rows={transactions.map((item) => [
          shortDate(item.date),
          <span key={item.id} className={item.type === "Income" ? "font-semibold text-emerald-700" : "font-semibold text-rose-600"}>{item.type}</span>,
          item.category,
          item.description,
          <strong key={`amount-${item.id}`}>{item.type === "Income" ? "+" : "−"}{money(item.amount)}</strong>,
          item.id,
          <Status key={`status-${item.id}`}>{item.status}</Status>,
          <button key={`edit-${item.id}`} type="button" aria-label={`Edit transaction ${item.id}`} title="Adjust entry" onClick={() => edit(item)} className="action bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800">
            <Icon name="edit" className="h-3.5 w-3.5" />
          </button>,
        ])}
      />
    </Module>
  );
}

export function TransactionModal({
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
      ? (({ id: _id, ...values }) => values)(transaction)
      : {
          date: new Date().toISOString().slice(0, 10),
          type: "Expense",
          category: "Feed",
          description: "",
          amount: 0,
          status: "Paid",
        },
  );
  const categories = draft.type === "Income"
    ? ["Rabbit sales", "Breeding stock", "Manure", "Other income"]
    : ["Feed", "Veterinary", "Equipment", "Transport", "Utilities", "Other expense"];
  const update = <Key extends keyof Omit<Transaction, "id">>(
    key: Key,
    value: Omit<Transaction, "id">[Key],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  const changeType = (type: Transaction["type"]) =>
    setDraft((current) => ({ ...current, type, category: type === "Income" ? "Rabbit sales" : "Feed" }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-3 backdrop-blur-sm sm:p-6">
      <div role="dialog" aria-modal="true" aria-labelledby="transaction-modal-title" className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
        <header className="relative shrink-0 overflow-hidden bg-[#123f34] px-5 py-5 text-white sm:px-7 sm:py-6">
          <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border-[28px] border-white/5" />
          <div className="relative flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9b949] text-[#123f34]"><Icon name="wallet" className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[.18em] text-emerald-100/60">Financial ledger</p>
              <h2 id="transaction-modal-title" className="mt-1 font-serif text-2xl font-bold">{transaction ? `Adjust ${transaction.id}` : "Add transaction"}</h2>
              <p className="mt-1 text-[11px] text-emerald-50/60">{transaction ? "Update this financial record while keeping its reference." : "Record farm income or expenditure in the ledger."}</p>
            </div>
            <button type="button" aria-label="Close transaction form" onClick={close} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20"><Icon name="close" className="h-5 w-5" /></button>
          </div>
        </header>

        <form onSubmit={(event) => { event.preventDefault(); save(draft, transaction?.id); }} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain bg-[#fbfcfa] p-4 sm:p-7">
            <fieldset>
              <legend className="field mb-2">Transaction type *</legend>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-stone-100 p-1.5">
                {(["Income", "Expense"] as const).map((type) => (
                  <label key={type} className={`cursor-pointer rounded-xl px-4 py-3 text-center text-xs font-bold transition ${draft.type === type ? type === "Income" ? "bg-white text-emerald-700 shadow-sm" : "bg-white text-rose-600 shadow-sm" : "text-stone-400"}`}>
                    <input type="radio" name="transactionType" value={type} checked={draft.type === type} onChange={() => changeType(type)} className="sr-only" />{type}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field">Date *<input required type="date" value={draft.date} onChange={(event) => update("date", event.target.value)} className="control mt-1.5" /></label>
              <label className="field">Status *<select value={draft.status} onChange={(event) => update("status", event.target.value as Transaction["status"])} className="control mt-1.5"><option>Paid</option><option>Pending</option></select></label>
              <label className="field">Category *<select required value={draft.category} onChange={(event) => update("category", event.target.value)} className="control mt-1.5">{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
              <label className="field">Amount (₦) *<input required autoFocus type="number" min="1" step="1" inputMode="numeric" value={draft.amount || ""} onChange={(event) => update("amount", Number(event.target.value))} placeholder="0" className="control mt-1.5" /></label>
              <label className="field sm:col-span-2">Description *<textarea required value={draft.description} onChange={(event) => update("description", event.target.value)} placeholder="What was this transaction for?" className="control mt-1.5 min-h-24 resize-y" /></label>
            </div>
          </div>
          <footer className="flex shrink-0 gap-2 border-t border-stone-200 bg-white px-4 py-4 sm:justify-end sm:px-7">
            <button type="button" onClick={close} className="btn-secondary flex-1 sm:flex-none">Cancel</button>
            <button type="submit" className="btn-primary flex-1 sm:flex-none"><Icon name="check" className="h-4 w-4" />{transaction ? "Save changes" : "Save transaction"}</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
