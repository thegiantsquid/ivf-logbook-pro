import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useRecords } from '@/hooks/useRecords';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';
import { IVFRecord, ProcedureType, SupervisionType, HospitalType } from '@/types';
import { FileUp, FilePlus, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrialBanner } from '@/components/subscription/TrialBanner';
type FormValues = Omit<IVFRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
const supervisionTypes: SupervisionType[] = ['Direct', 'Indirect', 'Independent', 'Teaching'];
const AddRecord: React.FC = () => {
  const {
    addRecord,
    importFromExcel,
    customProcedureTypes,
    customHospitalTypes,
    addCustomProcedureType,
    addCustomHospitalType
  } = useRecords();
  const {
    isLoading,
    hasActiveSubscription,
    isInTrialPeriod,
    trialEndsAt
  } = useSubscription();
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    defaultValues: {
      mrn: '',
      date: new Date().toISOString().split('T')[0],
      age: 30,
      procedure: '',
      supervision: 'Direct',
      complicationNotes: '',
      operationNotes: '',
      hospital: ''
    }
  });
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const recordId = await addRecord(data);
      if (recordId) {
        form.reset();
        toast.success('Record added successfully');
        navigate('/records');
      }
    } catch (error) {
      console.error('Error adding record:', error);
      toast.error('Failed to add record');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleAddProcedureType = async () => {
    if (!newProcedureType.trim()) {
      toast.error('Please enter a procedure type');
      return;
    }
    const success = await addCustomProcedureType(newProcedureType);
    if (success) {
      toast.success('Procedure type added successfully');
      form.setValue('procedure', newProcedureType);
      setNewProcedureType('');
      setIsAddingProcedure(false);
    }
  };
  const handleAddHospitalType = async () => {
    if (!newHospitalType.trim()) {
      toast.error('Please enter a hospital type');
      return;
    }
    const success = await addCustomHospitalType(newHospitalType);
    if (success) {
      toast.success('Hospital type added successfully');
      form.setValue('hospital', newHospitalType);
      setNewHospitalType('');
      setIsAddingHospital(false);
    }
  };
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      toast.error('Please upload an Excel or CSV file');
      return;
    }
    setIsImporting(true);
    try {
      await importFromExcel(file);
      event.target.value = '';
      navigate('/records');
    } catch (error) {
      console.error('Error importing records:', error);
      toast.error('Failed to import records');
    } finally {
      setIsImporting(false);
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [newProcedureType, setNewProcedureType] = useState('');
  const [newHospitalType, setNewHospitalType] = useState('');
  const [isAddingProcedure, setIsAddingProcedure] = useState(false);
  const [isAddingHospital, setIsAddingHospital] = useState(false);
  if (!isLoading && !hasActiveSubscription && !isInTrialPeriod) {
    return <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscription Required</h2>
          <p className="text-muted-foreground mt-1">
            Your trial period has ended. Please subscribe to continue adding records.
          </p>
        </div>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Subscribe to IVF Logbook Pro</CardTitle>
            <CardDescription>
              Get unlimited access to all features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Your free trial has expired. Subscribe now to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Add unlimited records</li>
              <li>Track your progress</li>
              <li>Access detailed analytics</li>
              <li>Export your data</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/subscribe')}>
              View Subscription Options
            </Button>
          </CardFooter>
        </Card>
      </div>;
  }
  return <div className="space-y-6">
      <TrialBanner />
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Add Record</h2>
        <p className="text-muted-foreground mt-1">
          Create a new record or import from Excel
        </p>
      </div>
      
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="manual">
            <FilePlus className="mr-2 h-4 w-4" />
            Add Manually
          </TabsTrigger>
          <TabsTrigger value="import">
            <FileUp className="mr-2 h-4 w-4" />
            Bulk Import
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Add New Record</CardTitle>
              <CardDescription>Enter the details for a new procedure record</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    <FormField control={form.control} name="mrn" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Medical Record Number (MRN)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. MRN12345" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    
                    <FormField control={form.control} name="date" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    
                    <FormField control={form.control} name="age" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Patient Age</FormLabel>
                          <FormControl>
                            <Input type="number" min={18} max={60} {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    
                    <FormField control={form.control} name="procedure" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Procedure</FormLabel>
                          <div className="flex gap-2">
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select procedure" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {customProcedureTypes.map(procedure => <SelectItem key={procedure} value={procedure}>
                                    {procedure}
                                  </SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Dialog open={isAddingProcedure} onOpenChange={setIsAddingProcedure}>
                              <DialogTrigger asChild>
                                <Button type="button" variant="outline" size="icon">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add New Procedure Type</DialogTitle>
                                  <DialogDescription>
                                    Create a new procedure type that will be saved for your future records.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <Input placeholder="Enter procedure name" value={newProcedureType} onChange={e => setNewProcedureType(e.target.value)} />
                                </div>
                                <DialogFooter>
                                  <Button type="button" variant="outline" onClick={() => setIsAddingProcedure(false)}>
                                    Cancel
                                  </Button>
                                  <Button type="button" onClick={handleAddProcedureType}>
                                    Add Procedure
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                          <FormMessage />
                        </FormItem>} />
                    
                    <FormField control={form.control} name="supervision" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Supervision</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} required>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select supervision type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {supervisionTypes.map(type => <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>} />
                    
                    <FormField control={form.control} name="hospital" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Hospital</FormLabel>
                          <div className="flex gap-2">
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select hospital" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {customHospitalTypes.map(hospital => <SelectItem key={hospital} value={hospital}>
                                    {hospital}
                                  </SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Dialog open={isAddingHospital} onOpenChange={setIsAddingHospital}>
                              <DialogTrigger asChild>
                                <Button type="button" variant="outline" size="icon">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add New Hospital</DialogTitle>
                                  <DialogDescription>
                                    Create a new hospital that will be saved for your future records.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <Input placeholder="Enter hospital name" value={newHospitalType} onChange={e => setNewHospitalType(e.target.value)} />
                                </div>
                                <DialogFooter>
                                  <Button type="button" variant="outline" onClick={() => setIsAddingHospital(false)}>
                                    Cancel
                                  </Button>
                                  <Button type="button" onClick={handleAddHospitalType}>
                                    Add Hospital
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                          <FormMessage />
                        </FormItem>} />
                  </div>
                  
                  <div className="grid gap-6 grid-cols-1">
                    <FormField control={form.control} name="complicationNotes" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Complication Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter any complications or issues encountered" className="resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    
                    <FormField control={form.control} name="operationNotes" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Operation Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter details about the procedure" className="resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save Record'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="import" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Bulk Import Records</CardTitle>
              <CardDescription>
                Import multiple records from an Excel or CSV file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                <FileUp className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Excel File</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Your file should have columns matching the record fields: mrn, date, age, procedure, supervision, etc.
                </p>
                <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} disabled={isImporting} className="max-w-sm" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Required columns:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>mrn - Patient medical record number</li>
                  <li>date - Procedure date (YYYY-MM-DD)</li>
                  <li>age - Patient age</li>
                  <li>procedure - Type of procedure</li>
                  <li>supervision - Supervision level</li>
                  <li>hospital - Hospital name</li>
                  <li>complicationNotes (optional) - Notes on complications</li>
                  <li>operationNotes (optional) - General procedure notes</li>
                </ul>
              </div>
              
              <div className="w-full flex justify-end">
                <Button disabled={isImporting}>
                  {isImporting ? 'Importing...' : 'Upload File'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default AddRecord;