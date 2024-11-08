import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/breadcrumbs";
import { Input, Spinner } from "@nextui-org/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import Sidebar from "../Sidebar";
import ax from "@/config/axios";
import { RootState } from "@/types/Reducer";
import { AuditLog } from "@shared-types/Organization";

// AuditLogsTable component
const columnHelper = createColumnHelper<AuditLog>();

const AuditLogsTable: React.FC<{ data: AuditLog[] }> = ({ data }) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);

  const columns = [
    columnHelper.accessor("date", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Timestamp
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      ),
      cell: (info) => new Date(info?.getValue() as Date).toLocaleString(),
    }),
    columnHelper.accessor("action", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Message
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      ),
    }),
    columnHelper.accessor("user", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      ),
    }),
    columnHelper.accessor("type", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Level
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : null}
        </Button>
      ),
      cell: (info) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold
          ${
            info.getValue() === "info"
              ? "bg-blue-100 text-blue-800"
              : info.getValue() === "warning"
              ? "bg-yellow-100 text-yellow-800"
              : info.getValue() === "error"
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {info.getValue()}
        </span>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

// Main AuditLogs component
const AuditLogs: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const { getToken } = useAuth();
  const axios = ax(getToken);
  const org = useSelector((state: RootState) => state.organization);

  useEffect(() => {
    axios
      .get("organizations/settings")
      .then((res) => {
        setAuditLogs(res.data.data.auditLogs);
        setFilteredLogs(res.data.data.auditLogs);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error Fetching Settings");
      })
      .finally(() => setLoading(false));
  }, []);

  const filterInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setFilteredLogs(auditLogs);
    } else {
      setFilteredLogs(
        auditLogs.filter((log) =>
          log.action.toLowerCase().includes(value.toLowerCase())
        )
      );
    }
  };

  return (
    <div>
      <div className="mt-5 ml-5">
        <Breadcrumbs>
          <BreadcrumbItem>{org.name}</BreadcrumbItem>
          <BreadcrumbItem href={"/settings"}>Settings</BreadcrumbItem>
          <BreadcrumbItem href={"/settings/security"}>Security</BreadcrumbItem>
          <BreadcrumbItem href={"/settings/security/audit-logs"}>
            Audit Logs
          </BreadcrumbItem>
        </Breadcrumbs>
      </div>
      <div className="flex p-5 gap-5 items-center h-[94vh]">
        <Sidebar />
        {loading ? (
          <div className="flex justify-center items-center h-screen w-full">
            <Spinner />
          </div>
        ) : (
          <div className="h-[88vh] w-full overflow-y-auto pr-5">
            <div className="flex gap-3 mb-4">
              <Input placeholder="Search Logs" onChange={filterInput} />
            </div>
            {filteredLogs?.length === 0 ? (
              <p className="text-center mt-5">No Logs Found</p>
            ) : (
              <AuditLogsTable data={filteredLogs} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
