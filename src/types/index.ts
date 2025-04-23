
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

// Creating a more compatible User interface that works with our code
export interface User {
  id: string;          // Supabase's User.id
  email: string | null;
  displayName?: string | null;  // Custom field from user metadata
  photoURL?: string | null;     // Custom field from user metadata
  uid?: string;        // Alias for id to maintain compatibility
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
