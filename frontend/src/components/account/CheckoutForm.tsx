// frontend/src/components/account/CheckoutForm.tsx
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface CheckoutFormProps {
    clientSecret: string;
    onSuccess: () => void;
    onError: (error: string) => void;
}

export const CheckoutForm = ({ clientSecret, onSuccess, onError }: CheckoutFormProps) => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement)!,
            }
        });

        if (error) {
            onError(error.message || '支払い処理に失敗しました');
        } else {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 border rounded-lg">
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                                color: '#aab7c4',
                            },
                        },
                        invalid: {
                            color: '#9e2146',
                        },
                    },
                    hidePostalCode: true
                }} />
            </div>
            <button
                type="submit"
                disabled={!stripe}
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
                支払いを確定する
            </button>
        </form>
    );
};