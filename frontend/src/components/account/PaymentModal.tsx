import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutForm } from './CheckoutForm';

const stripePromise = loadStripe(`${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!}`);

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientSecret: string;
    onSuccess: () => void;
    onError: (error: string) => void;
}

const PaymentModal = ({ 
    isOpen, 
    onClose, 
    clientSecret,
    onSuccess,
    onError 
}: PaymentModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">カード情報を入力</h3>
                <Elements stripe={stripePromise}>
                    <CheckoutForm 
                        clientSecret={clientSecret}
                        onSuccess={() => {
                            onSuccess();
                            onClose();
                        }}
                        onError={onError}
                    />
                </Elements>
                <button
                    onClick={onClose}
                    className="mt-4 w-full px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                >
                    キャンセル
                </button>
            </div>
        </div>
    );
};

export default PaymentModal;