import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
})
export async function POST(req: NextRequest) {
  const { customerId } = await req.json()
  const sess = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${req.nextUrl.origin}/settings`,
  })
  return NextResponse.json({ url: sess.url })
}
