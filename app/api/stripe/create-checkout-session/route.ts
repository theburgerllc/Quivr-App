import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { priceId, mode = 'subscription', userId, userEmail } = body

    // Use the provided price ID or fallback to environment variable
    const finalPriceId = priceId || process.env.STRIPE_PRICE_PREMIUM!

    // Prepare checkout session parameters
    const sessionParams: any = {
      mode,
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/plus?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/plus?status=cancel`,
      // Allow promotion codes
      allow_promotion_codes: true,
      // Collect billing address
      billing_address_collection: 'required',
    }

    // If we have a user ID, add it as client reference ID
    if (userId) {
      sessionParams.client_reference_id = userId

      // Try to get existing Stripe customer for this user
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('stripe_customer_id, email')
        .eq('id', userId)
        .single()

      if (profile?.stripe_customer_id) {
        // Use existing customer
        sessionParams.customer = profile.stripe_customer_id
      } else if (userEmail || profile?.email) {
        // Create new customer with email
        sessionParams.customer_email = userEmail || profile?.email
      }
    } else if (userEmail) {
      // If no user ID but we have email, use it
      sessionParams.customer_email = userEmail
    }

    // Add metadata for tracking
    sessionParams.metadata = {
      userId: userId || 'anonymous',
      productType: mode === 'subscription' ? 'premium' : 'one-time',
      priceId: finalPriceId,
    }

    // For subscriptions, add trial period if configured
    if (mode === 'subscription') {
      sessionParams.subscription_data = {
        // Optional: Add trial period (e.g., 7 days)
        // trial_period_days: 7,
        metadata: {
          userId: userId || 'anonymous',
        },
      }
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 },
    )
  }
}
