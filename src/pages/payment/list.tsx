import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { App, Alert, Table, Dropdown, Input, Button } from "antd";
import type { TableColumnsType, MenuProps } from "antd";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";
import { usePayments, useDeletePayment } from "@/api/payments.api";
import { useEntityModals } from "@/context/entity-modals-context";
import { npr } from "@/lib/currency";
import { formatDate } from "@/utils/date";
import { CustomerAvatar } from "@/components/shared/CustomerAvatar";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel } from "@/components/shared/Panel";
import type { Payment } from "@/types/payment";

export function PaymentsList() {
  const navigate = useNavigate();
  const { data: payments = [], isLoading, isError, error } = usePayments();
  const { message, modal } = App.useApp();
  const { openCreatePayment, openEditPayment } = useEntityModals();
  const deletePayment = useDeletePayment();
  const [q, setQ] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchExpanded = searchFocused || q.length > 0;

  const confirmDelete = (id: string) => {
    modal.confirm({
      title: "Delete this payment?",
      content:
        "This cannot be undone and will affect the customer's outstanding balance.",
      okText: "Delete",
      okType: "danger",
      onOk: () =>
        deletePayment.mutate(id, {
          onSuccess: () => message.success("Payment deleted"),
          onError: (err) => message.error(err.message),
        }),
    });
  };

  const sorted = useMemo(
    () =>
      [...payments].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [payments],
  );
  const filtered = useMemo(
    () =>
      sorted.filter((p) =>
        p.customer.name.toLowerCase().includes(q.toLowerCase()),
      ),
    [sorted, q],
  );

  const columns: TableColumnsType<Payment> = [
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (customer: Payment["customer"]) => (
        <div className="flex items-center gap-3">
          <CustomerAvatar name={customer.name} />
          <span className="font-medium">{customer.name}</span>
        </div>
      ),
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (note: string | undefined, record) =>
        note || formatDate(record.created_at),
      ellipsis: true,
    },
    {
      title: "Amount paid",
      dataIndex: "amount_paid",
      key: "amount_paid",
      align: "right",
      render: (amount: string) => (
        <span className="font-semibold text-success">{npr(amount)}</span>
      ),
      sorter: (a, b) => Number(a.amount_paid) - Number(b.amount_paid),
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => formatDate(date),
      sorter: (a, b) => a.created_at.localeCompare(b.created_at),
    },
    {
      title: "",
      key: "actions",
      width: 56,
      render: (_, record) => {
        const items: MenuProps["items"] = [
          {
            key: "view",
            label: "View",
            icon: <Eye className="size-4" />,
            onClick: () => navigate(`/payments/${record.id}`),
          },
          {
            key: "edit",
            label: "Edit payment",
            icon: <Pencil className="size-4" />,
            onClick: () => openEditPayment(record.id),
          },
          { type: "divider" },
          {
            key: "delete",
            label: "Delete",
            danger: true,
            icon: <Trash2 className="size-4" />,
            onClick: () => confirmDelete(record.id),
          },
        ];
        return (
          <Dropdown
            menu={{
              items,
              onClick: (info) => info.domEvent.stopPropagation(),
            }}
            trigger={["hover", "click"]}
            placement="bottomRight"
          >
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="size-8 rounded-lg hover:bg-muted grid place-items-center text-muted-foreground"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle={`${payments.length} recorded`}
        actions={
          <>
            <div
              className={`relative h-8 shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
                searchExpanded ? "w-50" : "w-8"
              }`}
            >
              {searchExpanded ? (
                <Input
                  autoFocus
                  placeholder="Search by customer…"
                  value={q}
                  prefix={
                    <Search
                      size={15}
                      className="text-muted-foreground shrink-0"
                    />
                  }
                  onChange={(e) => setQ(e.target.value)}
                  onBlur={() => setSearchFocused(false)}
                  className="h-8 w-50 border-none bg-card"
                />
              ) : (
                <Button
                  onClick={() => setSearchFocused(true)}
                  icon={<Search size={15} />}
                />
              )}
            </div>
            <Button
              type="primary"
              icon={<Wallet className="size-4" />}
              onClick={() => openCreatePayment()}
            >
              Record payment
            </Button>
          </>
        }
      />

      {isError && (
        <Alert
          type="error"
          showIcon
          title="Couldn't load payments"
          description={(error as Error).message}
        />
      )}

      <Panel padding="none">
        <Table<Payment>
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          onRow={(record) => ({
            onClick: () => navigate(`/payments/${record.id}`),
            className: "cursor-pointer",
          })}
          locale={{ emptyText: "No payments match your filters." }}
        />
      </Panel>
    </div>
  );
}
