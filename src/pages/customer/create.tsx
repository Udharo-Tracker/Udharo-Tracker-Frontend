import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { App, Modal, Input, Button } from "antd";
import { UserPlus } from "lucide-react";
import { Label } from "@/components/shared/Label";
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

  const valid = name.trim() && phone.trim();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    createCustomer.mutate(
      { name: name.trim(), phone: phone.trim() },
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
