import { useState } from "react";
import { Card, Input, Button, Alert, Skeleton, App } from "antd";
import { Store, Phone, MapPin, Plus } from "lucide-react";
import { Label } from "@/components/shared/Label";
import { useShops, useCreateShop } from "@/api/shops.api";

export function Shops() {
  const { data: shops, isLoading, isError, error } = useShops();
  const createShop = useCreateShop();
  const { message } = App.useApp();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const valid = name.trim() && phone.trim() && address.trim();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    createShop.mutate(
      { name, phone, address },
      {
        onSuccess: () => {
          message.success("Shop added");
          setName("");
          setPhone("");
          setAddress("");
        },
        onError: (err) => message.error(err.message),
      }
    );
  };

  return (
    <div className="max-w-2xl space-y-6 pb-24">
      <header>
        <h1 className="text-3xl font-bold">Shops</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage the shops linked to your account.</p>
      </header>

      {isError && (
        <Alert type="error" showIcon title="Couldn't load shops" description={(error as Error).message} />
      )}

      <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
        {isLoading && (
          <div className="p-6">
            <Skeleton active paragraph={{ rows: 3 }} />
          </div>
        )}
        {!isLoading && shops && (
          <ul className="divide-y">
            {shops.map((s) => (
              <li key={s.id} className="p-5 flex items-start gap-4">
                <div className="size-11 rounded-2xl bg-primary-soft text-primary grid place-items-center shrink-0">
                  <Store className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium">{s.name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Phone className="size-3.5" /> {s.phone}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <MapPin className="size-3.5" /> {s.address}
                  </div>
                </div>
              </li>
            ))}
            {shops.length === 0 && (
              <li className="p-12 text-center text-muted-foreground text-sm">No shops yet — add one below.</li>
            )}
          </ul>
        )}
      </Card>

      <Card className="p-6 rounded-3xl border-none shadow-sm space-y-4">
        <h2 className="font-semibold">Add a shop</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="mb-2 block">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Shop name" className="h-11 rounded-xl" />
          </div>
          <div>
            <Label className="mb-2 block">Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98xxxxxxxx" className="h-11 rounded-xl" />
          </div>
          <div>
            <Label className="mb-2 block">Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city" className="h-11 rounded-xl" />
          </div>
          <Button
            htmlType="submit"
            type="primary"
            disabled={!valid}
            loading={createShop.isPending}
            size="large"
            block
            className="rounded-xl"
          >
            <Plus className="size-4" /> Add shop
          </Button>
        </form>
      </Card>
    </div>
  );
}
