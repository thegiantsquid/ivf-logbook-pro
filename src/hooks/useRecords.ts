
import { useState, useEffect, useMemo } from 'react';
import { IVFRecord, SortConfig, FilterConfig } from '@/types';
import { toast } from '@/lib/toast';
import { useAuth } from '@/context/AuthContext';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import * as XLSX from 'xlsx';

const RECORDS_TABLE = 'ivf_records';

export const useRecords = () => {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<IVFRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [filters, setFilters] = useState<FilterConfig>({});

  // Fetch records
  const fetchRecords = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from(RECORDS_TABLE)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const fetchedRecords: IVFRecord[] = data.map(record => ({
        id: record.id,
        mrn: record.mrn || '',
        date: record.date || '',
        age: record.age || 0,
        procedure: record.procedure || '',
        supervision: record.supervision || '',
        complicationNotes: record.complication_notes || '',
        operationNotes: record.operation_notes || '',
        hospital: record.hospital || '',
        createdAt: record.created_at,
        updatedAt: record.updated_at,
        createdBy: record.created_by,
      }));
      
      setRecords(fetchedRecords);
    } catch (error: any) {
      setError(handleSupabaseError(error));
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (currentUser) {
      fetchRecords();
    }
  }, [currentUser]);

  // Add a new record
  const addRecord = async (record: Omit<IVFRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    if (!currentUser) return null;
    
    try {
      const { data, error } = await supabase
        .from(RECORDS_TABLE)
        .insert([{
          mrn: record.mrn,
          date: record.date,
          age: record.age,
          procedure: record.procedure,
          supervision: record.supervision,
          complication_notes: record.complicationNotes,
          operation_notes: record.operationNotes,
          hospital: record.hospital,
          created_by: currentUser.uid,
        }])
        .select();
      
      if (error) throw error;
      
      toast.success('Record added successfully');
      
      // Refresh records
      fetchRecords();
      
      return data[0].id;
    } catch (error: any) {
      handleSupabaseError(error);
      return null;
    }
  };

  // Update an existing record
  const updateRecord = async (id: string, updates: Partial<IVFRecord>) => {
    if (!currentUser) return false;
    
    try {
      const { error } = await supabase
        .from(RECORDS_TABLE)
        .update({
          mrn: updates.mrn,
          date: updates.date,
          age: updates.age,
          procedure: updates.procedure,
          supervision: updates.supervision,
          complication_notes: updates.complicationNotes,
          operation_notes: updates.operationNotes,
          hospital: updates.hospital,
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Record updated successfully');
      
      // Refresh records
      fetchRecords();
      
      return true;
    } catch (error: any) {
      handleSupabaseError(error);
      return false;
    }
  };

  // Delete a record
  const deleteRecord = async (id: string) => {
    if (!currentUser) return false;
    
    try {
      const { error } = await supabase
        .from(RECORDS_TABLE)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Record deleted successfully');
      
      // Update local state
      setRecords(records.filter(record => record.id !== id));
      
      return true;
    } catch (error: any) {
      handleSupabaseError(error);
      return false;
    }
  };

  // Import records from Excel
  const importFromExcel = async (file: File) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Assume first sheet
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
          
          // Validate and format records
          const formattedRecords = jsonData.map((row) => ({
            mrn: row.mrn?.toString() || '',
            date: row.date || new Date().toISOString().split('T')[0],
            age: parseInt(row.age) || 0,
            procedure: row.procedure || '',
            supervision: row.supervision || '',
            complication_notes: row.complicationNotes || '',
            operation_notes: row.operationNotes || '',
            hospital: row.hospital || '',
            created_by: currentUser.uid,
          }));
          
          // Add all records to Supabase
          const { error } = await supabase
            .from(RECORDS_TABLE)
            .insert(formattedRecords);
          
          if (error) throw error;
          
          toast.success(`Imported ${formattedRecords.length} records successfully`);
          
          // Refresh records
          fetchRecords();
        } catch (error: any) {
          handleSupabaseError(error);
        } finally {
          setLoading(false);
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      handleSupabaseError(error);
      setLoading(false);
    }
  };

  // Sort records
  const sortedRecords = useMemo(() => {
    if (!records.length) return [];
    
    const sorted = [...records].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return sorted;
  }, [records, sortConfig]);
  
  // Filter records
  const filteredRecords = useMemo(() => {
    return sortedRecords.filter(record => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        
        const recordValue = record[key as keyof IVFRecord];
        
        if (typeof value === 'string') {
          return String(recordValue).toLowerCase().includes(value.toLowerCase());
        }
        
        return recordValue === value;
      });
    });
  }, [sortedRecords, filters]);

  return {
    records: filteredRecords,
    loading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    importFromExcel,
    fetchRecords,
    setFilters,
    setSortConfig,
    sortConfig,
    filters,
  };
};
