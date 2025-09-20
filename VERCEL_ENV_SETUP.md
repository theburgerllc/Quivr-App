# Vercel Environment Variables Setup

## Required Environment Variables

To make your Quivr app fully functional, you need to configure the following environment variables in your Vercel dashboard:

### 1. Access Your Vercel Project Settings
- Go to: https://vercel.com/tburgernycs-projects/quivr-app/settings/environment-variables
- Or navigate: Vercel Dashboard → Your Project → Settings → Environment Variables

### 2. Add the Following Environment Variables

#### Supabase Configuration (Required)
```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_ANON_KEY=eyJ... (your anonymous key)
SUPABASE_SERVICE_ROLE=eyJ... (your service role key - keep this secret!)
```

To get these values:
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the URL and keys

#### Stripe Configuration (Required for payments)
```
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PREMIUM=price_... (Premium subscription price ID)
STRIPE_PRICE_BOOST=price_... (Boost feature price ID)
STRIPE_PRICE_SPOTLIGHT=price_... (Spotlight feature price ID)
```

To get these values:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. For secret key: Developers → API keys
3. For webhook secret: After creating webhook endpoint at Developers → Webhooks
4. For price IDs: Products → Select product → Copy price ID

#### Public Configuration (Optional but recommended)
```
NEXT_PUBLIC_PREMIUM_NAME=Premium
NEXT_PUBLIC_POSTHOG_KEY=phc_... (if using PostHog analytics)
```

#### Security Configuration (Optional)
```
COOKIE_SECURE=true
COOKIE_SAMESITE=lax
```

### 3. Configure Stripe Webhook

After deployment, you need to set up the Stripe webhook:

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://quivr-app.vercel.app/api/stripe/webhook`
   (Replace with your actual Vercel domain)
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the signing secret and add it as `STRIPE_WEBHOOK_SECRET` in Vercel

### 4. Set Up Supabase Database

Before the app will work properly, you need to run the database migrations:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the migration file located at `supabase/migrations/001_init.sql`

### 5. Deployment URLs

Your app is deployed at:
- Production: https://quivr-app.vercel.app (or your custom domain)
- Preview deployments: Created automatically for each git push

### Verifying Configuration

After adding all environment variables:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click the three dots menu on the latest deployment
3. Select "Redeploy"
4. This will rebuild with the new environment variables

### Need Help?

- Check deployment logs: Vercel Dashboard → Functions tab
- Monitor errors: Vercel Dashboard → Analytics → Runtime Logs
- Test webhooks: Use Stripe's webhook testing tools

## Quick Start Checklist

- [ ] Add Supabase credentials (URL, ANON_KEY, SERVICE_ROLE)
- [ ] Add Stripe keys (SECRET_KEY, WEBHOOK_SECRET)
- [ ] Add Stripe price IDs (PREMIUM, BOOST, SPOTLIGHT)
- [ ] Configure Stripe webhook endpoint
- [ ] Run Supabase database migrations
- [ ] Redeploy on Vercel
- [ ] Test the application