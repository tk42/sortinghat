import { stripe } from '@/src/utils/stripe/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'cookie';

export async function POST(req: NextRequest) {
    try {
        const cookies = parse(req.headers.get('cookie') || '');
        const customerId = cookies.customer;
        const { priceId } = await req.json();

        // サブスクリプションのためのPaymentIntentを作成
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 500,
            currency: 'jpy',
            customer: customerId,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}