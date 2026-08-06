import { Icon } from "../Icon";

export function Status({ children }: { children: string }) {
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
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${tone[children] ?? "bg-stone-100 text-stone-600 ring-stone-500/15"}`}>
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-stone-200/80 bg-white shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function Module({
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
        {stats.map(([label, value, note], index) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[.1em] text-stone-400">{label}</p>
              <span className={`h-2 w-2 rounded-full ${["bg-emerald-500", "bg-amber-400", "bg-sky-500", "bg-violet-500"][index]}`} />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-stone-800">{value}</p>
            <p className="mt-1 text-[10px] text-stone-400">{note}</p>
          </Card>
        ))}
      </div>
      {children}
    </div>
  );
}

export function RecordTable({
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
          <p className="mt-0.5 text-[10px] text-stone-400">{rows.length} current records · newest activity first</p>
        </div>
        <button className="action"><Icon name="more" className="h-4 w-4" /></button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="bg-stone-50/70 text-[9px] uppercase tracking-[.11em] text-stone-400">
              {headers.map((header) => <th key={header} className="px-5 py-3">{header}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="text-xs hover:bg-emerald-50/20">
                {row.map((cell, cellIndex) => <td key={cellIndex} className="px-5 py-4 text-stone-600">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
