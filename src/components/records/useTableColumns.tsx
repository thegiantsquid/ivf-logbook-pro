
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRecords } from '@/hooks/useRecords';
import { ColumnDef } from '@tanstack/react-table';
import { IVFRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

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

// Create the filter component for procedure dropdown
function ProcedureFilter({ column }: { column: any }) {
  const { combinedProcedureTypes } = useAvailableTypes();
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  // Update the filter value when selections change
  useEffect(() => {
    column.setFilterValue(selectedValues.length ? selectedValues : undefined);
  }, [column, selectedValues]);

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed">
            {selectedValues.length > 0 
              ? `${selectedValues.length} selected` 
              : "Filter procedures"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px] max-h-[300px] overflow-auto">
          {selectedValues.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start font-normal text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => setSelectedValues([])}
            >
              Clear all
            </Button>
          )}
          {combinedProcedureTypes.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={selectedValues.includes(option)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedValues([...selectedValues, option]);
                } else {
                  setSelectedValues(selectedValues.filter((value) => value !== option));
                }
              }}
            >
              {option}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {selectedValues.slice(0, 1).map((value) => (
            <Badge 
              key={value}
              variant="outline" 
              className="px-2 py-0"
            >
              {value} {selectedValues.length > 1 && `+${selectedValues.length - 1}`}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Create the filter component for hospital dropdown
function HospitalFilter({ column }: { column: any }) {
  const { combinedHospitalTypes } = useAvailableTypes();
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  useEffect(() => {
    column.setFilterValue(selectedValues.length ? selectedValues : undefined);
  }, [column, selectedValues]);

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed">
            {selectedValues.length > 0 
              ? `${selectedValues.length} selected` 
              : "Filter hospitals"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px] max-h-[300px] overflow-auto">
          {selectedValues.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start font-normal text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => setSelectedValues([])}
            >
              Clear all
            </Button>
          )}
          {combinedHospitalTypes.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={selectedValues.includes(option)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedValues([...selectedValues, option]);
                } else {
                  setSelectedValues(selectedValues.filter((value) => value !== option));
                }
              }}
            >
              {option}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {selectedValues.slice(0, 1).map((value) => (
            <Badge 
              key={value}
              variant="outline" 
              className="px-2 py-0"
            >
              {value} {selectedValues.length > 1 && `+${selectedValues.length - 1}`}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Create a simple text filter component
function TextFilter({ column }: { column: any }) {
  const [value, setValue] = useState('');
  
  useEffect(() => {
    column.setFilterValue(value || undefined);
  }, [column, value]);
  
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={`Filter...`}
      className="h-8 w-full"
    />
  );
}

// Implement the useTableColumns hook
export const useTableColumns = () => {
  // Define the columns for the table
  const columns: ColumnDef<IVFRecord>[] = [
    {
      accessorKey: "mrn",
      header: "MRN",
      cell: ({ row }) => <div className="font-medium">{row.getValue("mrn")}</div>,
      meta: {
        filterComponent: TextFilter
      },
      filterFn: (row, id, value) => {
        return String(row.getValue(id)).toLowerCase().includes(String(value).toLowerCase());
      }
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const dateValue = row.getValue("date") as string;
        if (!dateValue) return null;
        try {
          return format(new Date(dateValue), "dd/MM/yyyy");
        } catch (e) {
          return dateValue;
        }
      },
      sortingFn: "datetime"
    },
    {
      accessorKey: "age",
      header: "Age",
      cell: ({ row }) => row.getValue("age"),
      meta: {
        filterComponent: TextFilter
      },
      filterFn: (row, id, value) => {
        const age = row.getValue(id);
        return String(age).includes(String(value));
      }
    },
    {
      accessorKey: "procedure",
      header: "Procedure",
      cell: ({ row }) => <div>{row.getValue("procedure")}</div>,
      meta: {
        filterComponent: ProcedureFilter
      },
      filterFn: (row, id, filterValue) => {
        const value = row.getValue(id) as string;
        if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) return true;
        return Array.isArray(filterValue) ? filterValue.includes(value) : filterValue === value;
      }
    },
    {
      accessorKey: "supervision",
      header: "Supervision",
      cell: ({ row }) => row.getValue("supervision"),
      meta: {
        filterComponent: TextFilter
      },
      filterFn: (row, id, value) => {
        const supervision = row.getValue(id) as string;
        return supervision?.toLowerCase().includes(String(value).toLowerCase());
      }
    },
    {
      accessorKey: "hospital",
      header: "Hospital",
      cell: ({ row }) => <div>{row.getValue("hospital")}</div>,
      meta: {
        filterComponent: HospitalFilter
      },
      filterFn: (row, id, filterValue) => {
        const value = row.getValue(id) as string;
        if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) return true;
        return Array.isArray(filterValue) ? filterValue.includes(value) : filterValue === value;
      }
    },
    {
      accessorKey: "complicationNotes",
      header: "Complication Notes",
      cell: ({ row }) => {
        const notes = row.getValue("complicationNotes") as string;
        if (!notes || notes.trim() === "") return "-";
        return notes.length > 30 ? `${notes.substring(0, 30)}...` : notes;
      }
    },
    {
      accessorKey: "operationNotes",
      header: "Operation Notes",
      cell: ({ row }) => {
        const notes = row.getValue("operationNotes") as string;
        if (!notes || notes.trim() === "") return "-";
        return notes.length > 30 ? `${notes.substring(0, 30)}...` : notes;
      }
    },
  ];

  return columns;
};
