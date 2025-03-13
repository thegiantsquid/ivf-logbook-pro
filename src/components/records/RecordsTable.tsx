
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
            <TableRow key={headerGroup.id}>
              <TableHead className="w-[40px] px-2">
                <span className="sr-only">Select</span>
              </TableHead>
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
