
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { IVFRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash, FileEdit } from 'lucide-react';

export const useTableColumns = (handleDelete: (id: string) => void) => {
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
  ], [handleDelete]);

  return columns;
};
