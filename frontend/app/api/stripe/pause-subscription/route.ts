import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/src/utils/stripe/stripe';

export async function POST(req: NextRequest) {
    const { subscriptionId } = await req.json();

    try {
        const subscription = await stripe.subscriptions.update(subscriptionId, {
            pause_collection: {
                behavior: 'keep_as_draft',
            },
        });

        return NextResponse.json({ subscription });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}