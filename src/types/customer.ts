export type CustomerStatus = "active" | "inactive";

export type Customer = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  gstin: string;
  status: CustomerStatus;
  outstandingBalance: number;
};
