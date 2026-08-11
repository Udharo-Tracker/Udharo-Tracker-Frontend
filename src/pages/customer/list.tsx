import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { App, Input, Alert, Table, Dropdown, Button, Checkbox } from "antd";
import type { TableColumnsType, MenuProps } from "antd";
import {
  Search,
  UserPlus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Users,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { useDeleteCustomer } from "@/api/customers.api";
import { useLedgerSummary } from "@/api/ledger.api";
import { CustomerAvatar } from "@/components/shared/CustomerAvatar";
import { FilterPopover } from "@/components/shared/FilterPopover";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel } from "@/components/shared/Panel";
import { RiskBadge } from "@/components/shared/RiskBadge";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { useEntityModals } from "@/context/entity-modals-context";
import { npr } from "@/lib/currency";
import { formatDateOnly } from "@/utils/date";

const RISK_OPTIONS: { value: CreditRiskLevel; label: string }[] = [
  { value: "green", label: "Low risk" },
  { value: "yellow", label: "Medium risk" },
  { value: "red", label: "High risk" },
];

export function CustomersList() {
  const { data, isLoading, isError, error } = useLedgerSummary();
  const { openCreateCustomer, openEditCustomer } = useEntityModals();
  const deleteCustomer = useDeleteCustomer();
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchExpanded = searchFocused || q.length > 0;
  const [riskFilter, setRiskFilter] = useState<CreditRiskLevel[]>([]);
  const hasActiveFilters = riskFilter.length > 0;

  const confirmDelete = (id: string, name: string) => {
    modal.confirm({
      title: `Delete ${name}?`,
      content:
        "This cannot be undone and will remove their transaction history.",
      okText: "Delete",
      okType: "danger",
      onOk: () =>
        deleteCustomer.mutate(id, {
          onSuccess: () => message.success("Customer deleted"),
          onError: (err) => message.error(err.message),
        }),
    });
  };

  const customers = useMemo(() => data?.customers_summary ?? [], [data]);
  const highRiskCount = useMemo(
    () => customers.filter((c) => c.risk === "red").length,
    [customers],
  );

  const filtered = useMemo(
    () =>
      customers.filter((c) => {
        const matchesQuery =
          c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q);
        const matchesRisk =
          riskFilter.length === 0 || riskFilter.includes(c.risk);
        return matchesQuery && matchesRisk;
      }),
    [customers, q, riskFilter],
  );

  const columns: TableColumnsType<CustomerBalanceSummary> = [
    {
      title: "Customer",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, c) => (
        <div className="flex items-center gap-3">
          <CustomerAvatar name={name} />
          <div className="min-w-0">
            <div className="font-medium truncate">{name}</div>
            <div className="text-xs text-muted-foreground">{c.phone}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Due Amount",
      dataIndex: "outstanding_balance",
      key: "outstanding_balance",
      sorter: (a, b) => a.outstanding_balance - b.outstanding_balance,
      defaultSortOrder: "descend",
      render: (outstanding_balance: number) => (
        <span className="font-semibold">{npr(outstanding_balance)}</span>
      ),
    },
    {
      title: "Risk",
      dataIndex: "risk",
      key: "risk",
      sorter: (a, b) => a.risk.localeCompare(b.risk),
      render: (risk: CustomerBalanceSummary["risk"]) => (
        <RiskBadge risk={risk} />
      ),
    },
    {
      title: "Last transaction",
      dataIndex: "last_transaction",
      key: "last_transaction",
      sorter: (a, b) =>
        (a.last_transaction ?? "").localeCompare(b.last_transaction ?? ""),
      render: (last_transaction: string | null) => (
        <span className="text-muted-foreground">
          {last_transaction ? formatDateOnly(last_transaction) : "—"}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 56,
      render: (_, c) => {
        const items: MenuProps["items"] = [
          {
            key: "view",
            label: "View",
            icon: <Eye className="size-4" />,
            onClick: () => navigate(`/customers/${c.id}`),
          },
          {
            key: "edit",
            label: "Edit customer",
            icon: <Pencil className="size-4" />,
            onClick: () => openEditCustomer(c.id),
          },
          { type: "divider" },
          {
            key: "delete",
            label: "Delete",
            danger: true,
            icon: <Trash2 className="size-4" />,
            onClick: () => confirmDelete(c.id, c.name),
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
        title="Customers"
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
                  placeholder="Search by name/phone…"
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
            <FilterPopover
              active={hasActiveFilters}
              onClear={() => setRiskFilter([])}
              title="Filter customers"
            >
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Risk level</p>
                <Checkbox.Group
                  className="flex flex-col gap-2"
                  value={riskFilter}
                  onChange={(values) =>
                    setRiskFilter(values as CreditRiskLevel[])
                  }
                  options={RISK_OPTIONS.map((o) => ({
                    label: o.label,
                    value: o.value,
                  }))}
                />
              </div>
            </FilterPopover>
            <Button
              type="primary"
              icon={<UserPlus className="size-4" />}
              onClick={() => openCreateCustomer()}
            >
              Add customer
            </Button>
          </>
        }
      />

      {isError && (
        <Alert
          type="error"
          showIcon
          title="Couldn't load customers"
          description={(error as Error).message}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}
        {!isLoading && (
          <>
            <StatCard
              label="Total customers"
              value={customers.length}
              icon={Users}
              tint="primary"
            />
            <StatCard
              label="Total due"
              value={npr(data?.total_outstanding ?? 0)}
              icon={Wallet}
              tint="warning"
            />
            <StatCard
              label="High risk"
              value={highRiskCount}
              icon={AlertTriangle}
              tint="danger"
            />
          </>
        )}
      </div>

      <Panel padding="none">
        <Table<CustomerBalanceSummary>
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={isLoading}
          size="middle"
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          onRow={(c) => ({
            onClick: () => navigate(`/customers/${c.id}`),
            className: "cursor-pointer",
          })}
          locale={{ emptyText: "No customers match your filters." }}
        />
      </Panel>
    </div>
  );
}
