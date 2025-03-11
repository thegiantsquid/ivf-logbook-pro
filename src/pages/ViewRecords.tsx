
import React, { useState } from 'react';
import { generateTestRecords } from '@/utils/generateTestData';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  ColumnFiltersState,
  SortingState, 
  PaginationState, 
  getSortedRowModel, 
  getFilteredRowModel,
  getCoreRowModel, 
  getPaginationRowModel, 
  useReactTable
} from '@tanstack/react-table';

// Custom hooks and components
import { useRecordsData } from '@/components/records/useRecordsData';
import { useTableColumns } from '@/components/records/useTableColumns';
import { usePDFExport } from '@/components/records/usePDFExport';
import RecordsTable from '@/components/records/RecordsTable';
import TableActions from '@/components/records/TableActions';
import TableFilters from '@/components/records/TableFilters';

const ViewRecords: React.FC = () => {
  // State for table configuration
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
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

  // Custom hooks for data management
  const { 
    dateFilteredRecords, 
    loading, 
    fetchRecords, 
    handleDelete,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    clearDateFilters,
    generatingRecords,
    setGeneratingRecords,
    globalFilter,
    setGlobalFilter
  } = useRecordsData();
  
  const columns = useTableColumns(handleDelete);
  const { exportToPDF } = usePDFExport();

  // Handle test data generation
  const handleGenerateTestData = async () => {
    setGeneratingRecords(true);
    const success = await generateTestRecords(50);
    if (success) {
      fetchRecords();
    }
    setGeneratingRecords(false);
  };

  // Handle PDF export
  const handleExportToPDF = () => {
    exportToPDF(
      table.getFilteredRowModel().rows.map(row => row.original),
      columns,
      columnVisibility,
      fromDate,
      toDate
    );
  };

  // Set up the table
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
                {loading ? 'Loading records...' : `Showing ${table.getFilteredRowModel().rows.length} of ${dateFilteredRecords.length} records`}
              </CardDescription>
            </div>
            <TableFilters 
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
              clearDateFilters={clearDateFilters}
              handleGenerateTestData={handleGenerateTestData}
              exportToPDF={handleExportToPDF}
              generatingRecords={generatingRecords}
              columnVisibility={columnVisibility}
              setColumnVisibility={setColumnVisibility}
            />
          </div>
        </CardHeader>
        <CardContent>
          <RecordsTable 
            table={table} 
            columns={columns} 
            loading={loading} 
            handleDelete={handleDelete} 
          />
          <TableActions table={table} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewRecords;
