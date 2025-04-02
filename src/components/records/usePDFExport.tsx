
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
    toDate: Date | undefined,
    showIntroPage: boolean = false,
    introText: string = ''
  ) => {
    try {
      const doc = new jsPDF();
      let currentPage = 1;
      
      // Add intro page if requested
      if (showIntroPage && introText) {
        doc.setFontSize(12);
        
        // Split the intro text into lines to fit the page
        const textLines = doc.splitTextToSize(introText, 180);
        doc.text(textLines, 15, 20);
        
        // Add page number to intro page
        doc.setFontSize(10);
        doc.text(`Page ${currentPage}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
        
        // Add a new page for the actual data
        doc.addPage();
        currentPage++;
      }
      
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
        didDrawPage: function(data) {
          // Add page number at the bottom of each page
          doc.setFontSize(10);
          doc.text(`Page ${data.pageNumber}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
        }
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
