import { createContext, useContext } from "react";

export interface EntityModalsContextValue {
  openCreateCustomer: () => void;
  openEditCustomer: (id: string) => void;
  openCreatePayment: (customerId?: string) => void;
  openEditPayment: (id: string) => void;
  openCreateUdharo: (customerId?: string) => void;
  openEditUdharo: (id: string) => void;
  openTransactionDetail: (id: string) => void;
}

export const EntityModalsContext =
  createContext<EntityModalsContextValue | null>(null);

export function useEntityModals() {
  const ctx = useContext(EntityModalsContext);
  if (!ctx)
    throw new Error("useEntityModals must be used within EntityModalsProvider");
  return ctx;
}
