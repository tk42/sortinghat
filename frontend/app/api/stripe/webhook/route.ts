import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/src/utils/stripe/stripe';
import { Stripe } from 'stripe';

export async function POST(req: NextRequest) {
    const sig = req.headers.get('stripe-signature') || '';
    let event: Stripe.Event;

    try {
        const buf = await req.text();
        event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    const dataObject = event.data.object;

    console.log('Event type:', event.type);

    // Event handling logic
    switch (event.type) {
        case 'customer.subscription.created':
            // handle subscription creation
            break;
        case 'customer.subscription.updated':
            // handle subscription update
            break;
        case 'customer.subscription.deleted':
            // handle subscription deletion
            break;
        case 'invoice.payment_succeeded':
            // handle invoice payment success
            break;
        case 'invoice.payment_failed':
            // handle invoice payment failure
            break;
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}