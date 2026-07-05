import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, Button, Alert, Skeleton, App } from "antd";
import { ArrowLeft, BellRing, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCustomer } from "@/api/customers.api";
import { useCustomerReminders, useCreateCustomerReminder } from "@/api/reminders.api";
import { npr } from "@/lib/currency";

export function Reminders() {
  const { id = "" } = useParams<{ id: string }>();
  const customer = useCustomer(id);
  const reminders = useCustomerReminders(id);
  const createReminder = useCreateCustomerReminder(id);
  const { message } = App.useApp();

  const [note, setNote] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    createReminder.mutate(
      { note: note || undefined },
      {
        onSuccess: () => {
          message.success("Reminder logged");
          setNote("");
        },
        onError: (error) => message.error(error.message),
      }
    );
  };

  return (
    <div className="max-w-2xl space-y-6 pb-24">
      <Link to={`/customers/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to customer
      </Link>

      <header>
        <h1 className="text-3xl font-bold">Reminders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {customer.data ? `For ${customer.data.name}` : "Overdue balance reminders for this customer."}
        </p>
      </header>

      <Card className="p-6 rounded-3xl border-none shadow-sm space-y-4">
        <h2 className="font-semibold">Log a reminder</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="mb-2 block">Note (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. called, promised to pay Friday…"
              className="rounded-2xl bg-muted/60 border-input min-h-20"
            />
          </div>
          <Button htmlType="submit" type="primary" loading={createReminder.isPending} size="large" block className="rounded-xl">
            <Send className="size-4" /> Log reminder
          </Button>
        </form>
      </Card>

      <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">History</h2>
        </div>
        {reminders.isLoading && (
          <div className="p-6">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        )}
        {reminders.isError && (
          <div className="p-6">
            <Alert type="error" showIcon title="Couldn't load reminders" description={(reminders.error as Error).message} />
          </div>
        )}
        {reminders.data && (
          <ul className="divide-y">
            {reminders.data.map((r) => (
              <li key={r.id} className="p-5 flex items-start gap-4">
                <div className="size-9 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0">
                  <BellRing className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm">{r.note || "Reminder sent"}</div>
                  <div className="text-xs text-muted-foreground mt-1">{r.sent_at.slice(0, 10)}</div>
                </div>
                <div className="text-sm font-semibold shrink-0">{npr(r.outstanding_balance)}</div>
              </li>
            ))}
            {reminders.data.length === 0 && (
              <li className="p-12 text-center text-muted-foreground text-sm">No reminders logged yet.</li>
            )}
          </ul>
        )}
      </Card>
    </div>
  );
}
