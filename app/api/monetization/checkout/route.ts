import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
})

export async function POST(req: NextRequest) {
  const { type, userId, city, country } = await req.json()
  if (!userId || !['boost', 'spotlight'].includes(type))
    return NextResponse.json(
      { error: 'type boost|spotlight and userId required' },
      { status: 400 },
    )
  const price =
    type === 'boost'
      ? process.env.STRIPE_PRICE_BOOST!
      : process.env.STRIPE_PRICE_SPOTLIGHT!
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price, quantity: 1 }],
    success_url: `${req.nextUrl.origin}/monetize/success`,
    cancel_url: `${req.nextUrl.origin}/monetize/cancel`,
    client_reference_id: userId,
    metadata: { userId, type, city: city || '', country: country || '' },
  })
  return NextResponse.json({ url: session.url })
}
