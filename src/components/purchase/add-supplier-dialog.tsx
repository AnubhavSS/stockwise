"use client";

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
import { usePurchaseStore } from "@/store/purchase-store";
import type { Supplier } from "@/types/supplier";

type AddSupplierDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (supplier: Supplier) => void;
};

export function AddSupplierDialog({
  open,
  onOpenChange,
  onCreated,
}: AddSupplierDialogProps) {
  const addSupplier = usePurchaseStore((state) => state.addSupplier);
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  function reset() {
    setName("");
    setContactPerson("");
    setPhone("");
    setEmail("");
    setCity("");
    setAddress("");
    setError("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Supplier name is required.");
      return;
    }

    const supplier = addSupplier({
      name: name.trim(),
      contactPerson: contactPerson.trim() || name.trim(),
      phone: phone.trim() || "—",
      email:
        email.trim() ||
        `${name.trim().toLowerCase().replaceAll(" ", ".")}@supplier.local`,
      city: city.trim() || "—",
      address: address.trim() || city.trim() || "—",
      gstin: "",
    });
    toast.success(`${supplier.name} added.`);
    onCreated(supplier);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
            <DialogDescription>
              Create a supplier to use on this purchase order.
            </DialogDescription>
          </DialogHeader>
          <FormField id="supp-name" label="Supplier Name" required error={error}>
            <Input
              id="supp-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              placeholder="Tech Distributors"
            />
          </FormField>
          <FormField id="supp-contact" label="Contact Person">
            <Input
              id="supp-contact"
              value={contactPerson}
              onChange={(event) => setContactPerson(event.target.value)}
              placeholder="Karan Malhotra"
            />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField id="supp-phone" label="Phone">
              <Input
                id="supp-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </FormField>
            <FormField id="supp-city" label="City">
              <Input
                id="supp-city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              />
            </FormField>
          </div>
          <FormField id="supp-email" label="Email">
            <Input
              id="supp-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </FormField>
          <FormField id="supp-address" label="Address">
            <Input
              id="supp-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Supplier</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
