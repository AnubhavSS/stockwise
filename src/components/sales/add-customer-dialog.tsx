"use client";

/**
 * Add a customer without leaving the sales form.
 */
import { useState } from "react";
import { toast } from "sonner";

import { FormField } from "@/components/stock/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSalesStore } from "@/store/sales-store";
import type { Customer } from "@/types/customer";

type AddCustomerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (customer: Customer) => void;
};

export function AddCustomerDialog({
  open,
  onOpenChange,
  onCreated,
}: AddCustomerDialogProps) {
  const addCustomer = useSalesStore((state) => state.addCustomer);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");

  function reset() {
    setName("");
    setPhone("");
    setEmail("");
    setCity("");
    setError("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Customer name is required.");
      return;
    }

    const customer = addCustomer({
      name: name.trim(),
      contactPerson: name.trim(),
      phone: phone.trim() || "—",
      email: email.trim() || `${name.trim().toLowerCase().replaceAll(" ", ".")}@email.com`,
      city: city.trim() || "—",
      gstin: "",
    });
    toast.success(`${customer.name} added.`);
    onCreated(customer);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>
              Create a customer record to use on this sale.
            </DialogDescription>
          </DialogHeader>
          <FormField id="cust-name" label="Name" required error={error}>
            <Input
              id="cust-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              placeholder="Rahul Sharma"
            />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField id="cust-phone" label="Phone">
              <Input
                id="cust-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+91 98XXX XXXXX"
              />
            </FormField>
            <FormField id="cust-city" label="City">
              <Input
                id="cust-city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Ahmedabad"
              />
            </FormField>
          </div>
          <FormField id="cust-email" label="Email">
            <Input
              id="cust-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@email.com"
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Customer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
