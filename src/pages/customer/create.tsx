import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { App, Modal, Input, InputNumber, Button, Divider } from "antd";
import { UserPlus } from "lucide-react";
import { Label } from "@/components/shared/Label";
import { Textarea } from "@/components/shared/Textarea";
import { useCreateCustomer } from "@/api/customers.api";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateCustomerModal({ open, onClose }: Props) {
  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Add customer" destroyOnHidden>
      {open && <CreateCustomerForm onClose={onClose} />}
    </Modal>
  );
}

function CreateCustomerForm({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const createCustomer = useCreateCustomer();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [creditLimit, setCreditLimit] = useState(0);
  const [creditTermDays, setCreditTermDays] = useState(0);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [openingBalance, setOpeningBalance] = useState(0);

  const valid = name.trim() && phone.trim();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    createCustomer.mutate(
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
        onSuccess: (customer) => {
          message.success("Customer added");
          onClose();
          navigate(`/customers/${customer.id}`);
        },
        onError: (error) => message.error(error.message),
      }
    );
  };

  return (
    <form onSubmit={submit} className="space-y-4 pt-2">
      <div>
        <Label className="mb-2 block">Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ram Bahadur"
          className="h-11 rounded-xl"
          autoFocus
        />
      </div>
      <div>
        <Label className="mb-2 block">Phone</Label>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="98xxxxxxxx"
          className="h-11 rounded-xl"
        />
      </div>
      <div>
        <Label className="mb-2 block">Email (optional)</Label>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="customer@example.com"
          className="h-11 rounded-xl"
        />
      </div>
      <div>
        <Label className="mb-2 block">Address (optional)</Label>
        <Textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. Baneshwor, Kathmandu"
        />
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
        loading={createCustomer.isPending}
        size="large"
        block
        className="rounded-xl disabled:opacity-50"
      >
        <UserPlus className="size-4" /> Add customer
      </Button>
    </form>
  );
}
