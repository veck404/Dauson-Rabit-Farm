import type {
  BreedingRecord,
  FarmTask,
  FeedRecord,
  HealthRecord,
  Rabbit,
  Transaction,
} from "./types";

export const initialRabbits: Rabbit[] = [
  { id: "RB-0001", tag: "DF-2401", name: "Willow", breed: "New Zealand White", sex: "Doe", status: "Pregnant", purpose: "Breeder", dateOfBirth: "2024-01-14", weightKg: 4.7, cage: "A-01", color: "White", acquiredDate: "2024-03-02", notes: "Reliable doe; third parity." },
  { id: "RB-0002", tag: "DF-2402", name: "Atlas", breed: "Californian", sex: "Buck", status: "Healthy", purpose: "Breeder", dateOfBirth: "2023-11-22", weightKg: 4.5, cage: "B-03", color: "White / black", acquiredDate: "2024-02-15", notes: "Strong growth line." },
  { id: "RB-0003", tag: "DF-2405", name: "Maple", breed: "Rex", sex: "Doe", status: "Nursing", purpose: "Breeder", dateOfBirth: "2024-02-07", weightKg: 3.9, cage: "M-02", color: "Castor", acquiredDate: "2024-02-07", notes: "Kindled 7 healthy kits." },
  { id: "RB-0004", tag: "DF-2411", name: "Nero", breed: "Flemish Giant", sex: "Buck", status: "Healthy", purpose: "Breeder", dateOfBirth: "2023-08-19", weightKg: 6.8, cage: "B-06", color: "Steel grey", acquiredDate: "2024-01-20", notes: "Calm temperament." },
  { id: "RB-0005", tag: "DF-2420", name: "Clover", breed: "Dutch", sex: "Doe", status: "Treatment", purpose: "Breeder", dateOfBirth: "2024-05-03", weightKg: 2.7, cage: "ISO-01", color: "Black / white", acquiredDate: "2024-05-03", notes: "Recovering from minor eye infection." },
  { id: "RB-0006", tag: "DF-2424", name: "Milo", breed: "New Zealand White", sex: "Buck", status: "Healthy", purpose: "Meat", dateOfBirth: "2025-01-11", weightKg: 3.2, cage: "G-12", color: "White", acquiredDate: "2025-01-11", notes: "Target weight 3.5 kg." },
  { id: "RB-0007", tag: "DF-2430", name: "Fern", breed: "Californian", sex: "Doe", status: "Healthy", purpose: "Grow-out", dateOfBirth: "2025-03-09", weightKg: 2.8, cage: "G-14", color: "White / black", acquiredDate: "2025-03-09", notes: "Breeder candidate." },
  { id: "RB-0008", tag: "DF-2436", name: "Pepper", breed: "English Spot", sex: "Doe", status: "Quarantine", purpose: "Breeder", dateOfBirth: "2024-10-28", weightKg: 3.4, cage: "Q-02", color: "White / black", acquiredDate: "2026-07-29", notes: "New arrival; quarantine ends 12 Aug." },
  { id: "RB-0009", tag: "DF-24b40", name: "Oak", breed: "Rex", sex: "Buck", status: "Healthy", purpose: "Breeder", dateOfBirth: "2024-09-14", weightKg: 4.1, cage: "B-09", color: "Otter", acquiredDate: "2024-09-14", notes: "Excellent coat density." },
  { id: "RB-0010", tag: "DF-2444", name: "Daisy", breed: "New Zealand White", sex: "Doe", status: "Pregnant", purpose: "Breeder", dateOfBirth: "2024-06-17", weightKg: 4.6, cage: "A-05", color: "White", acquiredDate: "2024-06-17", notes: "Nest box due 10 Aug." },
  { id: "RB-0011", tag: "DF-2452", name: "Comet", breed: "Chinchilla", sex: "Buck", status: "Healthy", purpose: "Grow-out", dateOfBirth: "2025-04-25", weightKg: 3.0, cage: "G-18", color: "Chinchilla", acquiredDate: "2025-04-25", notes: "Weekly weight gain on target." },
  { id: "RB-0012", tag: "DF-2460", name: "Ivy", breed: "Californian", sex: "Doe", status: "Healthy", purpose: "Breeder", dateOfBirth: "2024-07-02", weightKg: 4.0, cage: "A-08", color: "White / black", acquiredDate: "2024-07-02", notes: "Ready for next mating cycle." },
];

export const breedingRecords: BreedingRecord[] = [
  { id: "BR-108", doe: "Willow · DF-2401", buck: "Atlas · DF-2402", bredDate: "2026-07-17", dueDate: "2026-08-17", status: "Pregnant", litterSize: null, bornAlive: null },
  { id: "BR-107", doe: "Daisy · DF-2444", buck: "Oak · DF-2440", bredDate: "2026-07-12", dueDate: "2026-08-12", status: "Pregnant", litterSize: null, bornAlive: null },
  { id: "BR-106", doe: "Ivy · DF-2460", buck: "Atlas · DF-2402", bredDate: "2026-07-31", dueDate: "2026-08-31", status: "Palpation due", litterSize: null, bornAlive: null },
  { id: "BR-105", doe: "Maple · DF-2405", buck: "Oak · DF-2440", bredDate: "2026-06-28", dueDate: "2026-07-29", status: "Kindled", litterSize: 8, bornAlive: 7 },
  { id: "BR-104", doe: "Fern · DF-2430", buck: "Atlas · DF-2402", bredDate: "2026-06-24", dueDate: "2026-07-25", status: "Not pregnant", litterSize: null, bornAlive: null },
];

