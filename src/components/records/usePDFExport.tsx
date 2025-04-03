
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
        
        // Split the intro text into paragraphs based on double newlines
        const paragraphs = introText.split('\n\n');
        let yPosition = 50;
        
        // Process each paragraph
        paragraphs.forEach(paragraph => {
          // Split paragraph into lines for better formatting
          const lines = paragraph.split('\n');
          
          lines.forEach(line => {
            // Check if this is a signature line
            if (line.includes('Signature:') || line.includes('Name:') || 
                line.includes('ID No:') || line.includes('Date:')) {
              
              // Split at the colon
              const [label, value] = line.split(':');
              
              // Draw the label
              doc.setFont('helvetica', 'bold');
              doc.text(label + ':', 20, yPosition);
              
              // Draw the signature line
              doc.setFont('helvetica', 'normal');
              doc.setLineWidth(0.2);
              doc.line(60, yPosition, 180, yPosition);
              
              yPosition += 10;
            } 
            // Check if this is a date range line
            else if (line.includes('from') && line.includes('to')) {
              const formattedLines = doc.splitTextToSize(line, 170);
              doc.text(formattedLines, 20, yPosition);
              
              // Find the position of "from" and "to" and add underlines
              const fromIndex = line.indexOf('from');
              const toIndex = line.indexOf('to');
              
              if (fromIndex > -1) {
                doc.setLineWidth(0.2);
                doc.line(20 + doc.getTextWidth(line.substring(0, fromIndex + 5)), 
                         yPosition, 
                         20 + doc.getTextWidth(line.substring(0, fromIndex + 25)), 
                         yPosition);
              }
              
              if (toIndex > -1) {
                doc.setLineWidth(0.2);
                doc.line(20 + doc.getTextWidth(line.substring(0, toIndex + 3)), 
                         yPosition, 
                         20 + doc.getTextWidth(line.substring(0, toIndex + 23)), 
                         yPosition);
              }
              
              yPosition += 10;
            }
            // Regular text line
            else {
              const formattedLines = doc.splitTextToSize(line, 170);
              doc.text(formattedLines, 20, yPosition);
              yPosition += 6 * formattedLines.length;
            }
          });
          
          // Add extra space between paragraphs
          yPosition += 5;
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
