import Stripe from 'stripe';
import { parse } from 'cookie';
import { stripe } from '@/src/utils/stripe/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const cookies = parse(req.headers.get('cookie') || '');
        const customerId = cookies.customerId;
        const { priceId } = await req.json();

        // クッキーから顧客IDを取得
        if (!customerId) {
            return NextResponse.json(
                { error: { message: '顧客情報を取得できませんでした。' } },
                { status: 400 }
            );
        }

        // サブスクリプションを作成
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent'],
            payment_settings: {
                save_default_payment_method: 'on_subscription',
            },
        });

        // クライアントシークレットを取得
        const clientSecret = (subscription.latest_invoice?.payment_intent as Stripe.PaymentIntent)
            ?.client_secret;

        if (!clientSecret) {
            return NextResponse.json(
                { error: { message: '支払い情報の取得に失敗しました。' } },
                { status: 500 }
            );
        }

        return NextResponse.json({ clientSecret });
    } catch (error: any) {
        console.error('サブスクリプションの作成中にエラーが発生しました:', error);
        return NextResponse.json(
            { error: { message: error.message } },
            { status: 500 }
        );
    }
}