export const healthRecords: HealthRecord[] = [
  { id: "HL-081", rabbit: "Clover", tag: "DF-2420", date: "2026-08-05", type: "Treatment", details: "Left eye discharge", medication: "Oxytetracycline drops", status: "Ongoing", nextDue: "2026-08-08" },
  { id: "HL-080", rabbit: "Pepper", tag: "DF-2436", date: "2026-08-01", type: "Quarantine", details: "New stock observation", medication: "None", status: "Ongoing", nextDue: "2026-08-12" },
  { id: "HL-079", rabbit: "Atlas", tag: "DF-2402", date: "2026-07-28", type: "Routine check", details: "Teeth, nails and body score", medication: "None", status: "Completed", nextDue: "2026-08-28" },
  { id: "HL-078", rabbit: "Daisy", tag: "DF-2444", date: "2026-07-25", type: "Vaccination", details: "RHDV2 booster", medication: "Filavac 0.5 ml", status: "Completed", nextDue: "2027-07-25" },
  { id: "HL-077", rabbit: "Milo", tag: "DF-2424", date: "2026-07-21", type: "Routine check", details: "Weekly grow-out assessment", medication: "None", status: "Completed", nextDue: "2026-08-11" },
];

export const feedRecords: FeedRecord[] = [
  { id: "ST-051", date: "2026-08-04", item: "Grower pellets", category: "Pellets", quantity: 14, unit: "bags", unitWeightKg: 25, reorderLevel: 6, cost: 392000, supplier: "GreenField Feeds", stockStatus: "Good", notes: "Grow-out ration" },
  { id: "ST-050", date: "2026-08-03", item: "Breeder pellets", category: "Pellets", quantity: 5, unit: "bags", unitWeightKg: 25, reorderLevel: 6, cost: 155000, supplier: "GreenField Feeds", stockStatus: "Low", notes: "Breeder and nursing ration" },
  { id: "ST-049", date: "2026-08-02", item: "Timothy hay", category: "Hay", quantity: 8, unit: "bales", unitWeightKg: 25, reorderLevel: 4, cost: 96000, supplier: "Meadow Agro", stockStatus: "Good", notes: "Dry and well ventilated" },
  { id: "ST-048", date: "2026-07-30", item: "Mineral lick", category: "Supplement", quantity: 6, unit: "packs", unitWeightKg: 0, reorderLevel: 8, cost: 24000, supplier: "VetPoint", stockStatus: "Low", notes: "Trace mineral blocks" },
  { id: "ST-047", date: "2026-07-28", item: "Disposable gloves", category: "Supplies", quantity: 2, unit: "boxes", unitWeightKg: 0, reorderLevel: 5, cost: 18500, supplier: "Medline Lagos", stockStatus: "Critical", notes: "Examination gloves" },
  { id: "ST-046", date: "2026-07-24", item: "Rabbit battery cage", category: "Housing", quantity: 12, unit: "units", unitWeightKg: 0, reorderLevel: 2, cost: 840000, supplier: "AgroHousing Works", stockStatus: "Good", notes: "Galvanised single-tier breeder cages" },
  { id: "ST-045", date: "2026-07-22", item: "J-feeder", category: "Feeding equipment", quantity: 18, unit: "units", unitWeightKg: 0, reorderLevel: 6, cost: 126000, supplier: "FarmTech Nigeria", stockStatus: "Good", notes: "Galvanised cage-mounted feeders" },
  { id: "ST-044", date: "2026-07-20", item: "Nipple drinker", category: "Watering equipment", quantity: 9, unit: "units", unitWeightKg: 0, reorderLevel: 10, cost: 36000, supplier: "FarmTech Nigeria", stockStatus: "Low", notes: "Replacement drinker nipples" },
];

export const transactions: Transaction[] = [
  { id: "TX-220", date: "2026-08-05", type: "Income", category: "Rabbit sales", description: "12 grow-outs sold to Ado market", amount: 540000, status: "Paid" },
  { id: "TX-219", date: "2026-08-04", type: "Expense", category: "Feed", description: "Monthly pellet supply", amount: 547000, status: "Paid" },
  { id: "TX-218", date: "2026-08-02", type: "Income", category: "Breeding stock", description: "Two pedigree does", amount: 180000, status: "Paid" },
  { id: "TX-217", date: "2026-07-30", type: "Expense", category: "Veterinary", description: "Medication and farm visit", amount: 85000, status: "Paid" },
  { id: "TX-216", date: "2026-07-27", type: "Income", category: "Manure", description: "Bagged manure sales", amount: 76000, status: "Pending" },
];

export const initialTasks: FarmTask[] = [
  { id: "T-1", title: "Morning feed & water check", time: "07:00", group: "All sections", priority: "High", done: true },
  { id: "T-2", title: "Palpate Ivy (DF-2460)", time: "09:30", group: "Breeding", priority: "High", done: false },
  { id: "T-3", title: "Clover medication", time: "12:00", group: "Health", priority: "High", done: false },
  { id: "T-4", title: "Weigh grow-out group G-12", time: "15:00", group: "Grow-out", priority: "Normal", done: false },
];
