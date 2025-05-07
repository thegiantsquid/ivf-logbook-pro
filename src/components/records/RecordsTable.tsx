
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { IVFRecord } from '@/types';
import { 
  ColumnDef, 
  flexRender, 
  Table as TableType
} from '@tanstack/react-table';
import { Filter, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecordsTableProps {
  table: TableType<IVFRecord>;
  columns: ColumnDef<IVFRecord>[];
  loading: boolean;
  handleDelete: (id: string) => void;
  selectedRows: string[];
  toggleRowSelection: (id: string) => void;
}

const RecordsTable: React.FC<RecordsTableProps> = ({ 
  table, 
  columns, 
  loading, 
  handleDelete,
  selectedRows,
  toggleRowSelection
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <React.Fragment key={headerGroup.id}>
              <TableRow>
                <TableHead className="w-[40px] px-2">
                  <span className="sr-only">Select</span>
                </TableHead>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? 'cursor-pointer select-none flex items-center justify-between'
                            : '',
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        {header.column.getCanSort() && (
                          <div className="ml-2">
                            {header.column.getIsSorted() === "asc" ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <div className="opacity-0 hover:opacity-100 transition-opacity">
                                <ChevronUp className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow>
                <TableHead className="p-0">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    title="Toggle filters"
                    onClick={() => {
                      table.getHeaderGroups().forEach(headerGroup => {
                        headerGroup.headers.forEach(header => {
                          if (header.column.getCanFilter()) {
                            const filterValue = header.column.getFilterValue();
                            if (filterValue) {
                              header.column.setFilterValue(undefined);
                            }
                          }
                        });
                      });
                    }}
                  >
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">Clear filters</span>
                  </Button>
                </TableHead>
                {headerGroup.headers.map((header) => (
                  <TableHead key={`filter-${header.id}`} className="p-1">
                    {header.column.getCanFilter() && header.column.columnDef.meta?.filterComponent && (
                      flexRender(
                        header.column.columnDef.meta.filterComponent,
                        { column: header.column }
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </React.Fragment>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            Array(5).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="w-[40px] px-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full max-w-[100px]"></div>
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow 
                key={row.id} 
                className={selectedRows.includes(row.original.id || '') ? 'bg-muted/70' : ''}
              >
                <TableCell className="w-[40px] px-2">
                  <Checkbox 
                    checked={selectedRows.includes(row.original.id || '')}
                    onCheckedChange={() => toggleRowSelection(row.original.id || '')} 
                    aria-label={`Select record ${row.original.mrn}`}
                  />
                </TableCell>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                No records found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecordsTable;
