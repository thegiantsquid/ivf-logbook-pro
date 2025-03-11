
import { useCallback } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { IVFRecord } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from '@/lib/toast';

export const usePDFExport = () => {
  const exportToPDF = useCallback((
    filteredRecords: IVFRecord[], 
    columns: ColumnDef<IVFRecord>[], 
    columnVisibility: Record<string, boolean>,
    fromDate: Date | undefined,
    toDate: Date | undefined
  ) => {
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

      // Only export filtered records
      const tableRows = filteredRecords.map(record => {
        return visibleColumns.map(col => {
          if ('accessorKey' in col) {
            const key = col.accessorKey as keyof IVFRecord;
            return record[key]?.toString() || '';
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
  }, []);

  return { exportToPDF };
};
