
import React, { useState, Dispatch, SetStateAction } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, FileSpreadsheet, Download, CalendarIcon, FileUp, Settings, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  setColumnVisibility: Dispatch<SetStateAction<Record<string, boolean>>>;
  showIntroPage?: boolean;
  setShowIntroPage?: (show: boolean) => void;
  introText?: string;
  setIntroText?: (text: string) => void;
  includeProcedureSummary?: boolean;
  setIncludeProcedureSummary?: (include: boolean) => void;
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
  setColumnVisibility,
  showIntroPage = false,
  setShowIntroPage = () => {},
  introText = '',
  setIntroText = () => {},
  includeProcedureSummary = false,
  setIncludeProcedureSummary = () => {}
}) => {
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  
  const hasDateFilter = fromDate || toDate;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-auto mb-2 sm:mb-0">
        <Input
          placeholder="Search records..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-8 w-full sm:w-auto min-w-[200px]"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Date Range Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !fromDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fromDate ? (
                format(fromDate, "PPP")
              ) : (
                <span>From Date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={setFromDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !toDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {toDate ? (
                format(toDate, "PPP")
              ) : (
                <span>To Date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={setToDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {hasDateFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearDateFilters}
            className="px-2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Column Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Columns</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.keys(columnVisibility).map((key) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={columnVisibility[key]}
                onCheckedChange={(value) => {
                  setColumnVisibility((prev) => ({
                    ...prev,
                    [key]: value,
                  }));
                }}
              >
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* PDF Export */}
        <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export PDF Options</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="intro-page">Include intro page</Label>
                <Switch 
                  id="intro-page" 
                  checked={showIntroPage} 
                  onCheckedChange={setShowIntroPage} 
                />
              </div>
              
              {showIntroPage && (
                <div className="space-y-2">
                  <Label htmlFor="intro-text">Intro page text</Label>
                  <Textarea 
                    id="intro-text" 
                    value={introText} 
                    onChange={(e) => setIntroText(e.target.value)} 
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <Label htmlFor="procedure-summary">Include procedure summary</Label>
                <Switch 
                  id="procedure-summary" 
                  checked={includeProcedureSummary} 
                  onCheckedChange={setIncludeProcedureSummary} 
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Adds a summary page with counts of procedures by type and hospital
              </p>
            </div>
            <DialogFooter>
              <Button 
                variant="secondary" 
                onClick={() => setIsPdfDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  exportToPDF();
                  setIsPdfDialogOpen(false);
                }}
              >
                Export PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Test Data Generator */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateTestData}
          disabled={generatingRecords}
        >
          {generatingRecords ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span className="hidden sm:inline">Generating...</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Generate Test Data</span>
            </>
          )}
        </Button>

        {/* File Import */}
        <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <FileUp className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Import</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Records from Excel</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p className="text-sm text-muted-foreground">
                Upload an Excel file containing your IVF procedure records. The file should have columns for MRN, date, age, procedure, supervision, hospital, complication notes, and operation notes.
              </p>
              <div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Create template Excel file and trigger download
                    const templateURL = '/template.xlsx';
                    const link = document.createElement('a');
                    link.href = templateURL;
                    link.download = 'ivf_records_template.xlsx';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file-upload">Select File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsFileDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                  if (fileInput?.files?.[0]) {
                    // Handle file upload here
                    // TODO: Implement file upload logic
                    setIsFileDialogOpen(false);
                  }
                }}
              >
                Upload File
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TableFilters;
