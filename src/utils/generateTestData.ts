
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/toast';

// Random data pools
const procedures = ['Egg Collection', 'Embryo Transfer', 'Consultation', 'Follicle Tracking', 'Mock Embryo Transfer', 'Hysteroscopy'];
const supervisions = ['Direct', 'Indirect', 'Independent', 'Teaching'];
const hospitals = ['General Hospital', 'Private Clinic', 'University Hospital', 'Women\'s Hospital', 'Fertility Center'];

// Generate a random MRN (Medical Record Number)
const generateMRN = () => {
  return `MRN${Math.floor(100000 + Math.random() * 900000)}`;
};

// Generate a random date within the last 2 years
const generateDate = () => {
  const today = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(today.getFullYear() - 2);
  
  const randomTimestamp = twoYearsAgo.getTime() + Math.random() * (today.getTime() - twoYearsAgo.getTime());
  const randomDate = new Date(randomTimestamp);
  
  return randomDate.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Generate a random age between 20 and 45
const generateAge = () => {
  return Math.floor(20 + Math.random() * 26);
};

// Generate random notes
const generateNotes = (type: 'complication' | 'operation') => {
  const complicationNotes = [
    'None',
    'Mild discomfort reported',
    'Patient experienced cramping',
    'Nausea during procedure',
    'Difficulty with catheter placement',
    'Vasovagal episode',
    'Mild bleeding',
  ];
  
  const operationNotes = [
    'Procedure completed successfully without complications',
    'Patient tolerated procedure well',
    'Difficult access due to cervical stenosis',
    'Anteverted uterus noted',
    'Retroverted uterus noted',
    'Multiple attempts needed for follicle access',
    'Clean single-pass embryo transfer',
    'Ultrasound guidance used throughout',
  ];
  
  return type === 'complication' 
    ? complicationNotes[Math.floor(Math.random() * complicationNotes.length)]
    : operationNotes[Math.floor(Math.random() * operationNotes.length)];
};

// Generate a single random record
const generateRandomRecord = (userId: string) => {
  return {
    mrn: generateMRN(),
    date: generateDate(),
    age: generateAge(),
    procedure: procedures[Math.floor(Math.random() * procedures.length)],
    supervision: supervisions[Math.floor(Math.random() * supervisions.length)],
    complication_notes: generateNotes('complication'),
    operation_notes: generateNotes('operation'),
    hospital: hospitals[Math.floor(Math.random() * hospitals.length)],
    created_by: userId,
  };
};

// Generate and insert multiple random records
export const generateTestRecords = async (count: number = 50) => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to generate test records');
      return false;
    }
    
    const records = Array(count).fill(null).map(() => generateRandomRecord(user.id));
    
    toast.loading(`Generating ${count} test records...`);
    
    const { error } = await supabase
      .from('ivf_records')
      .insert(records);
    
    if (error) throw error;
    
    toast.success(`Successfully added ${count} test records`);
    return true;
  } catch (error: any) {
    console.error('Error generating test records:', error);
    toast.error(`Failed to generate test records: ${error.message}`);
    return false;
  }
};
