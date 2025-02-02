import { stripe } from '@/src/utils/stripe/stripe';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest) {
    try {
        // Stripeから価格情報を取得
        const prices = await stripe.prices.list({
            limit: 10, // 必要に応じて取得する価格の数を調整
            expand: ['data.product'], // プロダクト情報を含む
        });

        return NextResponse.json({ prices: prices.data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}