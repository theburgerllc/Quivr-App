import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
})

async function setPremium(
  userId: string,
  status: string,
  periodEnd?: number,
  stripeCustomerId?: string,
) {
  const active = status === 'active' || status === 'trialing'
  const until = periodEnd ? new Date(periodEnd * 1000).toISOString() : null
  if (stripeCustomerId) {
    await supabaseAdmin.from('billing_customers').upsert({
      userId,
      stripeCustomerId,
      subscriptionStatus: status,
      currentPeriodEnd: until as any,
    })
  } else {
    await supabaseAdmin
      .from('billing_customers')
      .update({ subscriptionStatus: status, currentPeriodEnd: until as any })
      .eq('userId', userId)
  }
  await supabaseAdmin
    .from('profiles')
    .update({ premium: active, premiumUntil: until as any })
    .eq('id', userId)
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!
  const buf = Buffer.from(await req.arrayBuffer())
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const s = event.data.object as Stripe.Checkout.Session
      const userId = (s.client_reference_id || s.metadata?.userId) as string

      // Handle subscription checkouts
      if (s.mode === 'subscription') {
        const cust = s.customer as string | Stripe.Customer
        const customerId = typeof cust === 'string' ? cust : cust.id
        await setPremium(userId, 'active', undefined, customerId)
      }

      // Handle one-time payment checkouts (boost/spotlight)
      if (s.mode === 'payment') {
        const type = (s.metadata?.type || '') as string
        if (userId && (type === 'boost' || type === 'spotlight')) {
          const now = Math.floor(Date.now() / 1000)
          const ends = now + 24 * 3600
          if (type === 'boost') {
            await supabaseAdmin.from('boosts').insert({
              userId,
              startsAt: new Date(now * 1000).toISOString(),
              endsAt: new Date(ends * 1000).toISOString(),
              status: 'active',
            })
          } else {
            const city = s.metadata?.city || ''
            const country = s.metadata?.country || 'US'
            await supabaseAdmin.from('spotlights').insert({
              userId,
              city,
              country,
              startsAt: new Date(now * 1000).toISOString(),
              endsAt: new Date(ends * 1000).toISOString(),
              status: 'active',
            })
          }
        }
      }
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.resumed':
    case 'customer.subscription.trial_will_end':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const { data: rows } = await supabaseAdmin
        .from('billing_customers')
        .select('userId')
        .eq('stripeCustomerId', sub.customer as string)
        .limit(1)
      const userId = rows?.[0]?.userId
      if (userId)
        await setPremium(userId, sub.status, (sub as any).current_period_end)
      break
    }
    default:
      break
  }
  return NextResponse.json({ received: true })
}
