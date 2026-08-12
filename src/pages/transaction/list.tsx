import { useState } from "react";
import { Alert, DatePicker, Empty, Input, Table, Tabs } from "antd";
import type { TableColumnsType } from "antd";
import type { Dayjs } from "dayjs";
import { Search } from "lucide-react";
import { useTransactions } from "@/api/transactions.api";
import { useEntityModals } from "@/context/entity-modals-context";
import { FilterPopover } from "@/components/shared/FilterPopover";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel } from "@/components/shared/Panel";
import { npr } from "@/lib/currency";
import { formatDate } from "@/utils/date";

const { RangePicker } = DatePicker;
type DateRange = [Dayjs | null, Dayjs | null] | null;

const TABS: { key: string; label: string; type?: TransactionType }[] = [
  { key: "all", label: "All" },
  { key: "udharo", label: "Udharo", type: "udharo" },
  { key: "payment", label: "Payment", type: "payment" },
  { key: "opening", label: "Opening balance", type: "opening" },
];

export function TransactionsList() {
  const { openTransactionDetail } = useEntityModals();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchExpanded = searchFocused || q.length > 0;
  const [dateRange, setDateRange] = useState<DateRange>(null);
  const hasActiveFilters = !!(dateRange && (dateRange[0] || dateRange[1]));

  const activeType = TABS.find((t) => t.key === tab)?.type;
  const transactions = useTransactions(activeType ? { type: activeType } : {});
  const rows = transactions.data ?? [];

  // Rows come back in server order already; just sort newest-first for
  // display and apply the local title/txn# search.
  const sorted = [...rows].sort(
    (a, b) =>
      new Date(b.transaction_date).getTime() -
      new Date(a.transaction_date).getTime(),
  );
  const filtered = sorted.filter((t) => {
    const matchesQuery =
      t.title.toLowerCase().includes(q.toLowerCase()) ||
      t.txn_number.toLowerCase().includes(q.toLowerCase());
    const txnDate = new Date(t.transaction_date);
    const [from, to] = dateRange ?? [null, null];
    const matchesDate =
      (!from || txnDate >= from.startOf("day").toDate()) &&
      (!to || txnDate <= to.endOf("day").toDate());
    return matchesQuery && matchesDate;
  });

  const columns: TableColumnsType<TransactionListItem> = [
    {
      title: "Txn #",
      dataIndex: "txn_number",
      key: "txn_number",
      render: (txnNumber: string) => (
        <span className="text-muted-foreground">{txnNumber}</span>
      ),
    },
    {
      title: "Date",
      dataIndex: "transaction_date",
      key: "date",
      render: (date: string) => (
        <span className="text-muted-foreground">{formatDate(date)}</span>
      ),
      sorter: (a, b) => a.transaction_date.localeCompare(b.transaction_date),
    },
    {
      title: "Detail",
      key: "detail",
      render: (_, t) => (
        <span className="inline-flex items-center gap-2">
          <span
            className={`size-1.5 rounded-full ${
              t.type === "udharo"
                ? "bg-warning"
                : t.type === "payment"
                  ? "bg-success"
                  : "bg-muted-foreground"
            }`}
          />
          {t.title}
        </span>
      ),
    },
    {
      title: "Debit",
      dataIndex: "transaction_debit",
      key: "debit",
      align: "right",
      render: (debit: string) => (Number(debit) > 0 ? npr(debit) : "—"),
    },
    {
      title: "Credit",
      dataIndex: "transaction_credit",
      key: "credit",
      align: "right",
      render: (credit: string) =>
        Number(credit) > 0 ? (
          <span className="text-success">{npr(credit)}</span>
        ) : (
          "—"
        ),
    },
    {
      title: "Balance",
      key: "balance",
      align: "right",
      render: (_, t) => {
        const debit = Number(t.closing_balance_debit) || 0;
        const credit = Number(t.closing_balance_credit) || 0;
        const net = debit - credit;
        return (
          <span className="font-semibold">
            {npr(Math.abs(net))}
            {net < 0 && (
              <span className="ml-1 text-xs font-normal text-success">Cr</span>
            )}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        subtitle={`${rows.length} recorded`}
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
                  placeholder="Search by title or txn #…"
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
                <button
                  type="button"
                  onClick={() => setSearchFocused(true)}
                  className="size-8 rounded-lg border border-border grid place-items-center text-muted-foreground hover:bg-muted"
                  aria-label="Search transactions"
                >
                  <Search size={15} />
                </button>
              )}
            </div>
            <FilterPopover
              active={hasActiveFilters}
              onClear={() => setDateRange(null)}
              title="Filter transactions"
            >
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Transaction date
                </p>
                <RangePicker
                  className="w-full"
                  value={dateRange}
                  onChange={(range) => setDateRange(range)}
                  allowEmpty={[true, true]}
                />
              </div>
            </FilterPopover>
          </>
        }
      />

      {transactions.isError && (
        <Alert
          type="error"
          showIcon
          title="Couldn't load transactions"
          description={
            transactions.error instanceof Error
              ? transactions.error.message
              : "Unknown error"
          }
        />
      )}

      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={TABS.map((t) => ({ key: t.key, label: t.label }))}
      />

      <Panel padding="none">
        <Table<TransactionListItem>
          columns={columns}
          dataSource={filtered}
          loading={transactions.isLoading}
          rowKey="id"
          size="middle"
          scroll={{ x: true }}
          onRow={(record) => ({
            onClick: () => openTransactionDetail(record.id),
            className: "cursor-pointer",
          })}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          locale={{
            emptyText: (
              <Empty
                description={
                  <div>
                    <p className="text-base font-bold text-foreground">
                      No transactions found
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Try a different tab or search term.
                    </p>
                  </div>
                }
              />
            ),
          }}
        />
      </Panel>
    </div>
  );
}
