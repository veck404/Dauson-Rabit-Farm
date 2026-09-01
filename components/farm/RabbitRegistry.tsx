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
    step: string,
    icon: "rabbit" | "box" | "calendar" | "report",
    title: string,
    note: string,
  ) => (
    <div className="col-span-2 mb-0.5 flex items-center gap-2.5 border-b border-stone-100 pb-2.5 sm:mb-1 sm:gap-3 sm:pb-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#eaf4ef] text-[#17624e] ring-1 ring-inset ring-emerald-800/5 sm:h-9 sm:w-9">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-[13px] font-bold leading-4 text-[#183c32]">
          {title}
        </h3>
        <p className="mt-0.5 hidden text-[10px] text-stone-400 sm:block sm:truncate">
          {note}
        </p>
      </div>
      <span className="font-mono text-[10px] font-bold tracking-wider text-stone-300">
        {step}
      </span>
    </div>
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071c17]/70 backdrop-blur-[6px] sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${mode} rabbit`}
        className="flex h-[100dvh] w-full max-w-5xl flex-col overflow-hidden bg-white shadow-[0_28px_90px_rgba(7,28,23,0.32)] sm:h-auto sm:max-h-[calc(100dvh-3rem)] sm:rounded-[24px] sm:ring-1 sm:ring-white/20"
      >
        <div className="relative shrink-0 overflow-hidden bg-[#103f33] px-3.5 py-3 text-white sm:px-7 sm:py-5">
          <div className="absolute -right-10 -top-24 h-56 w-56 rounded-full bg-emerald-300/10 blur-2xl" />
          <div className="absolute -bottom-24 right-32 h-44 w-44 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/40 to-transparent" />
          <div className="relative flex items-center gap-3 sm:items-start sm:gap-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f0c65a] text-[#103f33] shadow-[0_8px_20px_rgba(0,0,0,0.15)] ring-1 ring-white/30 sm:h-11 sm:w-11 sm:rounded-[14px]">
              <Icon name="rabbit" className="h-[18px] w-[18px] sm:h-6 sm:w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[.18em] text-emerald-100/60">
                Herd registry <span className="mx-1 text-white/20">/</span>{" "}
                {mode === "add" ? "New record" : "Update record"}
              </p>
              <h2 className="mt-0.5 truncate font-serif text-base font-bold tracking-[-0.01em] sm:mt-1 sm:text-2xl">
                {mode === "add"
                  ? "Register a new rabbit"
                  : `Edit ${draft.name || "rabbit"}`}
              </h2>
              <p className="mt-1 hidden text-[10px] text-emerald-50/55 sm:block">
                Build a complete identity and care profile for this animal.
              </p>
            </div>
            <button
              type="button"
              aria-label="Close form"
              onClick={close}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.07] text-white/80 hover:bg-white/15 hover:text-white"
            >
              <Icon name="close" className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
        <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 grid-cols-1 items-start gap-3 overflow-y-auto overscroll-contain bg-[#f3f6f4] p-2.5 sm:p-5 lg:grid-cols-2 lg:gap-4">
            <section className="grid grid-cols-2 gap-x-2.5 gap-y-3 rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-[0_1px_2px_rgba(18,63,52,0.04),0_8px_24px_rgba(18,63,52,0.035)] [&>*]:min-w-0 sm:gap-x-4 sm:gap-y-3.5 sm:p-5">
              {sectionTitle(
                "01",
                "rabbit",
                "Identity",
                "How this rabbit appears throughout the farm records",
              )}
              <label className="rabbit-field">
                Tag number *
                <input
                  required
                  className="rabbit-control mt-1.5"
                  value={draft.tag}
                  onChange={(e) => update("tag", e.target.value)}
                  placeholder="e.g. DF-2461"
                />
                <span className="mt-1.5 hidden text-[9px] font-normal text-stone-400 sm:block">
                  Use the tag attached to the cage or animal.
                </span>
              </label>
              <label className="rabbit-field">
                Rabbit name *
                <input
                  required
                  className="rabbit-control mt-1.5"
                  value={draft.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Hazel"
                />
              </label>
              <label className="rabbit-field">
                Breed *
                <select
                  className="rabbit-control mt-1.5"
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
                <legend className="rabbit-field mb-1.5">Sex *</legend>
                <div className="flex min-h-8 items-center gap-4 rounded-[10px] border border-stone-200 bg-[#f8faf8] px-3">
                  {["Doe", "Buck"].map((option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-1.5 text-[12px] font-semibold text-stone-600 transition hover:text-emerald-800"
                    >
                      <input
                        className="rabbit-radio"
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
            <section className="grid grid-cols-2 gap-x-2.5 gap-y-3 rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-[0_1px_2px_rgba(18,63,52,0.04),0_8px_24px_rgba(18,63,52,0.035)] [&>*]:min-w-0 sm:gap-x-4 sm:gap-y-3.5 sm:p-5">
              {sectionTitle(
                "02",
                "box",
                "Farm placement",
                "Production role, condition and current location",
              )}
              <label className="rabbit-field">
                Purpose *
                <select
                  className="rabbit-control mt-1.5"
                  value={draft.purpose}
                  onChange={(e) => update("purpose", e.target.value)}
                >
                  {["Breeder", "Grow-out", "Meat"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label className="rabbit-field">
                Current status *
                <select
                  className="rabbit-control mt-1.5"
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
              <label className="rabbit-field">
                Cage or pen *
                <input
                  required
                  className="rabbit-control mt-1.5 uppercase"
                  value={draft.cage}
                  onChange={(e) => update("cage", e.target.value.toUpperCase())}
                  placeholder="e.g. A-01"
                />
              </label>
              <label className="rabbit-field">
                Current weight *
                <div className="relative mt-1.5">
                  <input
                    required
                    min="0.1"
                    step="0.1"
                    type="number"
                    className="rabbit-control pl-3 pr-10"
                    value={draft.weightKg || ""}
                    onChange={(e) => update("weightKg", Number(e.target.value))}
                    placeholder="0.0"
                  />
                  <span className="pointer-events-none absolute right-3 top-1.5 text-[10px] font-bold tracking-wide text-stone-400">
                    KG
                  </span>
                </div>
              </label>
            </section>
            <section className="grid grid-cols-2 gap-x-2.5 gap-y-3 rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-[0_1px_2px_rgba(18,63,52,0.04),0_8px_24px_rgba(18,63,52,0.035)] [&>*]:min-w-0 sm:gap-x-4 sm:gap-y-3.5 sm:p-5">
              {sectionTitle(
                "03",
                "calendar",
                "Dates & appearance",
                "Age, entry date and quick visual identification",
              )}
              <label className="rabbit-field">
                Date of birth *
                <input
                  required
                  type="date"
                  className="rabbit-control mt-1.5 px-2"
                  value={draft.dateOfBirth}
                  onChange={(e) => update("dateOfBirth", e.target.value)}
                />
              </label>
              <label className="rabbit-field">
                Added to farm *
                <input
                  required
                  type="date"
                  className="rabbit-control mt-1.5 px-2"
                  value={draft.acquiredDate}
                  onChange={(e) => update("acquiredDate", e.target.value)}
                />
              </label>
              <label className="rabbit-field col-span-2">
                Colour or markings
                <input
                  className="rabbit-control mt-1.5"
                  value={draft.color}
                  onChange={(e) => update("color", e.target.value)}
                  placeholder="e.g. White with black ears"
                />
              </label>
            </section>
            <section className="grid grid-cols-2 gap-x-2.5 gap-y-3 rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-[0_1px_2px_rgba(18,63,52,0.04),0_8px_24px_rgba(18,63,52,0.035)] [&>*]:min-w-0 sm:gap-x-4 sm:gap-y-3.5 sm:p-5">
              {sectionTitle(
                "04",
                "report",
                "Farm notes",
                "Optional observations that help staff care for this rabbit",
              )}
              <label className="rabbit-field col-span-2">
                Notes
                <textarea
                  className="rabbit-control mt-1.5 min-h-[72px] resize-y sm:min-h-24"
                  value={draft.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Temperament, feeding behaviour, production notes or identifying details…"
                />
                <span className="mt-1 hidden text-right text-[9px] font-normal text-stone-400 sm:block">
                  Optional
                </span>
              </label>
            </section>
          </div>
          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-stone-200/80 bg-white px-3.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_24px_rgba(18,63,52,0.03)] sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-3.5">
            <p className="hidden items-center gap-2 text-[10px] text-stone-400 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Stored securely on this device
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={close}
                className="flex flex-1 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-600 hover:border-stone-300 hover:bg-stone-50 sm:flex-none"
              >
                Cancel
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#155c49] px-5 py-2 text-xs font-bold text-white shadow-[0_7px_16px_rgba(21,92,73,0.2)] hover:-translate-y-px hover:bg-[#104b3c] hover:shadow-[0_9px_20px_rgba(21,92,73,0.25)] sm:flex-none">
                <Icon name="check" className="h-4 w-4" />
                {mode === "add" ? "Add to registry" : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
