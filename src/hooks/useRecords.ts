
import { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy, 
  where, 
  Timestamp, 
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { db, handleFirebaseError } from '@/lib/firebase';
import { IVFRecord, SortConfig, FilterConfig } from '@/types';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import * as XLSX from 'xlsx';

const RECORDS_COLLECTION = 'ivfRecords';

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
      const recordsRef = collection(db, RECORDS_COLLECTION);
      const q = query(recordsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const fetchedRecords: IVFRecord[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedRecords.push({
          id: doc.id,
          ...data,
          date: data.date ? data.date : '', // Handle potential undefined
        } as IVFRecord);
      });
      
      setRecords(fetchedRecords);
    } catch (error: any) {
      setError(handleFirebaseError(error));
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
      const recordWithMeta = {
        ...record,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser.uid,
      };
      
      const docRef = await addDoc(collection(db, RECORDS_COLLECTION), recordWithMeta);
      
      toast.success('Record added successfully');
      
      // Refresh records
      fetchRecords();
      
      return docRef.id;
    } catch (error: any) {
      handleFirebaseError(error);
      return null;
    }
  };

  // Update an existing record
  const updateRecord = async (id: string, updates: Partial<IVFRecord>) => {
    if (!currentUser) return false;
    
    try {
      const recordRef = doc(db, RECORDS_COLLECTION, id);
      
      await updateDoc(recordRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      
      toast.success('Record updated successfully');
      
      // Refresh records
      fetchRecords();
      
      return true;
    } catch (error: any) {
      handleFirebaseError(error);
      return false;
    }
  };

  // Delete a record
  const deleteRecord = async (id: string) => {
    if (!currentUser) return false;
    
    try {
      await deleteDoc(doc(db, RECORDS_COLLECTION, id));
      
      toast.success('Record deleted successfully');
      
      // Update local state
      setRecords(records.filter(record => record.id !== id));
      
      return true;
    } catch (error: any) {
      handleFirebaseError(error);
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
            complicationNotes: row.complicationNotes || '',
            operationNotes: row.operationNotes || '',
            hospital: row.hospital || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: currentUser.uid,
          }));
          
          // Add all records to Firestore
          const batch = [];
          for (const record of formattedRecords) {
            batch.push(addDoc(collection(db, RECORDS_COLLECTION), record));
          }
          
          await Promise.all(batch);
          
          toast.success(`Imported ${formattedRecords.length} records successfully`);
          
          // Refresh records
          fetchRecords();
        } catch (error: any) {
          handleFirebaseError(error);
        } finally {
          setLoading(false);
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      handleFirebaseError(error);
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
