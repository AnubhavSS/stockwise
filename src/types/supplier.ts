export type SupplierStatus = "active" | "inactive";

export type Supplier = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  gstin: string;
  status: SupplierStatus;
  leadTimeDays: number;
};
