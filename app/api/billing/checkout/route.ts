import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
})
export async function POST(req: NextRequest) {
  const { userId } = await req.json()
  if (!userId)
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_PREMIUM!, quantity: 1 }],
    success_url: `${req.nextUrl.origin}/billing/success`,
    cancel_url: `${req.nextUrl.origin}/billing/cancel`,
    client_reference_id: userId,
    metadata: { userId },
  })
  return NextResponse.json({ url: session.url })
}
