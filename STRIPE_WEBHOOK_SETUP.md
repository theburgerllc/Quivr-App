# Stripe Webhook Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the `.env.local` file we created and update with your actual keys:

```bash
# Get your keys from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here  # You'll get this in step 4
STRIPE_PRICE_PREMIUM=price_your_premium_price_id

# Also ensure your Supabase keys are set
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=your-service-role-key
```

### 3. Run Database Migrations
Apply the Stripe integration migration to your Supabase database:

```sql
-- Run this in your Supabase SQL editor
-- File: supabase/migrations/002_stripe_integration.sql
```

### 4. Test Locally with Stripe CLI

#### Install Stripe CLI
- **macOS**: `brew install stripe/stripe-cli/stripe`
- **Linux**: Follow [official guide](https://stripe.com/docs/stripe-cli#install)
- **Windows**: Download from [GitHub releases](https://github.com/stripe/stripe-cli/releases)

#### Run the Test Script
```bash
./test-stripe-webhook.sh
```

Or manually:
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Important**: Copy the webhook signing secret (starts with `whsec_`) and add it to your `.env.local`

### 5. Start Your Development Server
```bash
npm run dev
```

### 6. Trigger Test Events
In a new terminal, trigger test events:

```bash
# Test a successful payment
stripe trigger payment_intent.succeeded

# Test a completed checkout
stripe trigger checkout.session.completed

# Test subscription creation
stripe trigger customer.subscription.created
```

## 📋 Webhook Events Handled

| Event | Description | Action |
|-------|-------------|--------|
| `checkout.session.completed` | Customer completes checkout | Links Stripe customer to user profile |
| `customer.subscription.created` | New subscription created | Updates user to premium plan |
| `customer.subscription.updated` | Subscription modified | Updates plan status |
| `customer.subscription.deleted` | Subscription canceled | Downgrades user to free plan |
| `payment_intent.succeeded` | Payment successful | Logs payment for tracking |
| `payment_intent.payment_failed` | Payment failed | Logs failure for investigation |
| `invoice.payment_succeeded` | Subscription renewed | Logs successful renewal |
| `invoice.payment_failed` | Renewal failed | Updates user status to past_due |

## 🏗️ Architecture

### Files Structure
```
app/
├── api/
│   └── stripe/
│       ├── webhook/
│       │   └── route.ts          # Main webhook handler
│       └── create-checkout-session/
│           └── route.ts          # Creates Stripe checkout sessions
lib/
├── stripe.ts                     # Stripe client initialization
└── supabaseAdmin.ts             # Supabase admin client
```

### Database Schema
The integration adds these fields to your `profiles` table:
- `stripe_customer_id` - Links to Stripe customer
- `subscription_status` - Current subscription status
- `subscription_updated_at` - Last status change timestamp
- `email` - User email for Stripe

Additional tables:
- `stripe_events` - Audit log of all webhook events
- `purchases` - Track all purchases and subscriptions

## 🔒 Security Best Practices

1. **Webhook Signature Verification**: All webhooks are verified using Stripe's signature
2. **Environment Variables**: Never commit real keys to version control
3. **Error Handling**: Webhooks always return 200 to prevent retries
4. **Idempotency**: Events are logged to prevent duplicate processing
5. **Service Role**: Only server-side code uses the Supabase service role

## 🧪 Testing Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Stripe CLI installed and logged in
- [ ] Webhook forwarding active
- [ ] Test events triggering successfully
- [ ] User profiles updating in database
- [ ] Error handling working properly

## 🚢 Production Deployment

### 1. Set Production Environment Variables
```bash
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
```

### 2. Register Production Webhook
1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select the events you want to receive
5. Copy the signing secret to your production environment

### 3. Verify Production Setup
```bash
# Send a test event from Stripe Dashboard
# Monitor your logs for successful processing
```

## 🐛 Troubleshooting

### Common Issues

#### "No signature" error
- Ensure you're sending the raw request body
- Check that `stripe-signature` header is present

#### "Webhook Error: No signatures found"
- Verify your `STRIPE_WEBHOOK_SECRET` is correct
- Make sure you're using the right secret for your environment

#### User not updating
- Check Supabase connection and service role key
- Verify the `stripe_customer_id` field exists in database
- Check logs for specific error messages

#### Events not forwarding locally
- Ensure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Check that your dev server is running on port 3000
- Verify firewall isn't blocking connections

## 📚 Additional Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## 💬 Support

If you encounter any issues:
1. Check the console logs in your terminal
2. Review the Stripe Dashboard event logs
3. Verify all environment variables are set correctly
4. Test with the Stripe CLI's event triggering