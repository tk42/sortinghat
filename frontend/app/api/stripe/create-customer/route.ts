import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/src/utils/stripe/stripe';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
    try {
        // リクエストボディから email を取得
        const { email } = await req.json();

        // Stripe で新しい顧客を作成
        const customer = await stripe.customers.create({ email });

        // レスポンスを作成し、customerId をクッキーに設定
        const response = NextResponse.json({ customerId: customer.id });
        response.headers.set(
            'Set-Cookie',
            serialize('customerId', customer.id, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                maxAge: 60 * 60 * 24 * 7, // 1週間（必要に応じて変更）
                sameSite: 'lax',
                path: '/',
            })
        );

        return response;
    } catch (error: any) {
        console.error('顧客の作成中にエラーが発生しました:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}