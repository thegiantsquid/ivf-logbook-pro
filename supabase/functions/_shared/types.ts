
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
