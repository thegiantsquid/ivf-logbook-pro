
# Setting Up Stripe Webhooks

To ensure that your subscription data stays in sync between Stripe and your database, you need to set up a webhook in Stripe that will trigger the edge function whenever relevant events occur.

## Step 1: Get your Webhook URL

Your webhook URL will be in this format:
```
https://bmyrltwtvpfrbdiwoqem.supabase.co/functions/v1/stripe-webhook
```

## Step 2: Create a new webhook in Stripe

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to Developers → Webhooks
3. Click "Add endpoint"
4. Enter your webhook URL
5. Select the following events to listen for:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
6. Click "Add endpoint" to save

## Step 3: Get your webhook signing secret

1. After creating the webhook, click on it in the list of webhooks
2. Click "Reveal" next to "Signing secret"
3. Copy the signing secret

## Step 4: Add the webhook secret to your Supabase Edge Function secrets

1. In your Supabase dashboard, go to Settings → API
2. Under "Edge Functions", add a new secret:
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: [paste the signing secret from step 3]
3. Click "Save"

## Testing the webhook

You can test your webhook integration in the Stripe Dashboard:

1. Go to your webhook details page
2. Click "Send test webhook"
3. Select an event type (e.g., `checkout.session.completed`)
4. Click "Send test webhook"
5. Check the Edge Function logs to verify it processed correctly

Your webhook is now set up and should keep your database in sync with Stripe's subscription data!
