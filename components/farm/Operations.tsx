"use client";

import { useState } from "react";
import { breedingRecords, healthRecords } from "../../lib/farm-data";
import type { FeedRecord } from "../../lib/types";
import type { ExportRow } from "../../lib/farm-utils";
import { exportExcel, exportPdf, money, shortDate } from "../../lib/farm-utils";
import { Icon } from "../Icon";
import { Module, RecordTable, Status } from "./ui";

export function Breeding() {
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

export function Health() {
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

export function Feed({
  inventory,
  add,
  edit,
}: {
  inventory: FeedRecord[];
  add: () => void;
  edit: (record: FeedRecord) => void;
}) {
  const rows: ExportRow[] = inventory.map((r) => ({
    ID: r.id,
    Date: r.date,
    Item: r.item,
    Category: r.category,
    Quantity: r.quantity,
    Unit: r.unit,
    "Unit weight (kg)": r.unitWeightKg,
    "Reorder level": r.reorderLevel,
    Cost: r.cost,
    Supplier: r.supplier,
    Status: r.stockStatus,
    Notes: r.notes,
  }));
  const feedOnHand = inventory.reduce(
    (sum, item) => sum + item.quantity * item.unitWeightKg,
    0,
  );
  const stockValue = inventory.reduce((sum, item) => sum + item.cost, 0);
  const lowStock = inventory.filter((item) => item.stockStatus !== "Good");
  const dailyConsumption = 36.8;
  const daysCover = Math.floor(feedOnHand / dailyConsumption);
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
          <button onClick={add} className="btn-primary">
            <Icon name="plus" className="h-4 w-4" />
            Add stock
          </button>
        </>
      }
      stats={[
        ["Feed on hand", `${feedOnHand.toLocaleString("en-NG")} kg`, `~${daysCover} days cover`],
        ["Inventory value", money(stockValue), `${inventory.length} stock lines`],
        ["Low-stock items", String(lowStock.length), `${lowStock.filter((item) => item.stockStatus === "Critical").length} critical item${lowStock.filter((item) => item.stockStatus === "Critical").length === 1 ? "" : "s"}`],
        ["Daily consumption", `${dailyConsumption} kg`, "Across feeding groups"],
      ]}
    >
      <RecordTable
        headers={[
          "Stock item",
          "Category",
          "On hand",
          "Reorder at",
          "Supplier",
          "Last updated",
          "Value",
          "Status",
          "Actions",
        ]}
        rows={inventory.map((r) => [
          <strong key={r.id}>
            {r.item}
            <small className="block font-normal text-stone-400">{r.id}</small>
          </strong>,
          r.category,
          `${r.quantity} ${r.unit}${r.unitWeightKg ? ` × ${r.unitWeightKg} kg` : ""}`,
          `${r.reorderLevel} ${r.unit}`,
          r.supplier,
          shortDate(r.date),
          money(r.cost),
          <Status key={r.id}>{r.stockStatus}</Status>,
          <button key={`edit-${r.id}`} type="button" aria-label={`Edit stock item ${r.item}`} title="Adjust stock" onClick={() => edit(r)} className="action bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800">
            <Icon name="edit" className="h-3.5 w-3.5" />
          </button>,
        ])}
      />
    </Module>
  );
}

const stockStatusFor = (
  quantity: number,
  reorderLevel: number,
): FeedRecord["stockStatus"] => {
  if (quantity <= reorderLevel / 2) return "Critical";
  if (quantity <= reorderLevel) return "Low";
  return "Good";
};

