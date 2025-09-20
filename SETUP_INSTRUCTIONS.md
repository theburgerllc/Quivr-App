# 🚀 Complete Setup Instructions for Stripe Webhook Integration

## ✅ What Has Been Completed

1. **Environment Variables** - Your `.env.local` file has been configured with:
   - ✅ Supabase credentials
   - ✅ Stripe secret key
   - ✅ Stripe Price IDs for Premium, Boost, and Spotlight products

2. **Stripe Products Created** - The following products are now in your Stripe account:
   - ✅ Premium Subscription ($14.99/month) - `price_1S8veo8RQQM0peCgCWvgaQI8`
   - ✅ Profile Boost ($3.99 one-time) - `price_1S8veo8RQQM0peCg2U1ujLrF`
   - ✅ Spotlight Feature ($9.99 one-time) - `price_1S8vep8RQQM0peCgjMJ4pDcI`

3. **Code Implementation** - All necessary code files have been created:
   - ✅ `/app/api/stripe/webhook/route.ts` - Webhook endpoint
   - ✅ `/app/api/stripe/create-checkout-session/route.ts` - Checkout session creator
   - ✅ `/lib/stripe.ts` - Stripe client initialization

## 🔧 Required Setup Steps

### Step 1: Apply Database Migrations

First, ensure your base database schema is set up:

1. **Go to your Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/hkzclmflxxpjvxnntidd
   ```

2. **Navigate to SQL Editor** (in the left sidebar)

3. **Run the initial migration** (if not already done):
   - Click "New Query"
   - Copy and paste the contents of `supabase/migrations/001_init.sql`
   - Click "Run"

4. **Run the Stripe integration migration:**
   - Click "New Query" again
   - Copy and paste the contents of `supabase/migrations/002_stripe_integration.sql`
   - Click "Run"

### Step 2: Get Your Webhook Signing Secret

You need to get the webhook signing secret for local testing:

1. **Install Stripe CLI** (if not already installed):
   
   **For Ubuntu/Linux:**
   ```bash
   # Download and install
   curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
   echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-apt-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
   sudo apt update
   sudo apt install stripe
   ```

   **For macOS:**
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login to Stripe CLI:**
   ```bash
   stripe login
   ```

3. **Start webhook forwarding:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy the webhook signing secret** that appears (starts with `whsec_`)

5. **Update your `.env.local` file:**
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here
   ```

### Step 3: Start Your Development Server

1. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

### Step 4: Test the Integration

With the Stripe CLI still running in a separate terminal:

1. **Test a successful payment:**
   ```bash
   stripe trigger payment_intent.succeeded
   ```

2. **Test a checkout completion:**
   ```bash
   stripe trigger checkout.session.completed
   ```

3. **Test a subscription creation:**
   ```bash
   stripe trigger customer.subscription.created
   ```

Check your terminal logs to see if the webhook events are being received and processed.

## 🧪 Testing the Full Flow

### Create a Test Checkout Session

You can test the full checkout flow by making a POST request to your checkout session endpoint:

```bash
curl -X POST http://localhost:3000/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_1S8veo8RQQM0peCgCWvgaQI8",
    "mode": "subscription",
    "userId": "test-user-123",
    "userEmail": "test@example.com"
  }'
```

This will return a checkout URL that you can open in your browser to complete a test purchase.

## 📊 Monitoring

### View Webhook Events in Stripe Dashboard
1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click on your webhook endpoint
3. View the event log and responses

### Check Database Updates
In your Supabase SQL Editor, run:
```sql
-- Check user profiles
SELECT id, username, email, stripe_customer_id, plan, subscription_status 
FROM profiles 
WHERE stripe_customer_id IS NOT NULL;

-- Check webhook events log
SELECT * FROM stripe_events 
ORDER BY created_at DESC 
LIMIT 10;

-- Check purchases
SELECT * FROM purchases 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🚢 Production Deployment

When you're ready to deploy to production:

1. **Set production environment variables** in your hosting platform (Vercel, etc.):
   ```
   STRIPE_SECRET_KEY=sk_live_your_live_key
   STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
   ```

2. **Register production webhook in Stripe:**
   - Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
   - Click "Add endpoint"
   - Enter: `https://yourdomain.com/api/stripe/webhook`
   - Select events to listen for
   - Copy the signing secret to your production environment

## ❓ Troubleshooting

### "No signature" error
- Make sure the Stripe CLI is running and forwarding to the correct port
- Verify `STRIPE_WEBHOOK_SECRET` is set in `.env.local`

### Database not updating
- Check that the migrations have been applied
- Verify the `SUPABASE_SERVICE_ROLE` key is correct
- Check the console logs for specific errors

### Webhook not receiving events
- Ensure the dev server is running on port 3000
- Check that Stripe CLI is forwarding to the correct URL
- Look for errors in both terminal windows

## 📞 Need Help?

If you encounter any issues:
1. Check the console logs in both terminal windows
2. Review the Stripe Dashboard event logs
3. Verify all environment variables are set correctly
4. Ensure all database migrations have been applied

---

**Your Stripe webhook integration is now ready!** Follow the steps above to complete the setup and start processing payments. 🎉