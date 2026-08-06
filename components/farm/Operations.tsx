"use client";

import { useState } from "react";
import type { BreedingRecord, FeedRecord, HealthRecord, Rabbit } from "../../lib/types";
import type { ExportRow } from "../../lib/farm-utils";
import { daysUntil, exportExcel, exportPdf, money, shortDate } from "../../lib/farm-utils";
import { Icon } from "../Icon";
import { Module, RecordTable, Status } from "./ui";

export function Breeding({
  records,
  add,
  edit,
}: {
  records: BreedingRecord[];
  add: () => void;
  edit: (record: BreedingRecord) => void;
}) {
  const rows: ExportRow[] = records.map((r) => ({
    ID: r.id,
    Doe: r.doe,
    Buck: r.buck,
    "Bred date": r.bredDate,
    "Due date": r.dueDate,
    Status: r.status,
    "Litter size": r.litterSize ?? "—",
    "Born alive": r.bornAlive ?? "—",
  }));
  const completedLitters = records.filter(
    (record) => record.status === "Kindled" && record.litterSize !== null,
  );
  const totalBorn = completedLitters.reduce(
    (sum, record) => sum + (record.litterSize ?? 0),
    0,
  );
  const bornAlive = completedLitters.reduce(
    (sum, record) => sum + (record.bornAlive ?? 0),
    0,
  );
  const averageLitter = completedLitters.length
    ? totalBorn / completedLitters.length
    : 0;
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
          <button onClick={add} className="btn-primary">
            <Icon name="plus" className="h-4 w-4" />
            Record mating
          </button>
        </>
      }
      stats={[
        ["Active pregnancies", String(records.filter((record) => record.status === "Pregnant").length), "Currently confirmed"],
        ["Palpation due", String(records.filter((record) => record.status === "Palpation due").length), "Awaiting confirmation"],
        ["Kits born", String(totalBorn), totalBorn ? `${Math.round((bornAlive / totalBorn) * 100)}% born alive` : "No outcomes recorded"],
        ["Avg. litter size", averageLitter.toFixed(1), `${completedLitters.length} completed litter${completedLitters.length === 1 ? "" : "s"}`],
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
          "Actions",
        ]}
        rows={records.map((r) => [
          r.id,
          r.doe,
          r.buck,
          shortDate(r.bredDate),
          shortDate(r.dueDate),
          r.litterSize ? `${r.bornAlive}/${r.litterSize} alive` : "Pending",
          <Status key={r.id}>{r.status}</Status>,
          <button key={`edit-${r.id}`} type="button" aria-label={`Edit breeding record ${r.id}`} title="Adjust breeding record" onClick={() => edit(r)} className="action bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800">
            <Icon name="edit" className="h-3.5 w-3.5" />
          </button>,
        ])}
      />
    </Module>
  );
}

