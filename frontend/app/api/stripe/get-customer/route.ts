import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/src/utils/stripe/stripe';
import { auth } from '@/src/utils/firebase/admin';

export async function POST(req: NextRequest) {
    try {
        // Firebaseの認証トークンを取得
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: { message: '認証エラー' } },
                { status: 401 }
            );
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(idToken);
        const email = decodedToken.email;

        if (!email) {
            return NextResponse.json(
                { error: { message: 'メールアドレスが見つかりません' } },
                { status: 400 }
            );
        }

        // 既存の顧客を検索
        const customers = await stripe.customers.list({ email });
        let customer = customers.data[0];

        // 顧客が存在しない場合は新規作成
        if (!customer) {
            customer = await stripe.customers.create({
                email,
                metadata: {
                    firebaseUID: decodedToken.uid
                }
            });
        }

        // レスポンスを作成
        const response = NextResponse.json({ customerId: customer.id });

        // クッキーを設定
        response.cookies.set('customerId', customer.id, {
            maxAge: 60 * 60 * 24 * 7, // 7日間
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });

        return response;
    } catch (error: any) {
        console.error('Stripeの顧客ID取得中にエラーが発生しました:', error);
        return NextResponse.json(
            { error: { message: error.message } },
            { status: 500 }
        );
    }
}