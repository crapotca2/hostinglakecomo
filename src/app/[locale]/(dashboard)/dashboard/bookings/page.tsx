"use client";

import { useState, useMemo } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Users, Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useBookings } from "@/hooks/use-bookings";
import { useProperties } from "@/hooks/use-properties";
import { flagEmoji, countryName } from "@/lib/countries";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  checked_in: "bg-blue-50 text-blue-700",
  checked_out: "bg-gray-100 text-gray-600",
  pending: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-600",
};

const SOURCE_COLORS: Record<string, string> = {
  airbnb: "text-[#FF5A5F]",
  booking: "text-[#003580]",
  vrbo: "text-[#3B5998]",
  direct: "text-primary",
  other: "text-muted-foreground",
};

type StatusKey = "confirmed" | "checked_in" | "checked_out" | "pending" | "cancelled";
type SourceKey = "airbnb" | "booking" | "vrbo" | "direct" | "other";

function formatEuro(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : locale === "ru" ? "ru-RU" : "it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-GB" : locale === "ru" ? "ru-RU" : "it-IT", {
    day: "numeric",
    month: "short",
  });
}

type BookingRow = {
  _id: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  nationality?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  source: string;
  amount: number; // notti + notte diretta (ricavi alloggio, senza pulizia)
  cleaning: number; // pulizia, mostrata separata
  status: string;
};

export default function BookingsPage() {
  const t = useTranslations("dashboard.bookings");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "checkIn", desc: true },
  ]);

  const { data: bookings, isLoading } = useBookings({
    status: statusFilter || undefined,
  });
  const { data: properties } = useProperties();

  const propertyMap = useMemo(
    () => new Map((properties || []).map((p) => [p._id, p.name])),
    [properties]
  );

  const rows: BookingRow[] = useMemo(() => {
    return (bookings || [])
      .filter((b) => {
        if (sourceFilter && b.source !== sourceFilter) return false;
        if (search) {
          const term = search.toLowerCase();
          const propertyName = propertyMap.get(b.propertyId) || "";
          return (
            b.guestInfo.name.toLowerCase().includes(term) ||
            propertyName.toLowerCase().includes(term)
          );
        }
        return true;
      })
      .map((b) => ({
        _id: b._id,
        propertyId: b.propertyId,
        propertyName: propertyMap.get(b.propertyId) || "—",
        guestName: b.guestInfo.name,
        nationality: b.guestInfo.nationality,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        nights: b.nights,
        guests: b.guests,
        source: b.source,
        // Importo = ricavi delle notti (alloggio + eventuale notte diretta), su cui
        // Host Como calcola il suo 15%. La pulizia è mostrata a parte.
        amount:
          (b.pricing.roomRevenue ?? Math.max(0, (b.pricing.totalAmount || 0) - (b.pricing.cleaningFee || 0))) +
          (b.pricing.extraNight || 0),
        cleaning: b.pricing.cleaningFee || 0,
        status: b.status,
      }));
  }, [bookings, propertyMap, search, sourceFilter]);

  const columns = useMemo<ColumnDef<BookingRow>[]>(
    () => [
      {
        accessorKey: "guestName",
        header: t("headers.guest"),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/[0.08] flex items-center justify-center shrink-0">
              <Users className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-medium">
              {flagEmoji(row.original.nationality) && (
                <span className="mr-1" title={countryName(row.original.nationality)}>
                  {flagEmoji(row.original.nationality)}
                </span>
              )}
              {row.original.guestName}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "propertyName",
        header: t("headers.property"),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.propertyName}
          </span>
        ),
      },
      {
        accessorKey: "checkIn",
        header: t("headers.dates"),
        cell: ({ row }) => (
          <span className="text-sm whitespace-nowrap">
            {formatDate(row.original.checkIn, locale)} →{" "}
            {formatDate(row.original.checkOut, locale)}
          </span>
        ),
        sortingFn: "datetime",
      },
      {
        accessorKey: "nights",
        header: t("headers.nights"),
        cell: ({ row }) => (
          <span className="text-sm text-center block">{row.original.nights}</span>
        ),
      },
      {
        accessorKey: "guests",
        header: t("headers.guests"),
        cell: ({ row }) => (
          <span className="text-sm text-center block tabular-nums">{row.original.guests}</span>
        ),
      },
      {
        accessorKey: "source",
        header: t("headers.source"),
        cell: ({ row }) => {
          const sourceKey = (
            ["airbnb", "booking", "vrbo", "direct", "other"].includes(row.original.source)
              ? row.original.source
              : "other"
          ) as SourceKey;
          return (
            <span
              className={`text-sm font-medium ${SOURCE_COLORS[row.original.source] || SOURCE_COLORS.other}`}
            >
              {t(`source.${sourceKey}`)}
            </span>
          );
        },
      },
      {
        accessorKey: "amount",
        header: t("headers.amount"),
        cell: ({ row }) => (
          <div className="text-center">
            <div className="text-sm font-semibold tabular-nums">
              {formatEuro(row.original.amount, locale)}
            </div>
            {row.original.cleaning > 0 && (
              <div className="text-[11px] text-muted-foreground tabular-nums">
                + {formatEuro(row.original.cleaning, locale)} {t("cleaning")}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: t("headers.status"),
        cell: ({ row }) => {
          const statusKey = (
            ["confirmed", "checked_in", "checked_out", "pending", "cancelled"].includes(row.original.status)
              ? row.original.status
              : "pending"
          ) as StatusKey;
          return (
            <span
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[row.original.status]}`}
            >
              {t(`status.${statusKey}`)}
            </span>
          );
        },
        enableSorting: false,
      },
    ],
    [t, locale]
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">{t("title")}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isLoading ? t("subtitleLoading") : t("subtitleCount", { count: rows.length })}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-border/50 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="text-sm bg-transparent border-none outline-none flex-1"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border/50 px-3 py-2 text-sm bg-white"
        >
          <option value="">{t("filters.allStatuses")}</option>
          <option value="confirmed">{t("status.confirmed")}</option>
          <option value="checked_in">{t("status.checked_in")}</option>
          <option value="pending">{t("status.pending")}</option>
          <option value="checked_out">{t("status.checked_out")}</option>
          <option value="cancelled">{t("status.cancelled")}</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-lg border border-border/50 px-3 py-2 text-sm bg-white"
        >
          <option value="">{t("filters.allSources")}</option>
          <option value="airbnb">{t("source.airbnb")}</option>
          <option value="booking">{t("source.booking")}</option>
          <option value="vrbo">{t("source.vrbo")}</option>
          <option value="direct">{t("source.direct")}</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {t("loading")}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {t("empty")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-border/40">
                    {hg.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      const sortDir = header.column.getIsSorted();
                      return (
                        <th
                          key={header.id}
                          className="text-left text-xs font-semibold text-muted-foreground px-4 py-3.5 first:pl-6 last:pr-6"
                        >
                          {canSort ? (
                            <button
                              type="button"
                              onClick={header.column.getToggleSortingHandler()}
                              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {sortDir === "asc" ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : sortDir === "desc" ? (
                                <ArrowDown className="h-3 w-3" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 opacity-50" />
                              )}
                            </button>
                          ) : (
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border/30">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/20 transition-colors cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-4 first:pl-6 last:pr-6"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
