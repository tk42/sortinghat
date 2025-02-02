import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/src/utils/stripe/stripe';
import { parse } from 'cookie';

export async function POST(request: NextRequest) {
    try {
        const cookies = parse(request.headers.get('cookie') || '');
        const customerId = cookies.customer;

        if (!customerId) {
            return NextResponse.json(
                { error: { message: '顧客情報を取得できませんでした。' } },
                { status: 400 }
            );
        }

        // リクエストボディを安全にパース
        let payment_method_types: string[] = ['card'];
        try {
            const body = await request.json();
            if (body.payment_method_types) {
                payment_method_types = [body.payment_method_types];
            }
        } catch (e) {
            // リクエストボディが空の場合はデフォルトの値を使用
        }

        // SetupIntentを作成
        const setupIntent = await stripe.setupIntents.create({
            customer: customerId,
            payment_method_types: payment_method_types,
        });

        return NextResponse.json({ clientSecret: setupIntent.client_secret });
    } catch (error: any) {
        console.error('SetupIntentの作成中にエラーが発生しました:', error);
        return NextResponse.json(
            { error: { message: error.message } },
            { status: 500 }
        );
    }
}