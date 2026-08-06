"use client";

import type React from "react";
import type { Rabbit } from "../../lib/types";
import { age, exportExcel, exportPdf, rabbitRows } from "../../lib/farm-utils";
import { Icon } from "../Icon";
import { Card, Status } from "./ui";

export function RabbitRegistry({
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

export function RabbitModal({
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