export function StockModal({
  record,
  close,
  save,
}: {
  record: FeedRecord | null;
  close: () => void;
  save: (record: Omit<FeedRecord, "id">, recordId?: string) => void;
}) {
  const [draft, setDraft] = useState<Omit<FeedRecord, "id">>(() =>
    record
      ? (({ id: _id, ...values }) => values)(record)
      : {
          date: new Date().toISOString().slice(0, 10),
          item: "",
          category: "Pellets",
          quantity: 0,
          unit: "bags",
          unitWeightKg: 25,
          reorderLevel: 5,
          cost: 0,
          supplier: "",
          stockStatus: "Critical",
          notes: "",
        },
  );
  const update = <Key extends keyof Omit<FeedRecord, "id">>(
    key: Key,
    value: Omit<FeedRecord, "id">[Key],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  const currentStatus = stockStatusFor(draft.quantity, draft.reorderLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-3 backdrop-blur-sm sm:p-6">
      <div role="dialog" aria-modal="true" aria-labelledby="stock-modal-title" className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
        <header className="relative shrink-0 overflow-hidden bg-[#123f34] px-5 py-5 text-white sm:px-7 sm:py-6">
          <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border-[28px] border-white/5" />
          <div className="relative flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9b949] text-[#123f34]"><Icon name="wheat" className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[.18em] text-emerald-100/60">Stock control</p>
              <h2 id="stock-modal-title" className="mt-1 font-serif text-2xl font-bold">{record ? `Adjust ${record.id}` : "Add stock item"}</h2>
              <p className="mt-1 text-[11px] text-emerald-50/60">{record ? "Update the quantity, value or supplier details for this item." : "Create a stock line with an automatic reorder status."}</p>
            </div>
            <button type="button" aria-label="Close stock form" onClick={close} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20"><Icon name="close" className="h-5 w-5" /></button>
          </div>
        </header>

        <form onSubmit={(event) => { event.preventDefault(); save({ ...draft, stockStatus: currentStatus }, record?.id); }} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain bg-[#fbfcfa] p-4 sm:p-7">
            <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.12em] text-stone-400">Calculated stock status</p>
                <p className="mt-0.5 text-[11px] text-stone-500">Based on quantity and reorder level</p>
              </div>
              <Status>{currentStatus}</Status>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field sm:col-span-2">Item name *<input required autoFocus value={draft.item} onChange={(event) => update("item", event.target.value)} placeholder="e.g. Grower pellets" className="control mt-1.5" /></label>
              <label className="field">Category *<select value={draft.category} onChange={(event) => update("category", event.target.value as FeedRecord["category"])} className="control mt-1.5"><option>Pellets</option><option>Hay</option><option>Supplement</option><option>Medicine</option><option>Supplies</option></select></label>
              <label className="field">Last updated *<input required type="date" value={draft.date} onChange={(event) => update("date", event.target.value)} className="control mt-1.5" /></label>
              <label className="field">Quantity on hand *<input required type="number" min="0" step="0.01" inputMode="decimal" value={draft.quantity} onChange={(event) => update("quantity", Number(event.target.value))} placeholder="0" className="control mt-1.5" /></label>
              <label className="field">Unit *<input required value={draft.unit} onChange={(event) => update("unit", event.target.value)} placeholder="bags, bales, boxes…" className="control mt-1.5" /></label>
              <label className="field">Weight per unit (kg)<input type="number" min="0" step="0.01" inputMode="decimal" value={draft.unitWeightKg} onChange={(event) => update("unitWeightKg", Number(event.target.value))} placeholder="0 for non-feed items" className="control mt-1.5" /></label>
              <label className="field">Reorder level *<input required type="number" min="0" step="0.01" inputMode="decimal" value={draft.reorderLevel} onChange={(event) => update("reorderLevel", Number(event.target.value))} placeholder="0" className="control mt-1.5" /></label>
              <label className="field">Current stock value (₦) *<input required type="number" min="0" step="1" inputMode="numeric" value={draft.cost} onChange={(event) => update("cost", Number(event.target.value))} placeholder="0" className="control mt-1.5" /></label>
              <label className="field">Supplier *<input required value={draft.supplier} onChange={(event) => update("supplier", event.target.value)} placeholder="Supplier name" className="control mt-1.5" /></label>
              <label className="field sm:col-span-2">Notes<textarea value={draft.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Storage, batch or usage notes…" className="control mt-1.5 min-h-20 resize-y" /></label>
            </div>
          </div>
          <footer className="flex shrink-0 gap-2 border-t border-stone-200 bg-white px-4 py-4 sm:justify-end sm:px-7">
            <button type="button" onClick={close} className="btn-secondary flex-1 sm:flex-none">Cancel</button>
            <button type="submit" className="btn-primary flex-1 sm:flex-none"><Icon name="check" className="h-4 w-4" />{record ? "Save changes" : "Save stock item"}</button>
          </footer>
        </form>
      </div>
    </div>
  );
}
