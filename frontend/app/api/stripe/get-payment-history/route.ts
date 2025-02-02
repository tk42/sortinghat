import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/src/utils/stripe/stripe';
import { auth } from '@/src/utils/firebase/admin';
import Stripe from 'stripe';

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
        // console.log('Decoded Firebase token:', decodedToken.uid);

        // リクエストボディからcustomerIdを取得
        const { customerId } = await req.json();
        if (!customerId) {
            return NextResponse.json(
                { error: { message: '顧客IDが必要です' } },
                { status: 400 }
            );
        }
        // console.log('Customer ID:', customerId);

        // まず顧客情報を取得して検証
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        // console.log('Customer metadata:', customer.metadata);
        // console.log('Firebase UID from token:', decodedToken.uid);

        if ((customer as any).deleted) {
            return NextResponse.json(
                { error: { message: '顧客が見つかりません' } },
                { status: 404 }
            );
        }

        // 顧客のFirebase UIDがない場合は、更新する
        if (!customer.metadata.firebaseUID) {
            await stripe.customers.update(customerId, {
                metadata: {
                    firebaseUID: decodedToken.uid
                }
            });
            // console.log('Updated customer metadata with Firebase UID');
        }
        // 顧客のFirebase UIDを確認
        else if (customer.metadata.firebaseUID !== decodedToken.uid) {
            console.error('Firebase UID mismatch:', {
                customerUID: customer.metadata.firebaseUID,
                tokenUID: decodedToken.uid
            });
            return NextResponse.json(
                { error: { message: '不正なアクセスです' } },
                { status: 403 }
            );
        }

        // 支払い履歴を取得
        const paymentIntents = await stripe.paymentIntents.list({
            customer: customerId,
            limit: 10, // 直近10件の履歴を取得
        });

        // 成功した支払いのみを抽出
        const payments = paymentIntents.data
            .filter(payment => payment.status === 'succeeded')
            .slice(0, 10) // 最新の10件のみを返す
            .map(payment => ({
                id: payment.id,
                amount: payment.amount,
                status: payment.status,
                created: payment.created,
                currency: payment.currency
            }));

        return NextResponse.json({ payments });
    } catch (error: any) {
        console.error('支払い履歴の取得中にエラーが発生しました:', error);
        return NextResponse.json(
            { error: { message: error.message || 'サーバーエラーが発生しました' } },
            { status: 500 }
        );
    }
}