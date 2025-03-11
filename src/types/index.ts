
export interface IVFRecord {
  id?: string;
  mrn: string;
  date: string;
  age: number;
  procedure: string;
  supervision: string;
  complicationNotes: string;
  operationNotes: string;
  hospital: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type ProcedureType = string;
export type SupervisionType = 'Direct' | 'Indirect' | 'Independent' | 'Teaching';
export type HospitalType = string;

export interface ProcedureSummary {
  procedure: string;
  count: number;
  supervisionBreakdown: {
    [key in SupervisionType]?: number;
  };
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: keyof IVFRecord;
  direction: SortDirection;
}

export interface FilterConfig {
  [key: string]: any;
}

export interface CustomTypeRecord {
  id: string;
  user_id: string;
  type: string;
  created_at: Date;
}
