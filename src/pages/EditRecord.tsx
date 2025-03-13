
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

const EditRecord: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Edit Record</CardTitle>
          <CardDescription>Update patient record details</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Editing record ID: {id}
          </p>
          <p className="mt-4">Record edit form will be implemented here.</p>
          <div className="flex justify-end mt-6">
            <Button onClick={() => navigate('/records')}>
              Back to Records
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditRecord;
