
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { IVFRecord } from '@/types';

export const useTableColumns = () => {
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
    }
  ], []);

  return columns;
};
