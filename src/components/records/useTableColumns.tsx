
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { IVFRecord } from '@/types';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useRecords } from '@/hooks/useRecords';

// Define a proper type for our column metadata
interface ColumnMetaType {
  filterComponent?: React.FC<{
    column: any;
  }>;
}

export const useTableColumns = () => {
  // Access custom procedure and hospital types for the select filters
  const { customProcedureTypes, customHospitalTypes } = useRecords();
  
  // Pre-defined supervision levels
  const supervisionLevels = [
    "Supervised",
    "Performed independently",
    "Taught",
    "Assisted"
  ];

  const columns: ColumnDef<IVFRecord, any>[] = useMemo(() => [
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
      filterFn: 'inNumberRange',
      meta: {
        filterComponent: ({ column }: { column: any }) => (
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min"
              className="max-w-[80px] h-8"
              value={(column.getFilterValue() as [number, number])?.[0] ?? ''}
              onChange={(e) => {
                const min = e.target.value ? parseInt(e.target.value) : undefined;
                const max = (column.getFilterValue() as [number, number])?.[1];
                column.setFilterValue(min !== undefined ? [min, max] : [undefined, max]);
              }}
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max"
              className="max-w-[80px] h-8"
              value={(column.getFilterValue() as [number, number])?.[1] ?? ''}
              onChange={(e) => {
                const max = e.target.value ? parseInt(e.target.value) : undefined;
                const min = (column.getFilterValue() as [number, number])?.[0];
                column.setFilterValue(max !== undefined ? [min, max] : [min, undefined]);
              }}
            />
          </div>
        ),
      } as ColumnMetaType,
    },
    {
      accessorKey: 'procedure',
      header: 'Procedure',
      cell: ({ row }) => <div>{row.getValue('procedure')}</div>,
      filterFn: 'equals',
      meta: {
        filterComponent: ({ column }: { column: any }) => (
          <Select
            value={column.getFilterValue() as string || ''}
            onValueChange={(value) => column.setFilterValue(value !== '' ? value : undefined)}
          >
            <SelectTrigger className="h-8 w-full">
              <SelectValue placeholder="Filter..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {customProcedureTypes.map((procedure) => (
                <SelectItem key={procedure} value={procedure}>
                  {procedure}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      } as ColumnMetaType,
    },
    {
      accessorKey: 'supervision',
      header: 'Supervision',
      cell: ({ row }) => <div>{row.getValue('supervision')}</div>,
      filterFn: 'equals',
      meta: {
        filterComponent: ({ column }: { column: any }) => (
          <Select
            value={column.getFilterValue() as string || ''}
            onValueChange={(value) => column.setFilterValue(value !== '' ? value : undefined)}
          >
            <SelectTrigger className="h-8 w-full">
              <SelectValue placeholder="Filter..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {supervisionLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      } as ColumnMetaType,
    },
    {
      accessorKey: 'hospital',
      header: 'Hospital',
      cell: ({ row }) => <div>{row.getValue('hospital')}</div>,
      filterFn: 'equals',
      meta: {
        filterComponent: ({ column }: { column: any }) => (
          <Select
            value={column.getFilterValue() as string || ''}
            onValueChange={(value) => column.setFilterValue(value !== '' ? value : undefined)}
          >
            <SelectTrigger className="h-8 w-full">
              <SelectValue placeholder="Filter..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {customHospitalTypes.map((hospital) => (
                <SelectItem key={hospital} value={hospital}>
                  {hospital}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      } as ColumnMetaType,
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
    }
  ], [customProcedureTypes, customHospitalTypes]);

  return columns;
};
