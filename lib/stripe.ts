import Stripe from 'stripe'

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
  typescript: true,
})

// Export Stripe types for convenience
export type StripeEvent = Stripe.Event
export type StripeCheckoutSession = Stripe.Checkout.Session
export type StripeSubscription = Stripe.Subscription
export type StripeCustomer = Stripe.Customer
export type StripePaymentIntent = Stripe.PaymentIntent
