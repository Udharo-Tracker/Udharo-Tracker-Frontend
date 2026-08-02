import { useState } from "react";
import { App, Modal, Input, Button, Skeleton } from "antd";
import { Check } from "lucide-react";
import { Label } from "@/components/shared/Label";
import { useCustomer, useUpdateCustomer } from "@/api/customers.api";
import type { Customer } from "@/types/customer";

interface Props {
  open: boolean;
  id: string;
  onClose: () => void;
}

export function EditCustomerModal({ open, id, onClose }: Props) {
  const customer = useCustomer(id);

  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Edit customer" destroyOnHidden>
      {open &&
        (customer.data ? (
          <EditCustomerForm key={id} id={id} initial={customer.data} onClose={onClose} />
        ) : (
          <Skeleton active paragraph={{ rows: 3 }} />
        ))}
    </Modal>
  );
}

function EditCustomerForm({ id, initial, onClose }: { id: string; initial: Customer; onClose: () => void }) {
  const { message } = App.useApp();
  const updateCustomer = useUpdateCustomer(id);

  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);

  const valid = name.trim() && phone.trim();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    updateCustomer.mutate(
      { name: name.trim(), phone: phone.trim() },
      {
        onSuccess: () => {
          message.success("Customer updated");
          onClose();
        },
        onError: (error) => message.error(error.message),
      }
    );
  };

  return (
    <form onSubmit={submit} className="space-y-4 pt-2">
      <div>
        <Label className="mb-2 block">Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" autoFocus />
      </div>
      <div>
        <Label className="mb-2 block">Phone</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 rounded-xl" />
      </div>
      <Button
        htmlType="submit"
        type="primary"
        disabled={!valid}
        loading={updateCustomer.isPending}
        size="large"
        block
        className="rounded-xl disabled:opacity-50"
      >
        <Check className="size-4" /> Save changes
      </Button>
    </form>
  );
}
