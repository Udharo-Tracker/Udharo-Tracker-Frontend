import { useNavigate } from "react-router-dom";
import {
  App,
  Modal,
  Input,
  InputNumber,
  Button,
  Divider,
  Form,
  Space,
} from "antd";
import { UserPlus } from "lucide-react";
import { Textarea } from "@/components/shared/Textarea";
import { useCreateCustomer } from "@/api/customers.api";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateCustomerModal({ open, onClose }: Props) {
  return (
    <Modal
      width={620}
      open={open}
      onCancel={onClose}
      footer={null}
      title="Add customer"
      destroyOnHidden
    >
      {open && <CreateCustomerForm onClose={onClose} />}
    </Modal>
  );
}

interface CreateCustomerFormValues {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  creditLimit: number;
  creditTermDays: number;
  loyaltyDiscount: number;
  openingBalance: number;
}

function CreateCustomerForm({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const createCustomer = useCreateCustomer();
  const [form] = Form.useForm<CreateCustomerFormValues>();

  const submit = (values: CreateCustomerFormValues) => {
    createCustomer.mutate(
      {
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email?.trim() ?? "",
        address: values.address?.trim() ?? "",
        credit_limit: String(values.creditLimit ?? 0),
        credit_term_days: values.creditTermDays ?? 0,
        loyalty_discount: String(values.loyaltyDiscount ?? 0),
        opening_balance: String(values.openingBalance ?? 0),
      },
      {
        onSuccess: () => {
          message.success("Customer added");
          onClose();
          navigate("/customers");
        },
        onError: (error) => message.error(error.message),
      },
    );
  };

  return (
    <Form<CreateCustomerFormValues>
      form={form}
      layout="vertical"
      onFinish={submit}
      className="pt-2"
      initialValues={{
        creditLimit: 0,
        creditTermDays: 0,
        loyaltyDiscount: 0,
        openingBalance: 0,
      }}
    >
      <div className="w-full flex flex-col gap-4">
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter customer name" }]}
          style={{ width: "100%", margin: 0, padding: 0 }}
        >
          <Input placeholder="e.g. Ram Bahadur" />
        </Form.Item>
        <Form.Item
          label="Phone"
          name="phone"
          rules={[{ required: true, message: "Please enter phone number" }]}
          style={{ width: "100%", margin: 0, padding: 0 }}
        >
          <Input placeholder="98xxxxxxxx" />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          style={{ width: "100%", margin: 0, padding: 0 }}
        >
          <Input placeholder="customer@example.com" />
        </Form.Item>
        <Form.Item
          label="Address"
          name="address"
          style={{ width: "100%", margin: 0, padding: 0 }}
        >
          <Textarea placeholder="e.g. Baneshwor, Kathmandu" />
        </Form.Item>
      </div>
      <Divider className="my-4!">Credit settings</Divider>

      <div className="w-full grid grid-cols-2 pb-5 gap-4">
        <Form.Item
          label="Credit limit"
          tooltip="Maximum outstanding amount this customer can owe before new udharo entries are blocked."
          style={{ width: "100%", margin: 0, padding: 0 }}
        >
          <Space.Compact style={{ width: "100%" }}>
            <Form.Item name="creditLimit" noStyle>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Button disabled>Rs</Button>
          </Space.Compact>
        </Form.Item>
        <Form.Item
          label="Credit term"
          tooltip="Number of days the customer has to clear dues before the balance is considered overdue."
          style={{ width: "100%", margin: 0, padding: 0 }}
        >
          <Space.Compact style={{ width: "100%" }}>
            <Form.Item name="creditTermDays" noStyle>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Button disabled>Days</Button>
          </Space.Compact>
        </Form.Item>
        <Form.Item
          label="Loyalty discount"
          tooltip="Discount percentage automatically applied to this customer's purchases."
          style={{ width: "100%", margin: 0, padding: 0 }}
        >
          <Space.Compact style={{ width: "100%" }}>
            <Form.Item name="loyaltyDiscount" noStyle>
              <InputNumber min={0} max={100} style={{ width: "100%" }} />
            </Form.Item>
            <Button disabled>%</Button>
          </Space.Compact>
        </Form.Item>
        <Form.Item
          label="Opening balance"
          tooltip="Any existing due amount to carry over when this customer is added."
          style={{ width: "100%", margin: 0, padding: 0 }}
        >
          <Space.Compact style={{ width: "100%" }}>
            <Form.Item name="openingBalance" noStyle>
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Button disabled>Rs</Button>
          </Space.Compact>
        </Form.Item>
      </div>

      <Form.Item className="mb-0! mt-6">
        <Button
          htmlType="submit"
          type="primary"
          loading={createCustomer.isPending}
          size="large"
          block
          className="rounded-xl"
        >
          <UserPlus className="size-4" /> Add customer
        </Button>
      </Form.Item>
    </Form>
  );
}
