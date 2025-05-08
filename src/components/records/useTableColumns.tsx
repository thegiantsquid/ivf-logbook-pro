
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRecords } from '@/hooks/useRecords';

// Export the combined types so they can be used elsewhere in the app
export const useAvailableTypes = () => {
  // Access custom procedure and hospital types for the select filters
  const { customProcedureTypes, customHospitalTypes } = useRecords();
  
  // Add state for uniquely available procedure and hospital types from all records
  const [allProcedureTypes, setAllProcedureTypes] = useState<string[]>([]);
  const [allHospitalTypes, setAllHospitalTypes] = useState<string[]>([]);

  // Fetch unique procedure and hospital types from all records
  useEffect(() => {
    const fetchUniqueTypes = async () => {
      try {
        // Fetch unique procedure types from records
        const { data: procedureData, error: procedureError } = await supabase
          .from('ivf_records')
          .select('procedure')
          .not('procedure', 'is', null);
        
        if (procedureError) throw procedureError;
        
        // Fetch unique hospital types from records
        const { data: hospitalData, error: hospitalError } = await supabase
          .from('ivf_records')
          .select('hospital')
          .not('hospital', 'is', null);
        
        if (hospitalError) throw hospitalError;
        
        // Extract unique procedure types
        const uniqueProcedures = [...new Set(
          procedureData
            .map(record => record.procedure)
            .filter(Boolean)
        )];
        
        // Extract unique hospital types
        const uniqueHospitals = [...new Set(
          hospitalData
            .map(record => record.hospital)
            .filter(Boolean)
        )];
        
        // Update state with unique types
        setAllProcedureTypes(uniqueProcedures);
        setAllHospitalTypes(uniqueHospitals);
      } catch (error) {
        console.error('Error fetching unique types:', error);
      }
    };
    
    fetchUniqueTypes();
  }, []);
  
  // Combine custom types with unique types from records, removing duplicates
  const combinedProcedureTypes = useMemo(() => {
    const combined = [...new Set([...customProcedureTypes, ...allProcedureTypes])];
    return combined.sort();
  }, [customProcedureTypes, allProcedureTypes]);
  
  const combinedHospitalTypes = useMemo(() => {
    const combined = [...new Set([...customHospitalTypes, ...allHospitalTypes])];
    return combined.sort();
  }, [customHospitalTypes, allHospitalTypes]);

  return {
    combinedProcedureTypes,
    combinedHospitalTypes
  };
};

// Add the missing useTableColumns export that ViewRecords.tsx is importing
export const useTableColumns = () => {
  // Implementation of useTableColumns
  // This is where we would add the column definitions
  // For now, return an empty array as a placeholder
  return [];
};
