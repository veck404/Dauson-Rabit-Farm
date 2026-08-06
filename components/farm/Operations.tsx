import { breedingRecords, feedRecords, healthRecords } from "../../lib/farm-data";
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

export function Feed() {
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


