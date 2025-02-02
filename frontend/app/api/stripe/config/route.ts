import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/src/utils/stripe/stripe';

export async function GET() {
    const prices = await stripe.prices.list({
        lookup_keys: ['sample_basic', 'sample_premium'],
        expand: ['data.product'],
    });

    return NextResponse.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        prices: prices.data,
    });
}