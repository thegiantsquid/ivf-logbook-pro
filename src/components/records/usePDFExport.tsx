
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
    introText: string = '',
    includeProcedureSummary: boolean = false
  ) => {
    try {
      const doc = new jsPDF();
      let currentPage = 1;
      
      // Add intro page if requested
      if (showIntroPage && introText) {
        // Set title for intro page
        doc.setFontSize(18);
        doc.text('IVF LOGBOOK DECLARATION', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
        
        // Draw a line under the title
        doc.setLineWidth(0.5);
        doc.line(40, 35, doc.internal.pageSize.getWidth() - 40, 35);
        
        // Setup styling for the intro text
        doc.setFontSize(12);
        
        // Format the intro text with better spacing and alignment
        const textLines = doc.splitTextToSize(introText, 170);
        
        // Position the text in the center of the page with some margin from the top
        doc.text(textLines, 20, 50);
        
        // Add additional formatting like lines for signature spaces
        doc.setLineWidth(0.3);
        
        // Draw signature/date lines in appropriate spots
        const signatureLinePositions = introText.split('\n').reduce((positions, line, index) => {
          if (line.includes('Signature:')) positions.push(index);
          if (line.includes('Date:')) positions.push(index);
          if (line.includes('ID No:')) positions.push(index);
          return positions;
        }, [] as number[]);
        
        // Draw signature lines where appropriate
        signatureLinePositions.forEach(pos => {
          const yPos = 50 + (pos * 6); // Adjust spacing based on font size
          doc.line(70, yPos + 4, 170, yPos + 4);
        });
        
        // Add page number to intro page
        doc.setFontSize(10);
        doc.text(`Page ${currentPage}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
        
        // Add a new page for the actual data
        doc.addPage();
        currentPage++;
      }
      
      // Generate procedure summary if requested
      if (includeProcedureSummary && filteredRecords.length > 0) {
        doc.setFontSize(18);
        doc.text('PROCEDURE SUMMARY', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
        
        // Create procedure count summary
        const procedureCounts: Record<string, number> = {};
        const hospitalCounts: Record<string, number> = {};
        
        filteredRecords.forEach(record => {
          // Count procedures
          if (record.procedure) {
            procedureCounts[record.procedure] = (procedureCounts[record.procedure] || 0) + 1;
          }
          
          // Count hospitals
          if (record.hospital) {
            hospitalCounts[record.hospital] = (hospitalCounts[record.hospital] || 0) + 1;
          }
        });
        
        // Create summary tables
        // Procedure summary table
        doc.setFontSize(14);
        doc.text('Procedures Performed', 20, 35);
        
        const procedureData = Object.entries(procedureCounts).map(([procedure, count]) => [procedure, count.toString()]);
        
        autoTable(doc, {
          head: [['Procedure Type', 'Count']],
          body: procedureData,
          startY: 40,
          margin: { left: 20 },
          headStyles: {
            fillColor: [66, 139, 202],
            textColor: [255, 255, 255]
          },
          styles: {
            fontSize: 10,
            cellPadding: 3
          },
        });
        
        // Hospital summary table
        const hospitalTableY = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.text('Hospital Distribution', 20, hospitalTableY);
        
        const hospitalData = Object.entries(hospitalCounts).map(([hospital, count]) => [hospital, count.toString()]);
        
        autoTable(doc, {
          head: [['Hospital', 'Count']],
          body: hospitalData,
          startY: hospitalTableY + 5,
          margin: { left: 20 },
          headStyles: {
            fillColor: [66, 139, 202],
            textColor: [255, 255, 255]
          },
          styles: {
            fontSize: 10,
            cellPadding: 3
          },
        });
        
        // Total procedures
        const totalProcedures = filteredRecords.length;
        doc.setFontSize(12);
        doc.text(`Total procedures in this period: ${totalProcedures}`, 20, (doc as any).lastAutoTable.finalY + 15);
        
        // Add page number
        doc.setFontSize(10);
        doc.text(`Page ${currentPage}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
        
        // Add new page for the detailed records
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
        if (fromDate) dateRange += `From ${format(fromDate, "yyyy-MM-dd")} `;
        if (toDate) dateRange += `To ${format(toDate, "yyyy-MM-dd")}`;
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
          doc.text(`Page ${data.pageNumber + currentPage - 1}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
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
