
import { useState, useMemo } from 'react';
import { useRecords } from '@/hooks/useRecords';
import { IVFRecord } from '@/types';

export const useRecordsData = () => {
  const { records, loading, deleteRecord, fetchRecords } = useRecords();
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [generatingRecords, setGeneratingRecords] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<string>('');

  // Filter records by date range
  const dateFilteredRecords = useMemo(() => {
    if (!fromDate && !toDate) return records;
    
    return records.filter(record => {
      const recordDate = new Date(record.date);
      if (fromDate && toDate) {
        return recordDate >= fromDate && recordDate <= toDate;
      } else if (fromDate) {
        return recordDate >= fromDate;
      } else if (toDate) {
        return recordDate <= toDate;
      }
      return true;
    });
  }, [records, fromDate, toDate]);

  const clearDateFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
  };

  const handleDelete = async (id: string, showConfirmation = true) => {
    // Skip confirmation if showConfirmation is false (for batch deletes)
    if (!showConfirmation || window.confirm('Are you sure you want to delete this record?')) {
      await deleteRecord(id);
    }
  };

  return { 
    dateFilteredRecords, 
    loading, 
    fetchRecords, 
    handleDelete,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    clearDateFilters,
    generatingRecords,
    setGeneratingRecords,
    globalFilter,
    setGlobalFilter
  };
};
