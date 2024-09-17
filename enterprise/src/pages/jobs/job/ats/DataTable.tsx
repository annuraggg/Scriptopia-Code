"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { Tooltip } from "@nextui-org/tooltip";
import { Button, Checkbox, Input } from "@nextui-org/react";
import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import ax from "@/config/axios";
import { toast } from "sonner";

interface DataTableProps<TData> {
  data: TData[];
  postingId: string;
  matchThreshold: number;
}

export function DataTable<TData>({
  data,
  postingId,
  matchThreshold = 0,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pageIndex, setPageIndex] = useState(0);

  interface Candidates {
    _id: string;
    name: string;
    email: string;
    received: string;
    match: string;
    status: string;
  }

  const { getToken } = useAuth();
  const axios = ax(getToken);

  const downloadResume = (_id: string) => {
    axios
      .post("candidates/resume/download", { candidateId: _id, postingId })
      .then((res) => window.open(res.data.data, "_blank"))
      .catch((err) => {
        toast.error(err.response.data.message || "Failed to download resume");
        console.error(err);
      });
  };

  const disqualify = (_id: string) => {
    axios
      .post("candidates/resume/disqualify", {
        candidateId: _id,
        postingId,
      })
      .then(() => {
        toast.success("Candidate disqualified successfully");
      })
      .catch((err) => {
        toast.error(
          err.response.data.message || "Failed to disqualify candidate"
        );
        console.error(err);
      });
  };

  const selectCand = (_id: string) => {
    axios
      .post("candidates/resume/qualify", {
        candidateId: _id,
        postingId,
      })
      .then(() => {
        toast.success("Candidate selected successfully");
      })
      .catch((err) => {
        toast.error(err.response.data.message || "Failed to select candidate");
        console.error(err);
      });
  };

  const disqualifyAllSelected = () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => (row.original as Candidates)._id);
    axios
      .post("candidates/resume/disqualify/bulk", {
        candidateIds: selectedIds,
        postingId,
      })
      .then(() => {
        toast.success("Selected candidates disqualified successfully");
      })
      .catch((err) => {
        toast.error(
          err.response.data.message ||
            "Failed to disqualify selected candidates"
        );
        console.error(err);
      });
  };

  const qualifyAllSelected = () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map((row) => (row.original as Candidates)._id);
    axios
      .post("candidates/resume/qualify/bulk", {
        candidateIds: selectedIds,
        postingId,
      })
      .then(() => {
        toast.success("Selected candidates qualified successfully");
      })
      .catch((err) => {
        toast.error(
          err.response.data.message || "Failed to qualify selected candidates"
        );
        console.error(err);
      });
  };

  const selectAllAboveThreshold = () => {
    table.toggleAllRowsSelected(false);
    table.getFilteredRowModel().rows.forEach((row) => {
      if (parseFloat((row.original as Candidates).match) > matchThreshold) {
        row.toggleSelected(true);
      }
    });
  };

  const columns: ColumnDef<Candidates>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          isSelected={
            (table.getIsAllPageRowsSelected() as boolean) ||
            table.getIsSomePageRowsSelected()
          }
          onValueChange={(value) => table.toggleAllPageRowsSelected(value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          isSelected={row.getIsSelected()}
          onValueChange={(value) => row.toggleSelected(value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="light"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="light"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "received",
      header: ({ column }) => {
        return (
          <Button
            variant="light"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Received On
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "match",
      header: ({ column }) => {
        return (
          <Button
            variant="light"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Match
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="light"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const _id = row.original._id;
        return (
          <div>
            <Tooltip content="Select">
              <Button
                isIconOnly
                variant="flat"
                color="success"
                className="ml-3"
                onClick={() => selectCand(_id)}
              >
                <Check />
              </Button>
            </Tooltip>

            <Tooltip content="Disqualify">
              <Button
                isIconOnly
                variant="flat"
                color="danger"
                className="ml-3"
                onClick={() => disqualify(_id)}
              >
                <X />
              </Button>
            </Tooltip>

            <Tooltip content="Download Resume">
              <Button
                isIconOnly
                variant="flat"
                color="warning"
                className="ml-3"
                onClick={() => downloadResume(_id)}
              >
                <Download />
              </Button>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data, // @ts-expect-error - data is not assignable to type TData[]
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination: { pageSize: 10, pageIndex: pageIndex },
    },
  });

  return (
    <div className="rounded-md">
      <div className="flex items-center gap-5 flex-wrap">
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            onClick={() => setPageIndex(pageIndex - 1)}
            isDisabled={!table.getCanPreviousPage()}
            isIconOnly
          >
            <ChevronLeft />
          </Button>
          <Button
            onClick={() => setPageIndex(pageIndex + 1)}
            isDisabled={!table.getCanNextPage()}
            isIconOnly
          >
            <ChevronRight />
          </Button>
        </div>
        <Input
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button onClick={disqualifyAllSelected} color="danger">
          <UserX className="mr-2 h-4 w-4" />
          Disqualify Selected
        </Button>
        <Button onClick={qualifyAllSelected} color="success">
          <UserCheck className="mr-2 h-4 w-4" />
          Qualify Selected
        </Button>
        <Button onClick={selectAllAboveThreshold} color="primary">
          <Users className="mr-2 h-4 w-4" />
          Select All Above {matchThreshold}%
        </Button>
      </div>
      <Table className="mt-5">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
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
    </div>
  );
}
