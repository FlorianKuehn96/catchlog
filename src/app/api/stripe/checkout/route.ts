import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { redis, keys } from '@/lib/redis';
import type { User } from '@/types';

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY not set');
  }
  return new Stripe(key, { apiVersion: '2026-02-25.clover' });
}

// POST /api/stripe/checkout - Create checkout session
export async function POST(request: NextRequest) {
  const { userId, email } = await request.json();

  if (!userId || !email) {
    return NextResponse.json({ error: 'Missing user data' }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    
    // Create or retrieve Stripe customer
    const userData = await redis.get(keys.user(email));
    let customerId = userData ? (userData as User).stripeCustomerId : undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      if (userData) {
        await redis.set(keys.user(email), {
          ...(userData as User),
          stripeCustomerId: customerId,
        });
      }
    }

    // Create checkout session
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      throw new Error('STRIPE_PRICE_ID not set');
    }
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?canceled=true`,
      metadata: { userId, email },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
