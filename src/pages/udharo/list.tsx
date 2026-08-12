import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { App, Alert, DatePicker, Table, Dropdown, Input, Button } from "antd";
import type { TableColumnsType, MenuProps } from "antd";
import type { Dayjs } from "dayjs";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import { useUdharoEntries, useDeleteUdharoEntry } from "@/api/udharo.api";
import { useEntityModals } from "@/context/entity-modals-context";
import { npr } from "@/lib/currency";
import { formatDate } from "@/utils/date";
import { CustomerAvatar } from "@/components/shared/CustomerAvatar";
import { FilterPopover } from "@/components/shared/FilterPopover";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel } from "@/components/shared/Panel";
import { StatusTag } from "@/components/shared/StatusTag";

const { RangePicker } = DatePicker;
type DateRange = [Dayjs | null, Dayjs | null] | null;

export function UdharoList() {
  const navigate = useNavigate();
  const { data: entries = [], isLoading, isError, error } = useUdharoEntries();
  const { message, modal } = App.useApp();
  const { openCreateUdharo, openEditUdharo } = useEntityModals();
  const deleteUdharoEntry = useDeleteUdharoEntry();
  const [q, setQ] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchExpanded = searchFocused || q.length > 0;
  const [dateRange, setDateRange] = useState<DateRange>(null);
  const hasActiveFilters = !!(dateRange && (dateRange[0] || dateRange[1]));

  const confirmDelete = (id: string) => {
    modal.confirm({
      title: "Delete this udharo entry?",
      content:
        "This cannot be undone and will affect the customer's outstanding balance.",
      okText: "Delete",
      okType: "danger",
      onOk: () =>
        deleteUdharoEntry.mutate(id, {
          onSuccess: () => message.success("Udharo entry deleted"),
          onError: (err) => message.error(err.message),
        }),
    });
  };

  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [entries],
  );
  const filtered = useMemo(
    () =>
      sorted.filter((e) => {
        const query = q.toLowerCase();
        const matchesQuery =
          !query ||
          e.customer.name.toLowerCase().includes(query) ||
          e.items.some((i) => i.item_name.toLowerCase().includes(query)) ||
          (e.note ?? "").toLowerCase().includes(query);
        const entryDate = new Date(e.created_at);
        const [from, to] = dateRange ?? [null, null];
        const matchesDate =
          (!from || entryDate >= from.startOf("day").toDate()) &&
          (!to || entryDate <= to.endOf("day").toDate());
        return matchesQuery && matchesDate;
      }),
    [sorted, q, dateRange],
  );

  const columns: TableColumnsType<UdharoEntry> = [
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (customer: UdharoEntry["customer"]) => (
        <div className="flex items-center gap-3">
          <CustomerAvatar name={customer.name} />
          <span className="font-medium">{customer.name}</span>
        </div>
      ),
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      ellipsis: true,
      render: (items: UdharoEntry["items"], record) =>
        items.map((i) => i.item_name).join(", ") ||
        record.created_at.slice(0, 10),
    },
    {
      title: "Status",
      dataIndex: "is_settled",
      key: "is_settled",
      filters: [
        { text: "Settled", value: true },
        { text: "Pending", value: false },
      ],
      onFilter: (value, record) => record.is_settled === value,
      render: (isSettled: boolean) => (
        <StatusTag tone={isSettled ? "success" : "warning"}>
          {isSettled ? "Settled" : "Pending"}
        </StatusTag>
      ),
    },
    {
      title: "Total",
      dataIndex: "total_amount",
      key: "total_amount",
      align: "right",
      render: (amount: string) => (
        <span className="font-semibold">{npr(amount)}</span>
      ),
      sorter: (a, b) => Number(a.total_amount) - Number(b.total_amount),
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
            onClick: () => navigate(`/udharo/${record.id}`),
          },
          {
            key: "edit",
            label: "Edit udharo",
            icon: <Pencil className="size-4" />,
            onClick: () => openEditUdharo(record.id),
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
        title="Udharo Entries"
        subtitle={`${entries.length} total · ${entries.filter((e) => !e.is_settled).length} pending`}
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
                  placeholder="Search by customer, item, or note…"
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
              onClear={() => setDateRange(null)}
              title="Filter udharo entries"
            >
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Entry date</p>
                <RangePicker
                  className="w-full"
                  value={dateRange}
                  onChange={(range) => setDateRange(range)}
                  allowEmpty={[true, true]}
                />
              </div>
            </FilterPopover>
            <Button
              type="primary"
              icon={<PlusCircle className="size-4" />}
              onClick={() => openCreateUdharo()}
            >
              Add udharo
            </Button>
          </>
        }
      />

      {isError && (
        <Alert
          type="error"
          showIcon
          title="Couldn't load udharo entries"
          description={(error as Error).message}
        />
      )}

      <Panel padding="none">
        <Table<UdharoEntry>
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={isLoading}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          onRow={(record) => ({
            onClick: () => navigate(`/udharo/${record.id}`),
            className: "cursor-pointer",
          })}
          locale={{ emptyText: "No udharo entries match your filters." }}
        />
      </Panel>
    </div>
  );
}
