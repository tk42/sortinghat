import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/src/utils/stripe/stripe';

export async function POST(req: NextRequest) {
    try {
        const { customerId } = await req.json();

        if (!customerId) {
            return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
        }

        // サブスクリプションを取得
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'all', // すべてのステータスを取得 (active, canceled, past_due, etc.)
            expand: ['data.plan.product'], // プラン名などの詳細情報を取得
        });

        // 支払履歴を取得
        const paymentIntents = await stripe.paymentIntents.list({
            customer: customerId,
            limit: 10, // 必要に応じて制限を調整
        });

        // Add pause_collection information to subscription data
        const subscriptionData = subscriptions.data.map(sub => ({
            ...sub,
            pause_collection: sub.pause_collection
        }));

        return NextResponse.json({
            subscriptions: subscriptionData,
            paymentHistory: paymentIntents.data,
        });
    } catch (error: any) {
        console.error('Error fetching subscription status and payment history:', error);
        return NextResponse.json(
            { error: { message: error.message || 'Failed to retrieve subscription status and payment history' } },
            { status: 400 }
        );
    }
}