import { useState } from "react";
import type React from "react";
import type {
  BreedingRecord,
  FarmTask,
  FarmView,
  FeedRecord,
  Rabbit,
} from "../../lib/types";
import { daysUntil, money, shortDate } from "../../lib/farm-utils";
import { Icon } from "../Icon";
import { Card, Status } from "./ui";

export function Dashboard({
  rabbits,
  tasks,
  setTasks,
  inventory,
  breeding,
  healthy,
  dueThisMonth,
  profit,
  go,
  addRabbit,
  addTask,
  editTask,
}: {
  rabbits: Rabbit[];
  tasks: FarmTask[];
  setTasks: React.Dispatch<React.SetStateAction<FarmTask[]>>;
  inventory: FeedRecord[];
  breeding: BreedingRecord[];
  healthy: number;
  dueThisMonth: number;
  profit: number;
  go: (v: FarmView) => void;
  addRabbit: () => void;
  addTask: () => void;
  editTask: (task: FarmTask) => void;
}) {
  const orderedTasks = [...tasks].sort((a, b) => a.time.localeCompare(b.time));
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
            Good morning, Esther.
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
          <Card key={kpi.label} className="px-3 py-1.5 xl:px-4 xl:py-3">
            <div className="flex items-start justify-between">
              <div
                className={`grid h-6 w-6 place-items-center rounded-md xl:h-8 xl:w-8 xl:rounded-lg ${kpi.tone}`}
              >
                <Icon name={kpi.icon} className="h-3.5 w-3.5 xl:h-4 xl:w-4" />
              </div>
              <span className="text-[9px] font-semibold text-emerald-700 xl:text-[10px]">
                ● Live
              </span>
            </div>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[.08em] text-stone-400 xl:mt-2 xl:text-[10px]">
              {kpi.label}
            </p>
            <div className="flex items-end justify-between gap-2 xl:mt-0.5">
              <p className="text-lg font-bold tracking-tight text-stone-800 xl:text-xl">
                {kpi.value}
              </p>
              <p className="hidden pb-1 text-[10px] text-stone-400 xl:block">
                {kpi.note}
              </p>
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
            {orderedTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 py-3.5">
                <button
                  type="button"
                  aria-label={
                    task.done
                      ? `Mark ${task.title} incomplete`
                      : `Mark ${task.title} complete`
                  }
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
                    {formatTaskTime(task.time)} · {task.group}
                  </span>
                </span>
                {task.priority === "High" && !task.done && (
                  <i className="h-2 w-2 rounded-full bg-rose-400" />
                )}
                <button
                  type="button"
                  aria-label={`Edit task ${task.title}`}
                  title="Edit task"
                  onClick={() => editTask(task)}
                  className="action shrink-0"
                >
                  <Icon name="edit" className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="p-4 pt-2">
            <button
              type="button"
              onClick={addTask}
              className="w-full rounded-xl border border-dashed border-stone-300 py-2.5 text-[11px] font-semibold text-stone-500 hover:border-emerald-600 hover:text-emerald-700"
            >
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
                {breeding.slice(0, 4).map((r) => (
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
            {inventory
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

const formatTaskTime = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

export function TaskModal({
  task,
  close,
  save,
}: {
  task: FarmTask | null;
  close: () => void;
  save: (task: Omit<FarmTask, "id">, taskId?: string) => void;
}) {
  const [draft, setDraft] = useState<Omit<FarmTask, "id">>(() =>
    task
      ? (({ id: _id, ...values }) => values)(task)
      : {
          title: "",
          time: "07:00",
          group: "All sections",
          priority: "Normal",
          done: false,
        },
  );
  const update = <Key extends keyof Omit<FarmTask, "id">>(
    key: Key,
    value: Omit<FarmTask, "id">[Key],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-3 backdrop-blur-sm sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl"
      >
        <header className="relative shrink-0 overflow-hidden bg-[#123f34] px-5 py-5 text-white sm:px-7 sm:py-6">
          <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border-[28px] border-white/5" />
          <div className="relative flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9b949] text-[#123f34]">
              <Icon name="calendar" className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[.18em] text-emerald-100/60">
                Today’s work plan
              </p>
              <h2
                id="task-modal-title"
                className="mt-1 font-serif text-2xl font-bold"
              >
                {task ? `Edit ${task.id}` : "Add farm task"}
              </h2>
              <p className="mt-1 text-[11px] text-emerald-50/60">
                Schedule and prioritise today’s farm work.
              </p>
            </div>
            <button
              type="button"
              aria-label="Close task form"
              onClick={close}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20"
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>
        </header>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save(draft, task?.id);
          }}
        >
          <div className="grid gap-4 bg-[#fbfcfa] p-4 sm:grid-cols-2 sm:p-7">
            <label className="field sm:col-span-2">
              Task *
              <input
                required
                autoFocus
                value={draft.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="What needs to be done?"
                className="control mt-1.5"
              />
            </label>
            <label className="field">
              Time *
              <input
                required
                type="time"
                value={draft.time}
                onChange={(event) => update("time", event.target.value)}
                className="control mt-1.5"
              />
            </label>
            <label className="field">
              Work area *
              <select
                value={draft.group}
                onChange={(event) => update("group", event.target.value)}
                className="control mt-1.5"
              >
                <option>All sections</option>
                <option>Feeding</option>
                <option>Breeding</option>
                <option>Health</option>
                <option>Grow-out</option>
                <option>Inventory</option>
                <option>Cleaning</option>
                <option>Maintenance</option>
              </select>
            </label>
            <label className="field">
              Priority *
              <select
                value={draft.priority}
                onChange={(event) =>
                  update("priority", event.target.value as FarmTask["priority"])
                }
                className="control mt-1.5"
              >
                <option>Normal</option>
                <option>High</option>
              </select>
            </label>
            <label className="field">
              Progress *
              <select
                value={draft.done ? "Completed" : "Pending"}
                onChange={(event) =>
                  update("done", event.target.value === "Completed")
                }
                className="control mt-1.5"
              >
                <option>Pending</option>
                <option>Completed</option>
              </select>
            </label>
          </div>
          <footer className="flex gap-2 border-t border-stone-200 bg-white px-4 py-4 sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={close}
              className="btn-secondary flex-1 sm:flex-none"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 sm:flex-none">
              <Icon name="check" className="h-4 w-4" />
              {task ? "Save changes" : "Save task"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
