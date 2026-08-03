import { useState } from "react";
import { App, Modal, Input, InputNumber, Button, Skeleton, Divider } from "antd";
import { Check } from "lucide-react";
import { Label } from "@/components/shared/Label";
import { Textarea } from "@/components/shared/Textarea";
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
  const [email, setEmail] = useState(initial.email);
  const [address, setAddress] = useState(initial.address);
  const [creditLimit, setCreditLimit] = useState(Number(initial.credit_limit) || 0);
  const [creditTermDays, setCreditTermDays] = useState(initial.credit_term_days);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(Number(initial.loyalty_discount) || 0);
  const [openingBalance, setOpeningBalance] = useState(Number(initial.opening_balance) || 0);

  const valid = name.trim() && phone.trim();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    updateCustomer.mutate(
      {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        credit_limit: String(creditLimit),
        credit_term_days: creditTermDays,
        loyalty_discount: String(loyaltyDiscount),
        opening_balance: String(openingBalance),
      },
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
      <div>
        <Label className="mb-2 block">Email (optional)</Label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl" />
      </div>
      <div>
        <Label className="mb-2 block">Address (optional)</Label>
        <Textarea value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      <Divider className="my-2!">Credit settings</Divider>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block">Credit limit</Label>
          <InputNumber
            value={creditLimit}
            onChange={(v) => setCreditLimit(v ?? 0)}
            min={0}
            className="h-11 w-full rounded-xl [&_input]:h-11!"
            addonAfter="Rs"
          />
        </div>
        <div>
          <Label className="mb-2 block">Credit term</Label>
          <InputNumber
            value={creditTermDays}
            onChange={(v) => setCreditTermDays(v ?? 0)}
            min={0}
            className="h-11 w-full rounded-xl [&_input]:h-11!"
            addonAfter="Days"
          />
        </div>
        <div>
          <Label className="mb-2 block">Loyalty discount</Label>
          <InputNumber
            value={loyaltyDiscount}
            onChange={(v) => setLoyaltyDiscount(v ?? 0)}
            min={0}
            max={100}
            className="h-11 w-full rounded-xl [&_input]:h-11!"
            addonAfter="%"
          />
        </div>
        <div>
          <Label className="mb-2 block">Opening balance</Label>
          <InputNumber
            value={openingBalance}
            onChange={(v) => setOpeningBalance(v ?? 0)}
            className="h-11 w-full rounded-xl [&_input]:h-11!"
            addonAfter="Rs"
          />
        </div>
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
