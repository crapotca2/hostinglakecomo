import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export const stripeEnabled = Boolean(STRIPE_SECRET_KEY);

export const stripe: Stripe | null = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2026-03-25.dahlia" })
  : null;

export function assertStripe(): Stripe {
  if (!stripe) {
    throw new Error(
      "Stripe not configured. Add STRIPE_SECRET_KEY to .env.local. Get a test key from https://dashboard.stripe.com/test/apikeys"
    );
  }
  return stripe;
}

export function getWebhookSecret(): string {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET not set. Run `stripe listen --forward-to localhost:3000/api/stripe/webhook` to get one."
    );
  }
  return STRIPE_WEBHOOK_SECRET;
}
