
import { useState, useMemo } from 'react';
import { useRecords } from '@/hooks/useRecords';
import { IVFRecord } from '@/types';

export const useRecordsData = () => {
  const { records, loading, deleteRecord, fetchRecords } = useRecords();
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [generatingRecords, setGeneratingRecords] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);

  // Filter records by date range
  const dateFilteredRecords = useMemo(() => {
    if (!fromDate && !toDate) {
      // Filter out any records that are pending deletion
      return records.filter(record => !pendingDeletions.includes(record.id || ''));
    }
    
    return records.filter(record => {
      // Skip records pending deletion
      if (pendingDeletions.includes(record.id || '')) return false;
      
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
  }, [records, fromDate, toDate, pendingDeletions]);

  const clearDateFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
  };

  const handleDelete = async (id: string, showConfirmation = true) => {
    // Skip confirmation if showConfirmation is false (for batch deletes)
    if (!showConfirmation || window.confirm('Are you sure you want to delete this record?')) {
      // Add to pending deletions immediately for UI feedback
      setPendingDeletions(prev => [...prev, id]);
      await deleteRecord(id);
    }
  };

  const handleBatchDelete = async (ids: string[]) => {
    if (window.confirm(`Are you sure you want to delete ${ids.length} record(s)?`)) {
      // Add all to pending deletions immediately
      setPendingDeletions(prev => [...prev, ...ids]);
      
      // Delete all records
      const deletePromises = ids.map(id => deleteRecord(id));
      await Promise.all(deletePromises);
      
      // Clear pending deletions after operation completes
      setPendingDeletions(prev => prev.filter(id => !ids.includes(id)));
      return true;
    }
    return false;
  };

  return { 
    dateFilteredRecords, 
    loading, 
    fetchRecords, 
    handleDelete,
    handleBatchDelete,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    clearDateFilters,
    generatingRecords,
    setGeneratingRecords,
    globalFilter,
    setGlobalFilter,
    pendingDeletions
  };
};
