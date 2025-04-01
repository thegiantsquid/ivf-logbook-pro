
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRecords } from '@/hooks/useRecords';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/lib/toast';

const EditRecord: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { records, updateRecord, customProcedureTypes, customHospitalTypes } = useRecords();
  
  const [formData, setFormData] = useState({
    mrn: '',
    date: '',
    age: 0,
    procedure: '',
    supervision: '',
    complicationNotes: '',
    operationNotes: '',
    hospital: ''
  });
  
  const [loading, setLoading] = useState(false);

  // Find the record to edit
  useEffect(() => {
    const record = records.find(r => r.id === id);
    if (record) {
      setFormData({
        mrn: record.mrn || '',
        date: record.date || '',
        age: record.age || 0,
        procedure: record.procedure || '',
        supervision: record.supervision || '',
        complicationNotes: record.complicationNotes || '',
        operationNotes: record.operationNotes || '',
        hospital: record.hospital || ''
      });
    }
  }, [id, records]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mrn || !formData.date || !formData.procedure) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await updateRecord(id!, formData);
      
      if (success) {
        toast.success('Record updated successfully');
        navigate('/records');
      }
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Failed to update record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/records')}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Edit Record</h2>
      </div>

      <Card className="shadow-md border-gray-100">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Edit Record</CardTitle>
            <CardDescription>Update patient record details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mrn">Medical Record Number (MRN)*</Label>
                <Input 
                  id="mrn" 
                  name="mrn" 
                  value={formData.mrn} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date*</Label>
                <Input 
                  id="date" 
                  name="date" 
                  type="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">Patient Age</Label>
                <Input 
                  id="age" 
                  name="age" 
                  type="number" 
                  value={formData.age} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="procedure">Procedure Type*</Label>
                <Select 
                  value={formData.procedure} 
                  onValueChange={(value) => handleSelectChange('procedure', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select procedure type" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Default procedure types */}
                    <SelectItem value="IVF">IVF</SelectItem>
                    <SelectItem value="ICSI">ICSI</SelectItem>
                    <SelectItem value="FET">FET</SelectItem>
                    <SelectItem value="IUI">IUI</SelectItem>
                    
                    {/* Custom procedure types */}
                    {customProcedureTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supervision">Supervision</Label>
                <Input 
                  id="supervision" 
                  name="supervision" 
                  value={formData.supervision} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital</Label>
                <Select 
                  value={formData.hospital} 
                  onValueChange={(value) => handleSelectChange('hospital', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Default hospital types */}
                    <SelectItem value="General Hospital">General Hospital</SelectItem>
                    <SelectItem value="City Medical Center">City Medical Center</SelectItem>
                    <SelectItem value="County Hospital">County Hospital</SelectItem>
                    <SelectItem value="University Hospital">University Hospital</SelectItem>
                    
                    {/* Custom hospital types */}
                    {customHospitalTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="complicationNotes">Complication Notes</Label>
              <Textarea 
                id="complicationNotes" 
                name="complicationNotes" 
                value={formData.complicationNotes} 
                onChange={handleChange} 
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="operationNotes">Operation Notes</Label>
              <Textarea 
                id="operationNotes" 
                name="operationNotes" 
                value={formData.operationNotes} 
                onChange={handleChange} 
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline"
              onClick={() => navigate('/records')}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
              {!loading && <Save className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditRecord;