export function Health({
  records,
  rabbitCount,
  add,
  edit,
}: {
  records: HealthRecord[];
  rabbitCount: number;
  add: () => void;
  edit: (record: HealthRecord) => void;
}) {
  const rows: ExportRow[] = records.map((r) => ({
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
  const ongoing = records.filter((record) => record.status === "Ongoing");
  const quarantine = records.filter((record) => record.type === "Quarantine" && record.status !== "Completed");
  const checksDue = records.filter((record) => {
    const days = daysUntil(record.nextDue);
    return days >= 0 && days <= 7;
  });
  const clearCount = Math.max(0, rabbitCount - ongoing.length);
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
          <button onClick={add} className="btn-primary">
            <Icon name="plus" className="h-4 w-4" />
            New health record
          </button>
        </>
      }
      stats={[
        ["Herd health", `${Math.round((clearCount / Math.max(rabbitCount, 1)) * 100)}%`, `${clearCount} of ${rabbitCount} clear`],
        ["Active care", String(ongoing.length), ongoing.length ? ongoing.map((record) => record.rabbit).join(", ") : "No active cases"],
        ["In quarantine", String(quarantine.length), quarantine.length ? `Review ${shortDate(quarantine[0].nextDue)}` : "No rabbits isolated"],
        ["Checks due", String(checksDue.length), "Next 7 days"],
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
          "Actions",
        ]}
        rows={records.map((r) => [
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
          <button key={`edit-${r.id}`} type="button" aria-label={`Edit health record ${r.id}`} title="Adjust health record" onClick={() => edit(r)} className="action bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800">
            <Icon name="edit" className="h-3.5 w-3.5" />
          </button>,
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

export function BreedingModal({
  record,
  rabbits,
  close,
  save,
}: {
  record: BreedingRecord | null;
  rabbits: Rabbit[];
  close: () => void;
  save: (record: Omit<BreedingRecord, "id">, recordId?: string) => void;
}) {
  const does = rabbits.filter((rabbit) => rabbit.sex === "Doe");
  const bucks = rabbits.filter((rabbit) => rabbit.sex === "Buck");
  const rabbitLabel = (rabbit: Rabbit) => `${rabbit.name} · ${rabbit.tag}`;
  const dueFrom = (date: string) => {
    const due = new Date(`${date}T12:00:00`);
    due.setDate(due.getDate() + 31);
    return due.toISOString().slice(0, 10);
  };
  const today = new Date().toISOString().slice(0, 10);
  const [draft, setDraft] = useState<Omit<BreedingRecord, "id">>(() =>
    record
      ? (({ id: _id, ...values }) => values)(record)
      : {
          doe: does[0] ? rabbitLabel(does[0]) : "",
          buck: bucks[0] ? rabbitLabel(bucks[0]) : "",
          bredDate: today,
          dueDate: dueFrom(today),
          status: "Palpation due",
          litterSize: null,
          bornAlive: null,
        },
  );
  const update = <Key extends keyof Omit<BreedingRecord, "id">>(
    key: Key,
    value: Omit<BreedingRecord, "id">[Key],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  const changeStatus = (status: BreedingRecord["status"]) =>
    setDraft((current) => ({
      ...current,
      status,
      litterSize: status === "Kindled" ? current.litterSize : null,
      bornAlive: status === "Kindled" ? current.bornAlive : null,
    }));
  const changeBredDate = (bredDate: string) =>
    setDraft((current) => ({
      ...current,
      bredDate,
      dueDate: dueFrom(bredDate),
    }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-3 backdrop-blur-sm sm:p-6">
      <div role="dialog" aria-modal="true" aria-labelledby="breeding-modal-title" className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
        <header className="relative shrink-0 overflow-hidden bg-[#123f34] px-5 py-5 text-white sm:px-7 sm:py-6">
          <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border-[28px] border-white/5" />
          <div className="relative flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9b949] text-[#123f34]"><Icon name="dna" className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[.18em] text-emerald-100/60">Reproduction record</p>
              <h2 id="breeding-modal-title" className="mt-1 font-serif text-2xl font-bold">{record ? `Adjust ${record.id}` : "Record mating"}</h2>
              <p className="mt-1 text-[11px] text-emerald-50/60">Link a doe and buck, track the due date and document the litter outcome.</p>
            </div>
            <button type="button" aria-label="Close breeding form" onClick={close} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20"><Icon name="close" className="h-5 w-5" /></button>
          </div>
        </header>
        <form onSubmit={(event) => { event.preventDefault(); save(draft, record?.id); }} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain bg-[#fbfcfa] p-4 sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field">Doe *<select required autoFocus value={draft.doe} onChange={(event) => update("doe", event.target.value)} className="control mt-1.5">{does.map((rabbit) => <option key={rabbit.id} value={rabbitLabel(rabbit)}>{rabbitLabel(rabbit)}</option>)}</select></label>
              <label className="field">Buck *<select required value={draft.buck} onChange={(event) => update("buck", event.target.value)} className="control mt-1.5">{bucks.map((rabbit) => <option key={rabbit.id} value={rabbitLabel(rabbit)}>{rabbitLabel(rabbit)}</option>)}</select></label>
              <label className="field">Mating date *<input required type="date" value={draft.bredDate} onChange={(event) => changeBredDate(event.target.value)} className="control mt-1.5" /></label>
              <label className="field">Due / kindled date *<input required type="date" min={draft.bredDate} value={draft.dueDate} onChange={(event) => update("dueDate", event.target.value)} className="control mt-1.5" /></label>
              <label className="field sm:col-span-2">Status *<select value={draft.status} onChange={(event) => changeStatus(event.target.value as BreedingRecord["status"])} className="control mt-1.5"><option>Palpation due</option><option>Pregnant</option><option>Kindled</option><option>Not pregnant</option></select></label>
              {draft.status === "Kindled" && (
                <>
                  <label className="field">Total litter size *<input required type="number" min="0" step="1" inputMode="numeric" value={draft.litterSize ?? ""} onChange={(event) => update("litterSize", event.target.value === "" ? null : Number(event.target.value))} className="control mt-1.5" /></label>
                  <label className="field">Born alive *<input required type="number" min="0" max={draft.litterSize ?? undefined} step="1" inputMode="numeric" value={draft.bornAlive ?? ""} onChange={(event) => update("bornAlive", event.target.value === "" ? null : Number(event.target.value))} className="control mt-1.5" /></label>
                </>
              )}
            </div>
          </div>
          <footer className="flex shrink-0 gap-2 border-t border-stone-200 bg-white px-4 py-4 sm:justify-end sm:px-7">
            <button type="button" onClick={close} className="btn-secondary flex-1 sm:flex-none">Cancel</button>
            <button type="submit" className="btn-primary flex-1 sm:flex-none"><Icon name="check" className="h-4 w-4" />{record ? "Save changes" : "Save mating"}</button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export function HealthModal({
  record,
  rabbits,
  close,
  save,
}: {
  record: HealthRecord | null;
  rabbits: Rabbit[];
  close: () => void;
  save: (record: Omit<HealthRecord, "id">, recordId?: string) => void;
}) {
  const firstRabbit = rabbits[0];
  const [draft, setDraft] = useState<Omit<HealthRecord, "id">>(() =>
    record
      ? (({ id: _id, ...values }) => values)(record)
      : {
          rabbit: firstRabbit?.name ?? "",
          tag: firstRabbit?.tag ?? "",
          date: new Date().toISOString().slice(0, 10),
          type: "Routine check",
          details: "",
          medication: "None",
          status: "Completed",
          nextDue: "",
        },
  );
  const update = <Key extends keyof Omit<HealthRecord, "id">>(
    key: Key,
    value: Omit<HealthRecord, "id">[Key],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  const selectRabbit = (rabbitId: string) => {
    const rabbit = rabbits.find((item) => item.id === rabbitId);
    if (rabbit)
      setDraft((current) => ({
        ...current,
        rabbit: rabbit.name,
        tag: rabbit.tag,
      }));
  };
  const selectedRabbitId =
    rabbits.find((rabbit) => rabbit.tag === draft.tag)?.id ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-3 backdrop-blur-sm sm:p-6">
      <div role="dialog" aria-modal="true" aria-labelledby="health-modal-title" className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
        <header className="relative shrink-0 overflow-hidden bg-[#123f34] px-5 py-5 text-white sm:px-7 sm:py-6">
          <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border-[28px] border-white/5" />
          <div className="relative flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9b949] text-[#123f34]"><Icon name="heart" className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[.18em] text-emerald-100/60">Health & welfare</p>
              <h2 id="health-modal-title" className="mt-1 font-serif text-2xl font-bold">{record ? `Adjust ${record.id}` : "New health record"}</h2>
              <p className="mt-1 text-[11px] text-emerald-50/60">Document checks, treatment, medication and the next care date.</p>
            </div>
            <button type="button" aria-label="Close health form" onClick={close} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20"><Icon name="close" className="h-5 w-5" /></button>
          </div>
        </header>
        <form onSubmit={(event) => { event.preventDefault(); save(draft, record?.id); }} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain bg-[#fbfcfa] p-4 sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field sm:col-span-2">Rabbit *<select required autoFocus value={selectedRabbitId} onChange={(event) => selectRabbit(event.target.value)} className="control mt-1.5">{rabbits.map((rabbit) => <option key={rabbit.id} value={rabbit.id}>{rabbit.name} · {rabbit.tag} · {rabbit.cage}</option>)}</select></label>
              <label className="field">Record date *<input required type="date" value={draft.date} onChange={(event) => update("date", event.target.value)} className="control mt-1.5" /></label>
              <label className="field">Record type *<select value={draft.type} onChange={(event) => update("type", event.target.value as HealthRecord["type"])} className="control mt-1.5"><option>Routine check</option><option>Vaccination</option><option>Treatment</option><option>Quarantine</option></select></label>
              <label className="field">Status *<select value={draft.status} onChange={(event) => update("status", event.target.value as HealthRecord["status"])} className="control mt-1.5"><option>Completed</option><option>Ongoing</option><option>Due</option></select></label>
              <label className="field">Next due / review *<input required type="date" min={draft.date} value={draft.nextDue} onChange={(event) => update("nextDue", event.target.value)} className="control mt-1.5" /></label>
              <label className="field sm:col-span-2">Observation / diagnosis *<textarea required value={draft.details} onChange={(event) => update("details", event.target.value)} placeholder="Clinical observation, diagnosis or routine findings…" className="control mt-1.5 min-h-24 resize-y" /></label>
              <label className="field sm:col-span-2">Medication / action *<input required value={draft.medication} onChange={(event) => update("medication", event.target.value)} placeholder="Use None when no medication was given" className="control mt-1.5" /></label>
            </div>
          </div>
          <footer className="flex shrink-0 gap-2 border-t border-stone-200 bg-white px-4 py-4 sm:justify-end sm:px-7">
            <button type="button" onClick={close} className="btn-secondary flex-1 sm:flex-none">Cancel</button>
            <button type="submit" className="btn-primary flex-1 sm:flex-none"><Icon name="check" className="h-4 w-4" />{record ? "Save changes" : "Save health record"}</button>
          </footer>
        </form>
      </div>
    </div>
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
