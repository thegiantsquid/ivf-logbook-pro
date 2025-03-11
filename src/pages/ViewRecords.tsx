
import React, { useState, useMemo } from 'react';
import { useRecords } from '@/hooks/useRecords';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from '@/lib/toast';
import { 
  ColumnDef, 
  flexRender, 
  getCoreRowModel, 
  getPaginationRowModel, 
  getSortedRowModel, 
  PaginationState, 
  SortingState, 
  useReactTable, 
  ColumnFiltersState,
  getFilteredRowModel
} from '@tanstack/react-table';
import { IVFRecord } from '@/types';
import { ChevronDown, Download, Trash, FileEdit, ChevronLeft, ChevronRight, SlidersHorizontal, Database, Calendar } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { generateTestRecords } from '@/utils/generateTestData';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ViewRecords: React.FC = () => {
  const { records, loading, deleteRecord, fetchRecords } = useRecords();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnVisibility, setColumnVisibility] = useState({
    mrn: true,
    date: true,
    age: true,
    procedure: true,
    supervision: true,
    hospital: true,
    complicationNotes: false,
    operationNotes: false,
  });
  const [generatingRecords, setGeneratingRecords] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      await deleteRecord(id);
    }
  };

  const handleGenerateTestData = async () => {
    setGeneratingRecords(true);
    const success = await generateTestRecords(50);
    if (success) {
      fetchRecords();
    }
    setGeneratingRecords(false);
  };

  const columns: ColumnDef<IVFRecord>[] = useMemo(() => [
    {
      accessorKey: 'mrn',
      header: 'MRN',
      cell: ({ row }) => <div>{row.getValue('mrn')}</div>,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <div>{row.getValue('date')}</div>,
    },
    {
      accessorKey: 'age',
      header: 'Age',
      cell: ({ row }) => <div>{row.getValue('age')}</div>,
    },
    {
      accessorKey: 'procedure',
      header: 'Procedure',
      cell: ({ row }) => <div>{row.getValue('procedure')}</div>,
    },
    {
      accessorKey: 'supervision',
      header: 'Supervision',
      cell: ({ row }) => <div>{row.getValue('supervision')}</div>,
    },
    {
      accessorKey: 'hospital',
      header: 'Hospital',
      cell: ({ row }) => <div>{row.getValue('hospital')}</div>,
    },
    {
      accessorKey: 'complicationNotes',
      header: 'Complications',
      cell: ({ row }) => <div className="max-w-[200px] truncate" title={row.getValue('complicationNotes')}>{row.getValue('complicationNotes') || '-'}</div>,
    },
    {
      accessorKey: 'operationNotes',
      header: 'Operation Notes',
      cell: ({ row }) => <div className="max-w-[200px] truncate" title={row.getValue('operationNotes')}>{row.getValue('operationNotes') || '-'}</div>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleDelete(record.id || '')}>
              <Trash className="h-4 w-4 text-red-500" />
            </Button>
            <Button variant="ghost" size="icon">
              <FileEdit className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], [deleteRecord]);

  // Filter records by date range
  const dateFilteredRecords = useMemo(() => {
    if (!fromDate && !toDate) return records;
    
    return records.filter(record => {
      const recordDate = new Date(record.date);
      if (fromDate && toDate) {
        return recordDate >= fromDate && recordDate <= toDate;
      } else if (fromDate) {
        return recordDate >= fromDate;
      } else if (toDate) {
        return recordDate <= toDate;
      }
      return true;
    });
  }, [records, fromDate, toDate]);

  const table = useReactTable({
    data: dateFilteredRecords,
    columns,
    state: {
      sorting,
      pagination,
      columnVisibility,
      columnFilters,
      globalFilter,
    },
    enableColumnFilters: true,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      const visibleColumns = columns.filter(col => {
        if (col.id === 'actions') return false;
        if ('accessorKey' in col) {
          const key = col.accessorKey as string;
          return columnVisibility[key as keyof typeof columnVisibility];
        }
        return false;
      });

      const tableColumn = visibleColumns.map(col => {
        if (typeof col.header === 'string') {
          return col.header;
        } else if ('accessorKey' in col) {
          return col.accessorKey as string;
        }
        return col.id || '';
      });

      // Only export filtered and visible records
      const tableRows = table.getFilteredRowModel().rows.map(row => {
        return visibleColumns.map(col => {
          if ('accessorKey' in col) {
            const key = col.accessorKey as keyof IVFRecord;
            return row.original[key]?.toString() || '';
          }
          return '';
        });
      });

      doc.setFontSize(20);
      doc.text('IVF Procedures Records', 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
      
      // Add date filter information if active
      if (fromDate || toDate) {
        let dateRange = 'Date Range: ';
        if (fromDate) dateRange += `From ${format(fromDate, 'yyyy-MM-dd')} `;
        if (toDate) dateRange += `To ${format(toDate, 'yyyy-MM-dd')}`;
        doc.text(dateRange, 14, 28);
      }

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: fromDate || toDate ? 34 : 30,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 139, 202],
        },
      });

      doc.save('ivf_records.pdf');
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  const clearDateFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Patient Records</h2>
        <p className="text-muted-foreground mt-1">
          View, search, filter and export your IVF procedure records
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Records</CardTitle>
              <CardDescription>
                {loading ? 'Loading records...' : `Showing ${table.getFilteredRowModel().rows.length} of ${records.length} records`}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Search records..."
                value={globalFilter ?? ''}
                onChange={e => setGlobalFilter(e.target.value)}
                className="max-w-sm"
              />
              <div className="flex flex-wrap gap-2">
                <div className="flex gap-2">
                  {/* From Date Picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex gap-2 whitespace-nowrap">
                        <Calendar className="h-4 w-4" />
                        {fromDate ? format(fromDate, "yyyy-MM-dd") : "From Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={fromDate}
                        onSelect={setFromDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>

                  {/* To Date Picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex gap-2 whitespace-nowrap">
                        <Calendar className="h-4 w-4" />
                        {toDate ? format(toDate, "yyyy-MM-dd") : "To Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={toDate}
                        onSelect={setToDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Clear Filters Button */}
                  {(fromDate || toDate) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearDateFilters}
                      className="whitespace-nowrap"
                    >
                      Clear Dates
                    </Button>
                  )}
                </div>

                <Button 
                  onClick={handleGenerateTestData} 
                  variant="outline" 
                  disabled={generatingRecords}
                >
                  <Database className="mr-2 h-4 w-4" />
                  {generatingRecords ? 'Generating...' : 'Generate 50 Test Records'}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {Object.keys(columnVisibility).map((key) => (
                      <DropdownMenuCheckboxItem
                        key={key}
                        className="capitalize"
                        checked={columnVisibility[key as keyof typeof columnVisibility]}
                        onCheckedChange={(value) =>
                          setColumnVisibility({
                            ...columnVisibility,
                            [key]: value,
                          })
                        }
                      >
                        {key === 'mrn' ? 'MRN' : key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={exportToPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : (
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? 'cursor-pointer select-none flex items-center'
                                : '',
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: ' 🔼',
                              desc: ' 🔽',
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      {columns.map((column, colIndex) => (
                        <TableCell key={colIndex}>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-full max-w-[100px]"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
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
                      No records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {!loading && `Page ${table.getState().pagination.pageIndex + 1} of ${table.getPageCount() || 1}`}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || loading}
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewRecords;
