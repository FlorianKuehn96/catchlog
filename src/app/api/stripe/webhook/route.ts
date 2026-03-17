import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getRedis, keys } from '@/lib/redis';
import type { User } from '@/types';

function getStripe(): { stripe: Stripe; webhookSecret: string } {
  const key = process.env.STRIPE_SECRET_KEY;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !secret) {
    throw new Error('STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET must be set');
  }
  return {
    stripe: new Stripe(key, { apiVersion: '2026-02-25.clover' }),
    webhookSecret: secret,
  };
}

// POST /api/stripe/webhook - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  const redis = getRedis();
  
  try {
    const { stripe, webhookSecret } = getStripe();
    
    // Get raw body as text for signature verification
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { email } = session.metadata || {};
        
        if (email) {
          try {
            const userData = await redis.get(keys.user(email));
            if (userData) {
              await redis.set(keys.user(email), {
                ...(userData as User),
                subscription: 'pro',
                stripeCustomerId: session.customer,
                stripeSubscriptionId: session.subscription,
              });
            }
          } catch (err) {
            console.error('Failed to update user subscription:', err);
            // Still return 200 to Stripe, we'll handle this manually
          }
        }
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        try {
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          
          if (customer && !customer.deleted && customer.email) {
            const userData = await redis.get(keys.user(customer.email));
            if (userData) {
              const isActive = subscription.status === 'active' || subscription.status === 'trialing';
              await redis.set(keys.user(customer.email), {
                ...(userData as User),
                subscription: isActive ? 'pro' : 'free',
              });
            }
          }
        } catch (err) {
          console.error('Failed to process subscription update:', err);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        try {
          const customer = await stripe.customers.retrieve(invoice.customer as string);
          
          if (customer && !customer.deleted && customer.email) {
            const userData = await redis.get(keys.user(customer.email));
            if (userData) {
              await redis.set(keys.user(customer.email), {
                ...(userData as User),
                subscription: 'free',
              });
            }
          }
        } catch (err) {
          console.error('Failed to process payment failure:', err);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
