
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

export interface UserSubscription {
  id: string;
  user_id: string;
  is_subscribed: boolean;
  trial_start_date: string;
  trial_end_date: string;
  subscription_end_date: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}
