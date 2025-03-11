
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, SlidersHorizontal, Database, Download } from 'lucide-react';

interface TableFiltersProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  fromDate: Date | undefined;
  setFromDate: (date: Date | undefined) => void;
  toDate: Date | undefined;
  setToDate: (date: Date | undefined) => void;
  clearDateFilters: () => void;
  handleGenerateTestData: () => void;
  exportToPDF: () => void;
  generatingRecords: boolean;
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: (visibility: Record<string, boolean>) => void;
}

const TableFilters: React.FC<TableFiltersProps> = ({ 
  globalFilter, 
  setGlobalFilter, 
  fromDate, 
  setFromDate, 
  toDate, 
  setToDate,
  clearDateFilters,
  handleGenerateTestData,
  exportToPDF,
  generatingRecords,
  columnVisibility,
  setColumnVisibility
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <Input
        placeholder="Search records..."
        value={globalFilter ?? ''}
        onChange={e => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2">
          {/* From Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex gap-2 whitespace-nowrap">
                <CalendarIcon className="h-4 w-4" />
                {fromDate ? format(fromDate, "yyyy-MM-dd") : "From Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={setFromDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          {/* To Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex gap-2 whitespace-nowrap">
                <CalendarIcon className="h-4 w-4" />
                {toDate ? format(toDate, "yyyy-MM-dd") : "To Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={setToDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          {/* Clear Filters Button */}
          {(fromDate || toDate) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearDateFilters}
              className="whitespace-nowrap"
            >
              Clear Dates
            </Button>
          )}
        </div>

        <Button 
          onClick={handleGenerateTestData} 
          variant="outline" 
          disabled={generatingRecords}
        >
          <Database className="mr-2 h-4 w-4" />
          {generatingRecords ? 'Generating...' : 'Generate 50 Test Records'}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.keys(columnVisibility).map((key) => (
              <DropdownMenuCheckboxItem
                key={key}
                className="capitalize"
                checked={columnVisibility[key as keyof typeof columnVisibility]}
                onCheckedChange={(value) =>
                  setColumnVisibility({
                    ...columnVisibility,
                    [key]: value,
                  })
                }
              >
                {key === 'mrn' ? 'MRN' : key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={exportToPDF}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
};

export default TableFilters;
