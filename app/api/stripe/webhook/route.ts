import { NextRequest, NextResponse } from 'next/server'
import {
  stripe,
  type StripeEvent,
  type StripeCheckoutSession,
  type StripeSubscription,
} from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Helper function to get or create user profile with Stripe customer
async function getUserByStripeCustomer(customerId: string) {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, username, stripe_customer_id')
    .eq('stripe_customer_id', customerId)
    .single()

  return profile
}

// Helper function to update user subscription status
async function updateUserSubscriptionStatus(
  customerId: string,
  status: 'active' | 'canceled' | 'past_due' | 'incomplete',
  plan: string = 'free',
) {
  const profile = await getUserByStripeCustomer(customerId)

  if (!profile) {
    console.error(`No user found for Stripe customer: ${customerId}`)
    return null
  }

  // Map subscription status to user plan
  const userPlan = status === 'active' ? plan : 'free'

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({
      plan: userPlan,
      subscription_status: status,
      subscription_updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating user subscription:', error)
    return null
  }

  console.log(
    `Updated user ${profile.username} to plan: ${userPlan}, status: ${status}`,
  )
  return data
}

// Helper function to link Stripe customer to user
async function linkStripeCustomerToUser(
  customerId: string,
  userId?: string,
  email?: string,
) {
  // Try to find user by ID or email
  let query = supabaseAdmin.from('profiles').select('id, username')

  if (userId) {
    query = query.eq('id', userId)
  } else if (email) {
    query = query.eq('email', email)
  } else {
    console.error('No user ID or email provided to link Stripe customer')
    return null
  }

  const { data: profile } = await query.single()

  if (!profile) {
    console.error(`No user found with ID: ${userId} or email: ${email}`)
    return null
  }

  // Update profile with Stripe customer ID
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ stripe_customer_id: customerId })
    .eq('id', profile.id)
    .select()
    .single()

  if (error) {
    console.error('Error linking Stripe customer to user:', error)
    return null
  }

  console.log(
    `Linked Stripe customer ${customerId} to user ${profile.username}`,
  )
  return data
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    console.error('No Stripe signature found in request')
    return new NextResponse('No signature', { status: 400 })
  }

  let event: StripeEvent

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // Log the event type for debugging
  console.log(`Stripe webhook received: ${event.type}`)

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as StripeCheckoutSession

        console.log(`Checkout completed for customer: ${session.customer}`)

        // Link the Stripe customer to the user if needed
        if (session.customer && session.client_reference_id) {
          await linkStripeCustomerToUser(
            session.customer as string,
            session.client_reference_id,
            session.customer_email || undefined,
          )
        }

        // If this was a subscription checkout, the subscription events will handle the plan update
        // If it was a one-time payment, handle it here
        if (session.mode === 'payment') {
          // Handle one-time payments (boost, spotlight, etc.)
          console.log('One-time payment completed:', session.amount_total)
        }

        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as StripeSubscription

        console.log(
          `Subscription ${event.type} for customer: ${subscription.customer}`,
        )

        // Determine the plan based on price ID
        let plan = 'free'
        if (
          subscription.items.data.some(
            (item) => item.price.id === process.env.STRIPE_PRICE_PREMIUM,
          )
        ) {
          plan = 'premium'
        }

        await updateUserSubscriptionStatus(
          subscription.customer as string,
          subscription.status as any,
          plan,
        )

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as StripeSubscription

        console.log(
          `Subscription canceled for customer: ${subscription.customer}`,
        )

        // Downgrade user to free plan
        await updateUserSubscriptionStatus(
          subscription.customer as string,
          'canceled',
          'free',
        )

        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any

        console.log(
          `Payment succeeded: ${paymentIntent.amount / 100} ${paymentIntent.currency}`,
        )

        // Log successful payment for analytics/tracking
        // You can add custom logic here for one-time purchases

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any

        console.log(`Payment failed for customer: ${paymentIntent.customer}`)

        // Handle failed payments - could notify user or update their status

        break
      }

      case 'invoice.payment_succeeded': {
        // Successful subscription renewal
        const invoice = event.data.object as any
        console.log(`Invoice paid for customer: ${invoice.customer}`)
        break
      }

      case 'invoice.payment_failed': {
        // Failed subscription renewal
        const invoice = event.data.object as any

        console.log(`Invoice payment failed for customer: ${invoice.customer}`)

        // Could update user status or send notification
        if (invoice.subscription) {
          await updateUserSubscriptionStatus(
            invoice.customer as string,
            'past_due',
            'free',
          )
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    // Return 200 to prevent Stripe from retrying
    // Log the error for investigation but don't fail the webhook
    return NextResponse.json(
      { received: true, error: 'Internal processing error' },
      { status: 200 },
    )
  }
}

// Configure the route to receive the raw body
export const runtime = 'nodejs'
// This is important for Next.js 13+ App Router
// We need the raw body for signature verification
