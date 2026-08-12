import { useEffect, useMemo, useRef, useState } from "react";
import { Form, Input, Button, Alert, App, Space, Skeleton } from "antd";
import { MapPin, Save, Camera, FileText, Hash, Store } from "lucide-react";
import { Panel } from "@/components/shared/Panel";
import { useShops, useCreateShop, useUpdateShop } from "@/api/shops.api";

interface ShopFormValues {
  name: string;
  legal_name?: string;
  tax_number?: string;
  phone: string;
  address: string;
}

export function Shops() {
  const { data: shops, isLoading, isError, error } = useShops();
  const existingShop = shops?.[0];

  return (
    <div className="max-w-3xl space-y-6 pb-24">
      <header>
        <h1 className="text-xl font-semibold">Shop settings</h1>
        <p className="text-sm text-muted-foreground ">
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
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <ShopForm key={existingShop?.id ?? "new"} existing={existingShop} />
        )}
      </Panel>
    </div>
  );
}

function ShopForm({ existing }: { existing?: Shop }) {
  const createShop = useCreateShop();
  const updateShop = useUpdateShop(existing?.id ?? "");
  const saveShop = existing ? updateShop : createShop;

  const { message } = App.useApp();
  const [form] = Form.useForm<ShopFormValues>();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const logoObjectUrl = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : null),
    [logoFile],
  );

  useEffect(() => {
    return () => {
      if (logoObjectUrl) URL.revokeObjectURL(logoObjectUrl);
    };
  }, [logoObjectUrl]);

  // Prefer a freshly picked file's preview; fall back to the shop's saved logo.
  const logoPreview = logoObjectUrl ?? existing?.logo ?? null;

  const pickLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    e.target.value = "";
  };

  const submit = (values: ShopFormValues) => {
    const payload: ShopInput = {
      name: values.name.trim(),
      legal_name: values.legal_name?.trim(),
      tax_number: values.tax_number?.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
    };
    // Only attach the logo when a new file was picked; omitting it leaves
    // the shop's existing logo untouched on update.
    if (logoFile) payload.logo = logoFile;

    saveShop.mutate(payload, {
      onSuccess: () => {
        message.success(existing ? "Shop updated" : "Shop added");
        setLogoFile(null);
        if (!existing) form.resetFields();
      },
      onError: (err) => message.error(err.message),
    });
  };

  return (
    <>
      <div className="flex items-center gap-4 pb-5 mb-6 border-b border-border">
        <div className="relative shrink-0">
          <div className="size-17 rounded-md bg-primary-soft text-primary grid place-items-center text-lg font-semibold overflow-hidden">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Shop logo preview"
                className="size-full object-cover"
              />
            ) : (
              <Store />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 size-6 rounded-full bg-primary text-primary-foreground grid place-items-center border-2 border-surface"
            aria-label="Upload shop logo"
          >
            <Camera className="size-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={pickLogo}
          />
        </div>
        <div>
          <h2 className="font-semibold text-base">Shop Basic Details</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            These details appear on receipts and reminders sent to customers.
          </p>
        </div>
      </div>

      <Form<ShopFormValues>
        form={form}
        layout="vertical"
        onFinish={submit}
        initialValues={{
          name: existing?.name,
          legal_name: existing?.legal_name,
          tax_number: existing?.tax_number,
          phone: existing?.phone,
          address: existing?.address,
        }}
      >
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
          <Form.Item
            label="Legal name"
            name="legal_name"
            tooltip="Registered business name, if different from the shop name"
          >
            <Input
              prefix={<FileText className="size-4 text-muted-foreground" />}
              placeholder="e.g. Coder Cafe Pvt. Ltd."
              className="h-11 rounded-xl"
              maxLength={255}
            />
          </Form.Item>
          <Form.Item label="Tax / PAN number" name="tax_number">
            <Input
              prefix={<Hash className="size-4 text-muted-foreground" />}
              placeholder="e.g. 123456789"
              className="h-11 rounded-xl"
              maxLength={20}
            />
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

        <Form.Item className="mb-0! mt-2 flex justify-end">
          <Button htmlType="submit" type="primary" loading={saveShop.isPending}>
            <Save className="size-4" /> Save changes
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
