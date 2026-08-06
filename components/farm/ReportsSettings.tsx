import { breedingRecords, healthRecords } from "../../lib/farm-data";
import type { FeedRecord, Rabbit, Transaction } from "../../lib/types";
import type { ExportRow } from "../../lib/farm-utils";
import { exportExcel, exportPdf, rabbitRows } from "../../lib/farm-utils";
import { Icon } from "../Icon";
import { Card } from "./ui";

export function Reports({
  rabbits,
  inventory,
  transactions,
}: {
  rabbits: Rabbit[];
  inventory: FeedRecord[];
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
      count: inventory.length,
      rows: inventory as unknown as ExportRow[],
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

export function Settings({ saved, onSave }: { saved: boolean; onSave: () => void }) {
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

