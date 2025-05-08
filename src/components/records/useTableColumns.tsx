
import { useMemo, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { IVFRecord } from '@/types';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useRecords } from '@/hooks/useRecords';
import { supabase } from '@/lib/supabase';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Define a proper type for our column metadata
interface ColumnMetaType {
  filterComponent?: React.FC<{
    column: any;
  }>;
}

export const useTableColumns = () => {
  // Access custom procedure and hospital types for the select filters
  const { customProcedureTypes, customHospitalTypes } = useRecords();
  
  // Add state for uniquely available procedure and hospital types from all records
  const [allProcedureTypes, setAllProcedureTypes] = useState<string[]>([]);
  const [allHospitalTypes, setAllHospitalTypes] = useState<string[]>([]);
  
  // Pre-defined supervision levels
  const supervisionLevels = [
    "Supervised",
    "Performed independently",
    "Taught",
    "Assisted"
  ];

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

  const columns: ColumnDef<IVFRecord, any>[] = useMemo(() => [
    {
      accessorKey: 'mrn',
      header: 'MRN',
      cell: ({ row }) => <div>{row.getValue('mrn')}</div>,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <div>{row.getValue('date')}</div>,
    },
    {
      accessorKey: 'age',
      header: 'Age',
      cell: ({ row }) => <div>{row.getValue('age')}</div>,
      filterFn: 'inNumberRange',
      meta: {
        filterComponent: ({ column }: { column: any }) => (
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min"
              className="max-w-[80px] h-8"
              value={(column.getFilterValue() as [number, number])?.[0] ?? ''}
              onChange={(e) => {
                const min = e.target.value ? parseInt(e.target.value) : undefined;
                const max = (column.getFilterValue() as [number, number])?.[1];
                column.setFilterValue(min !== undefined ? [min, max] : [undefined, max]);
              }}
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max"
              className="max-w-[80px] h-8"
              value={(column.getFilterValue() as [number, number])?.[1] ?? ''}
              onChange={(e) => {
                const max = e.target.value ? parseInt(e.target.value) : undefined;
                const min = (column.getFilterValue() as [number, number])?.[0];
                column.setFilterValue(max !== undefined ? [min, max] : [min, undefined]);
              }}
            />
          </div>
        ),
      } as ColumnMetaType,
    },
    {
      accessorKey: 'procedure',
      header: 'Procedure',
      cell: ({ row }) => <div>{row.getValue('procedure')}</div>,
      filterFn: (row, columnId, filterValues) => {
        // If no filters selected or "all" is selected, return true
        if (!filterValues || filterValues.length === 0) {
          return true;
        }
        
        // Get the value from the row
        const value = row.getValue(columnId);
        
        // Check if the value is in the selected filter values
        return filterValues.includes(value);
      },
      meta: {
        filterComponent: ({ column }: { column: any }) => {
          // Get current filter values (or initialize as empty array)
          const selectedValues = column.getFilterValue() as string[] || [];
          
          // Function to toggle a value in the filter
          const toggleValue = (value: string) => {
            const currentValues = column.getFilterValue() as string[] || [];
            
            if (currentValues.includes(value)) {
              // Remove the value if already selected
              column.setFilterValue(
                currentValues.filter(v => v !== value)
              );
            } else {
              // Add the value if not already selected
              column.setFilterValue([...currentValues, value]);
            }
          };
          
          // Function to clear all selections
          const clearSelections = () => {
            column.setFilterValue([]);
          };

          return (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1 min-h-6 mb-1">
                {selectedValues.length > 0 ? (
                  selectedValues.map(value => (
                    <Badge key={value} variant="secondary" className="flex items-center gap-1">
                      {value}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => toggleValue(value)}
                      />
                    </Badge>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground">No filters selected</div>
                )}
              </div>
              
              <div className="max-h-[200px] overflow-y-auto border rounded-md p-1">
                {combinedProcedureTypes.map((procedure) => (
                  <div
                    key={procedure}
                    className="flex items-center px-2 py-1 hover:bg-muted cursor-pointer text-sm"
                    onClick={() => toggleValue(procedure)}
                  >
                    <div className="w-4 h-4 mr-2 flex items-center justify-center">
                      {selectedValues.includes(procedure) && (
                        <Check className="h-3 w-3" />
                      )}
                    </div>
                    {procedure}
                  </div>
                ))}
              </div>
              
              {selectedValues.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelections}
                  className="text-xs h-7 mt-1"
                >
                  Clear all
                </Button>
              )}
            </div>
          );
        },
      } as ColumnMetaType,
    },
    {
      accessorKey: 'supervision',
      header: 'Supervision',
      cell: ({ row }) => <div>{row.getValue('supervision')}</div>,
      filterFn: 'equals',
      meta: {
        filterComponent: ({ column }: { column: any }) => (
          <Select
            value={column.getFilterValue() as string || 'all'}
            onValueChange={(value) => column.setFilterValue(value !== 'all' ? value : undefined)}
          >
            <SelectTrigger className="h-8 w-full">
              <SelectValue placeholder="Filter..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {supervisionLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      } as ColumnMetaType,
    },
    {
      accessorKey: 'hospital',
      header: 'Hospital',
      cell: ({ row }) => <div>{row.getValue('hospital')}</div>,
      filterFn: (row, columnId, filterValues) => {
        // If no filters selected or "all" is selected, return true
        if (!filterValues || filterValues.length === 0) {
          return true;
        }
        
        // Get the value from the row
        const value = row.getValue(columnId);
        
        // Check if the value is in the selected filter values
        return filterValues.includes(value);
      },
      meta: {
        filterComponent: ({ column }: { column: any }) => {
          // Get current filter values (or initialize as empty array)
          const selectedValues = column.getFilterValue() as string[] || [];
          
          // Function to toggle a value in the filter
          const toggleValue = (value: string) => {
            const currentValues = column.getFilterValue() as string[] || [];
            
            if (currentValues.includes(value)) {
              // Remove the value if already selected
              column.setFilterValue(
                currentValues.filter(v => v !== value)
              );
            } else {
              // Add the value if not already selected
              column.setFilterValue([...currentValues, value]);
            }
          };
          
          // Function to clear all selections
          const clearSelections = () => {
            column.setFilterValue([]);
          };

          return (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1 min-h-6 mb-1">
                {selectedValues.length > 0 ? (
                  selectedValues.map(value => (
                    <Badge key={value} variant="secondary" className="flex items-center gap-1">
                      {value}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => toggleValue(value)}
                      />
                    </Badge>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground">No filters selected</div>
                )}
              </div>
              
              <div className="max-h-[200px] overflow-y-auto border rounded-md p-1">
                {combinedHospitalTypes.map((hospital) => (
                  <div
                    key={hospital}
                    className="flex items-center px-2 py-1 hover:bg-muted cursor-pointer text-sm"
                    onClick={() => toggleValue(hospital)}
                  >
                    <div className="w-4 h-4 mr-2 flex items-center justify-center">
                      {selectedValues.includes(hospital) && (
                        <Check className="h-3 w-3" />
                      )}
                    </div>
                    {hospital}
                  </div>
                ))}
              </div>
              
              {selectedValues.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelections}
                  className="text-xs h-7 mt-1"
                >
                  Clear all
                </Button>
              )}
            </div>
          );
        },
      } as ColumnMetaType,
    },
    {
      accessorKey: 'complicationNotes',
      header: 'Complications',
      cell: ({ row }) => <div className="max-w-[200px] truncate" title={row.getValue('complicationNotes')}>{row.getValue('complicationNotes') || '-'}</div>,
    },
    {
      accessorKey: 'operationNotes',
      header: 'Operation Notes',
      cell: ({ row }) => <div className="max-w-[200px] truncate" title={row.getValue('operationNotes')}>{row.getValue('operationNotes') || '-'}</div>,
    }
  ], [combinedProcedureTypes, combinedHospitalTypes]);

  return columns;
};
