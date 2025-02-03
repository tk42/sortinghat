import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/src/utils/stripe/stripe';
import { parse } from 'cookie';

export async function POST(req: NextRequest) {
    const cookies = parse(req.headers.get('cookie') || '');
    const customerId = cookies.customer;

    if (!customerId) {
        return NextResponse.json(
            { error: 'Customer ID not found' },
            { status: 400 }
        );
    }

    const { newEmail } = await req.json();

    try {
        // Stripeの顧客情報を更新
        const customer = await stripe.customers.update(customerId, {
            email: newEmail,
        });
        return NextResponse.json({ message: 'Email updated successfully', customer });
    } catch (error) {
        console.error('Error updating email:', error);
        return NextResponse.json({ error: 'Failed to update email' }, { status: 500 });
    }
}