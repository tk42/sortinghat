// app/api/stripe/get-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/src/utils/stripe/stripe';
import { parse } from 'cookie';

export async function POST(req: NextRequest) {
    try {
        const cookies = parse(req.headers.get('cookie') || '');
        const customerId = cookies.customerId; // クッキー名を確認

        // 顧客IDが存在しない場合はエラーを返す
        if (!customerId) {
            return NextResponse.json(
                { error: { message: '顧客情報を取得できませんでした。' } },
                { status: 400 }
            );
        }

        // 顧客のサブスクリプションを取得
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'all',
            expand: ['data.items.data.price'],
        });

        // アクティブなサブスクリプションを検索
        const activeSubscription = subscriptions.data.find((sub) =>
            ['active', 'trialing', 'past_due', 'unpaid'].includes(sub.status)
        );

        // サブスクリプション情報を返す（アクティブなものがない場合は null）
        return NextResponse.json({ subscription: activeSubscription || null });
    } catch (error: any) {
        console.error('サブスクリプションの取得中にエラーが発生しました:', error);
        return NextResponse.json(
            { error: { message: error.message } },
            { status: 500 }
        );
    }
}