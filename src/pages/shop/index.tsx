import { Form, Input, Button, Alert, App, Space } from "antd";
import { MapPin, Plus } from "lucide-react";
import { Panel } from "@/components/shared/Panel";
import { useShops, useCreateShop } from "@/api/shops.api";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface ShopFormValues {
  name: string;
  phone: string;
  address: string;
}

export function Shops() {
  const { isError, error } = useShops();
  const createShop = useCreateShop();
  const { message } = App.useApp();
  const [form] = Form.useForm<ShopFormValues>();
  const watchedName = Form.useWatch("name", form);

  const submit = (values: ShopFormValues) => {
    createShop.mutate(
      {
        name: values.name.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
      },
      {
        onSuccess: () => {
          message.success("Shop added");
          form.resetFields();
        },
        onError: (err) => message.error(err.message),
      },
    );
  };

  return (
    <div className="max-w-3xl space-y-6 pb-24">
      <header>
        <h1 className="text-3xl font-bold">Shop settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage the shops linked to your account.
        </p>
      </header>

      {isError && (
        <Alert
          type="error"
          showIcon
          title="Couldn't load shops"
          description={(error as Error).message}
        />
      )}

      <Panel padding="lg">
        <div className="flex items-center gap-4 pb-5 mb-6 border-b border-border">
          <div className="size-14 rounded-2xl bg-primary-soft text-primary grid place-items-center text-lg font-semibold shrink-0">
            {initialsOf(watchedName || "")}
          </div>
          <div>
            <h2 className="font-semibold text-base">Shop Basic Details</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              These details appear on receipts and reminders sent to customers.
            </p>
          </div>
        </div>

        <Form<ShopFormValues> form={form} layout="vertical" onFinish={submit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              label="Shop name"
              name="name"
              rules={[{ required: true, message: "Please enter shop name" }]}
            >
              <Input
                placeholder="e.g. Coder Cafe"
                className="h-11 rounded-xl"
                autoFocus
              />
            </Form.Item>
            <Form.Item label="Shop number" style={{ width: "100%" }}>
              <Space.Compact className="w-full">
                <Button disabled className="rounded-l-md! h-11!">
                  <span className="text-xl">🇳🇵</span>
                </Button>
                <Form.Item
                  name="phone"
                  noStyle
                  rules={[
                    { required: true, message: "Please enter phone number" },
                  ]}
                >
                  <Input
                    prefix=" +977"
                    placeholder="98xxxxxxxx"
                    className="h-11 rounded-r-xl!"
                  />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
          </div>
          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: "Please enter shop address" }]}
          >
            <Input
              prefix={<MapPin className="size-4 text-muted-foreground" />}
              placeholder="Street, city"
              className="h-11 rounded-xl"
            />
          </Form.Item>

          <Form.Item className="mb-0! mt-2">
            <Button
              htmlType="submit"
              type="primary"
              loading={createShop.isPending}
              size="large"
              block
              className="rounded-xl"
            >
              <Plus className="size-4" /> Add shop
            </Button>
          </Form.Item>
        </Form>
      </Panel>
    </div>
  );
}
