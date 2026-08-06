export type RabbitStatus =
  | "Healthy"
  | "Pregnant"
  | "Nursing"
  | "Treatment"
  | "Quarantine"
  | "Sold"
  | "Deceased";

export type Rabbit = {
  id: string;
  tag: string;
  name: string;
  breed: string;
  sex: "Doe" | "Buck";
  status: RabbitStatus;
  purpose: "Breeder" | "Grow-out" | "Pet" | "Meat";
  dateOfBirth: string;
  weightKg: number;
  cage: string;
  color: string;
  acquiredDate: string;
  notes: string;
};

export type BreedingRecord = {
  id: string;
  doe: string;
  buck: string;
  bredDate: string;
  dueDate: string;
  status: "Pregnant" | "Palpation due" | "Kindled" | "Not pregnant";
  litterSize: number | null;
  bornAlive: number | null;
};

export type HealthRecord = {
  id: string;
  rabbit: string;
  tag: string;
  date: string;
  type: "Routine check" | "Vaccination" | "Treatment" | "Quarantine";
  details: string;
  medication: string;
  status: "Completed" | "Ongoing" | "Due";
  nextDue: string;
};

export type FeedRecord = {
  id: string;
  date: string;
  item: string;
  category: "Pellets" | "Hay" | "Supplement" | "Medicine" | "Supplies";
  quantity: number;
  unit: string;
  cost: number;
  supplier: string;
  stockStatus: "Good" | "Low" | "Critical";
};

export type Transaction = {
  id: string;
  date: string;
  type: "Income" | "Expense";
  category: string;
  description: string;
  amount: number;
  status: "Paid" | "Pending";
};

export type FarmTask = {
  id: string;
  title: string;
  time: string;
  group: string;
  priority: "Normal" | "High";
  done: boolean;
};
