import { useCallback, useMemo, useState, type ReactNode } from "react";
import { EntityModalsContext } from "./entity-modals-context";
import { CreateCustomerModal } from "@/pages/customer/create";
import { EditCustomerModal } from "@/pages/customer/edit";
import { CreatePaymentModal } from "@/pages/payment/create";
import { EditPaymentModal } from "@/pages/payment/edit";
import { CreateUdharoModal } from "@/pages/udharo/create";
import { EditUdharoModal } from "@/pages/udharo/edit";

type ModalState =
  | { type: "none" }
  | { type: "create-customer" }
  | { type: "edit-customer"; id: string }
  | { type: "create-payment"; customerId?: string }
  | { type: "edit-payment"; id: string }
  | { type: "create-udharo"; customerId?: string }
  | { type: "edit-udharo"; id: string };

export function EntityModalsProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const close = useCallback(() => setModal({ type: "none" }), []);

  const value = useMemo(
    () => ({
      openCreateCustomer: () => setModal({ type: "create-customer" }),
      openEditCustomer: (id: string) => setModal({ type: "edit-customer", id }),
      openCreatePayment: (customerId?: string) => setModal({ type: "create-payment", customerId }),
      openEditPayment: (id: string) => setModal({ type: "edit-payment", id }),
      openCreateUdharo: (customerId?: string) => setModal({ type: "create-udharo", customerId }),
      openEditUdharo: (id: string) => setModal({ type: "edit-udharo", id }),
    }),
    []
  );

  return (
    <EntityModalsContext.Provider value={value}>
      {children}
      <CreateCustomerModal open={modal.type === "create-customer"} onClose={close} />
      <EditCustomerModal
        open={modal.type === "edit-customer"}
        id={modal.type === "edit-customer" ? modal.id : ""}
        onClose={close}
      />
      <CreatePaymentModal
        open={modal.type === "create-payment"}
        customerId={modal.type === "create-payment" ? modal.customerId : undefined}
        onClose={close}
      />
      <EditPaymentModal
        open={modal.type === "edit-payment"}
        id={modal.type === "edit-payment" ? modal.id : ""}
        onClose={close}
      />
      <CreateUdharoModal
        open={modal.type === "create-udharo"}
        customerId={modal.type === "create-udharo" ? modal.customerId : undefined}
        onClose={close}
      />
      <EditUdharoModal
        open={modal.type === "edit-udharo"}
        id={modal.type === "edit-udharo" ? modal.id : ""}
        onClose={close}
      />
    </EntityModalsContext.Provider>
  );
}
