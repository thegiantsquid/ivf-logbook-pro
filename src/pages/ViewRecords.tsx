
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateTestRecords } from '@/utils/generateTestData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColumnFiltersState, SortingState, PaginationState, getSortedRowModel, getFilteredRowModel, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Trash, FileEdit } from 'lucide-react';
import { toast } from '@/lib/toast';

// Custom hooks and components
import { useRecordsData } from '@/components/records/useRecordsData';
import { useTableColumns } from '@/components/records/useTableColumns';
import { usePDFExport } from '@/components/records/usePDFExport';
import RecordsTable from '@/components/records/RecordsTable';
import TableActions from '@/components/records/TableActions';
import TableFilters from '@/components/records/TableFilters';

const ViewRecords: React.FC = () => {
  const navigate = useNavigate();
  // State for table configuration
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });
  const [columnVisibility, setColumnVisibility] = useState({
    mrn: true,
    date: true,
    age: true,
    procedure: true,
    supervision: true,
    hospital: true,
    complicationNotes: false,
    operationNotes: false
  });
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showIntroPage, setShowIntroPage] = useState(false);
  const [includeProcedureSummary, setIncludeProcedureSummary] = useState(false);
  const [introText, setIntroText] = useState(`I, ............................................................, hereby do solemnly declare that
all information contained in this logbook is a true and accurate record of my professional
experience from ............................. to ............................. representing the period of my
tenure as ........................................................... at ...........................................................

Signature:............................................................................................
Name:.................................................................................................
ID No: ..................................................................................................

Date: ..........................................................................................................
Reporting Doctor / Medical Director: .................................................................

Signature: ..................................................................................................`);

  // Custom hooks for data management
  const {
    dateFilteredRecords,
    loading,
    fetchRecords,
    handleDelete,
    handleBatchDelete,
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
  const columns = useTableColumns();
  const {
    exportToPDF
  } = usePDFExport();

  // Handle row selection
  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Clear selection when data changes
  useEffect(() => {
    setSelectedRows([]);
  }, [dateFilteredRecords]);

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
    // Get the currently sorted and filtered rows in their current order
    const sortedFilteredRows = table.getRowModel().rows.map(row => row.original);
    
    exportToPDF(
      sortedFilteredRows, 
      columns, 
      columnVisibility, 
      fromDate, 
      toDate,
      showIntroPage,
      introText,
      includeProcedureSummary
    );
  };

  // Handle editing a record
  const handleEdit = () => {
    if (selectedRows.length !== 1) {
      toast.error('Please select exactly one record to edit');
      return;
    }

    // Navigate to edit page with the selected record ID
    navigate(`/records/edit/${selectedRows[0]}`);
  };

  // Handle deleting multiple records
  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one record to delete');
      return;
    }
    
    // Use the new batch delete method that handles confirmation
    const success = await handleBatchDelete(selectedRows);
    if (success) {
      toast.success(`${selectedRows.length} record(s) deleted successfully`);
      setSelectedRows([]);
    }
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
      globalFilter
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
    getPaginationRowModel: getPaginationRowModel()
  });

  return <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Patient Records</h2>
        <p className="text-muted-foreground mt-1">View, search, filter and export your procedure records</p>
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
              showIntroPage={showIntroPage}
              setShowIntroPage={setShowIntroPage}
              introText={introText}
              setIntroText={setIntroText}
              includeProcedureSummary={includeProcedureSummary}
              setIncludeProcedureSummary={setIncludeProcedureSummary}
            />
          </div>

          {/* Row action buttons */}
          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={handleEdit} disabled={selectedRows.length !== 1 || loading} className="transition-all duration-300 ease-in-out">
              <FileEdit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeleteSelected} disabled={selectedRows.length === 0 || loading} className="text-red-500 hover:text-red-700 transition-all duration-300 ease-in-out">
              <Trash className="h-4 w-4 mr-2" />
              Delete {selectedRows.length > 0 && `(${selectedRows.length})`}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <RecordsTable table={table} columns={columns} loading={loading} handleDelete={handleDelete} selectedRows={selectedRows} toggleRowSelection={toggleRowSelection} />
          <TableActions table={table} loading={loading} />
        </CardContent>
      </Card>
    </div>;
};

export default ViewRecords;
