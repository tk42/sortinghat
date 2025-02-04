'use client';

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Toaster } from 'react-hot-toast';
import { getIdToken } from '@firebase/auth';
import { useAuthContext } from '@/src/utils/firebase/authprovider';
import { Container as Loading } from '@/src/components/Common/Loading';
import { handleEmailUpdate, handleResetPassword, handleDeleteAccount } from '@/src/services/authservice';
import { updateTeacher } from '@/src/utils/actions/update_teacher';
import toast from 'react-hot-toast';
import { Price, PaymentHistory, Subscription } from '@/src/lib/interfaces';
import PaymentModal from '@/src/components/account/PaymentModal';

interface AccountPageClientProps {
    onLogout: () => Promise<void>;
    onDeleteAccount: () => Promise<void>;
}

export default function AccountPageClient({ onLogout, onDeleteAccount }: AccountPageClientProps) {
    const router = useRouter();
    const { state } = useAuthContext();
    const [name, setName] = useState(state.teacher?.name || '');
    const [email, setEmail] = useState(state.user?.email || '');
    const [coupon, setCoupon] = useState('');
    const [prices, setPrices] = useState<Price[]>([]);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentClientSecret, setPaymentClientSecret] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleTeacherName = async (name: string) => {
        if (!state.user) {
            return;
        }
        try {
            const idToken = await getIdToken(state.user);
            const result = await updateTeacher(idToken, name, state.teacher?.email || '');
            if (result.success) {
                toast.success('更新しました');
            } else {
                toast.error(result.error || '更新に失敗しました');
            }
        } catch (error) {
            console.error('Failed to update teacher:', error);
            toast.error('更新に失敗しました');
        }
    }

    const handleSignOut = async () => {
        try {
            await onLogout();
            toast.success('ログアウトしました');
        } catch (error) {
            console.error('Failed to logout:', error);
            toast.error('ログアウトに失敗しました');
        }
    };

    useEffect(() => {
        const initialize = async () => {
            if (!state.user) {
                setIsInitialLoading(false);
                return;
            }

            try {
                const idToken = await getIdToken(state.user);

                // プラン一覧の取得
                const pricesResponse = await fetch('/api/stripe/get-prices', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!pricesResponse.ok) {
                    const errorData = await pricesResponse.json();
                    console.error('Failed to fetch prices:', errorData);
                    throw new Error(errorData.error?.message || 'プラン情報の取得に失敗しました');
                }

                const pricesData = await pricesResponse.json();
                
                if (pricesData.prices && Array.isArray(pricesData.prices)) {
                    const formattedPrices = pricesData.prices.map((price: any) => ({
                        id: price.id,
                        product: price.product.name || '不明なプラン',
                        unit_amount: price.unit_amount,
                        recurring: price.recurring,
                        currency: price.currency
                    }));
                    setPrices(formattedPrices);
                }

                // 教師データとstripe_idが存在する場合のみサブスクリプション状態を取得
                if (state.teacher?.stripe_id) {
                    const subResponse = await fetch('/api/stripe/subscription-status', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${idToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            customerId: state.teacher.stripe_id
                        })
                    });

                    if (!subResponse.ok) {
                        const errorData = await subResponse.json();
                        console.error('Failed to fetch subscription:', errorData);
                        throw new Error(errorData.error?.message || 'サブスクリプション情報の取得に失敗しました');
                    }

                    const subData = await subResponse.json();
                    
                    if (subData.subscriptions && subData.subscriptions.length > 0) {
                        const latestSubscription = subData.subscriptions[0];
                        setSubscription({
                            id: latestSubscription.id,
                            status: latestSubscription.status,
                            current_period_end: latestSubscription.current_period_end,
                            pause_collection: latestSubscription.pause_collection
                        });

                        // サブスクリプションがアクティブな場合、支払い履歴を取得
                        if (latestSubscription.status === 'active') {
                            const paymentResponse = await fetch('/api/stripe/get-payment-history', {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${idToken}`,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    customerId: state.teacher.stripe_id
                                })
                            });

                            if (paymentResponse.ok) {
                                const paymentData = await paymentResponse.json();
                                setPaymentHistory(paymentData.payments || []);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
                setError(error instanceof Error ? error.message : 'データの取得に失敗しました');
            } finally {
                setIsInitialLoading(false);
            }
        };

        initialize();
    }, [state.user, state.teacher]);

    // Early return for loading state
    if (isInitialLoading) {
        return <Loading />;
    }

    // Early return for unauthorized state
    if (!state.user || !state.teacher) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    const handleAccountDeletion = async () => {
        try {
            if (!state.teacher) {
                toast.error('教師情報が見つかりません。');
                return;
            }
            await handleDeleteAccount(router, state.user, state.teacher, onDeleteAccount);
        } catch (error) {
            console.error('Account deletion failed:', error);
            toast.error('アカウントの削除に失敗しました。');
        }
    };

    // サブスクリプションの中止
    const handlePauseSubscription = async () => {
        try {
            setIsProcessing(true);
            const idToken = await getIdToken(state.user!);
            
            const response = await fetch('/api/stripe/pause-subscription', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscriptionId: subscription?.id
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'サブスクリプションの中止に失敗しました');
            }

            toast.success('サブスクリプションを中止しました');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // サブスクリプションの再開
    const handleResumeSubscription = async () => {
        try {
            setIsProcessing(true);
            const idToken = await getIdToken(state.user!);
            
            const response = await fetch('/api/stripe/resume-subscription', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscriptionId: subscription?.id
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'サブスクリプションの再開に失敗しました');
            }

            toast.success('サブスクリプションを再開しました');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // サブスクリプションのステータスを日本語に変換する関数
    const getStatusInJapanese = (status: string): string => {
        switch (status) {
            case 'active':
                return '有効';
            case 'canceled':
                return '解約済み';
            case 'incomplete':
                return '未完了';
            case 'incomplete_expired':
                return '期限切れ';
            case 'past_due':
                return '支払い遅延';
            case 'trialing':
                return '試用期間中';
            case 'unpaid':
                return '未払い';
            default:
                return status;
        }
    };

    // Unix timestampを日付形式に変換する関数
    const formatDate = (timestamp: number): string => {
        const date = new Date(timestamp * 1000);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    const createSubscription = async (priceId: string, customerId: string) => {
        try {
            // サブスクリプションを作成
            const response = await fetch('/api/stripe/create-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ priceId }),
            });

            const data = await response.json();
            if (!response.ok) {
                toast.error(data.error?.message || 'サブスクリプションの作成に失敗しました');
                return;
            }

            // クライアントシークレットを保存し、モーダルを開く
            setPaymentClientSecret(data.clientSecret);
            setIsPaymentModalOpen(true);
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error.message || 'エラーが発生しました');
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow rounded-lg">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h1 className="text-2xl font-semibold text-gray-900">アカウント設定</h1>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Profile Sections */}
                            <div className="max-w-xl space-y-6">
                                {/* Profile Section */}
                                <section className="space-y-4">
                                    <h2 className="text-lg font-medium text-gray-900">プロフィール</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                名前
                                            </label>
                                            <div className="mt-1 flex items-center gap-x-3">
                                                <input
                                                    type="text"
                                                    id="name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder={state.teacher?.name!}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5"
                                                />
                                                <button
                                                    onClick={() => handleTeacherName(name)}
                                                    className="shrink-0 inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                >
                                                    更新
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                メールアドレス
                                            </label>
                                            <div className="mt-1 flex items-center gap-x-3">
                                                <input
                                                    type="email"
                                                    id="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder={state.user?.email!}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5"
                                                />
                                                <button
                                                    onClick={() => handleEmailUpdate(state.user, email, state.teacher!)}
                                                    className="shrink-0 inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                >
                                                    更新
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleResetPassword(email)}
                                            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                                        >
                                            パスワードリセット
                                        </button>
                                    </div>
                                </section>

                                {/* Account Actions */}
                                <section className="pt-4 border-t border-gray-200 space-y-4">
                                    <h2 className="text-lg font-medium text-gray-900">アカウント操作</h2>
                                    <div className="flex items-center gap-x-4">
                                        <button
                                            type="button"
                                            onClick={handleSignOut}
                                            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                                        >
                                            ログアウト
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleAccountDeletion}
                                            className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                                        >
                                            退会
                                        </button>
                                    </div>
                                </section>
                            </div>

                            {/* Right Column - Subscription Status */}
                            <div className="space-y-6">
                                <section>
                                    {subscription && (
                                        <div className="mb-4">
                                            <h3 className="font-semibold">現在のプラン</h3>
                                            <p>ステータス: {getStatusInJapanese(subscription.status)}</p>
                                            {subscription.current_period_end && (
                                                <p>有効期限: {formatDate(subscription.current_period_end)}</p>
                                            )}
                                            {subscription.pause_collection?.behavior === 'keep_as_draft' && (
                                                <p className="text-yellow-600">
                                                    ※ 次回の請求は一時停止されています
                                                </p>
                                            )}

                                            {/* サブスクリプション管理ボタン */}
                                            {subscription.status === 'active' && !subscription.pause_collection && (
                                                <button
                                                    onClick={handlePauseSubscription}
                                                    disabled={isProcessing}
                                                    className="mt-4 w-full px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                                                >
                                                    {isProcessing ? '処理中...' : 'プランを中止する'}
                                                </button>
                                            )}
                                            {subscription.status === 'active' && subscription.pause_collection?.behavior === 'keep_as_draft' && (
                                                <button
                                                    onClick={handleResumeSubscription}
                                                    disabled={isProcessing}
                                                    className="mt-4 w-full px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                                                >
                                                    {isProcessing ? '処理中...' : 'プランを再開する'}
                                                </button>
                                            )}

                                            {/* 購入履歴 */}
                                            {subscription.status === 'active' && paymentHistory.length > 0 && (
                                                <div className="mt-6">
                                                    <h3 className="font-semibold mb-4">購入履歴</h3>
                                                    <div className="space-y-3">
                                                        {paymentHistory.map((payment) => (
                                                            <div key={payment.id} className="border-b pb-3">
                                                                <div className="flex justify-between items-center">
                                                                    <div>
                                                                        <p className="text-sm text-gray-600">
                                                                            {new Date(payment.created * 1000).toLocaleDateString('ja-JP', {
                                                                                year: 'numeric',
                                                                                month: '2-digit',
                                                                                day: '2-digit'
                                                                            })}
                                                                        </p>
                                                                    </div>
                                                                    <p className="font-medium">
                                                                        {(payment.amount).toLocaleString()}円
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* 利用可能なプランの表示 - アクティブなサブスクリプションがない場合のみ表示 */}
                                    {(!subscription || subscription.status !== 'active') && (
                                        <>
                                            <h3 className="font-semibold">利用可能なプラン</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {prices.map((price) => (
                                                    <div key={price.id} className="border p-4 rounded-lg">
                                                        <h4 className="font-medium">{price.product}</h4>
                                                        <p className="text-lg font-bold">
                                                            {(price.unit_amount).toLocaleString()}円
                                                            {price.recurring?.interval === 'month' ? '/月' : '/年'}
                                                        </p>
                                                        <button
                                                            onClick={() => {
                                                                if (!state.teacher?.stripe_id) {
                                                                    toast.error('ユーザー情報が見つかりません');
                                                                    return;
                                                                }
                                                                createSubscription(
                                                                    price.id,
                                                                    state.teacher.stripe_id
                                                                );
                                                            }}
                                                            className="mt-2 w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                                        >
                                                            このプランを選択
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                clientSecret={paymentClientSecret}
                onSuccess={() => {
                    toast.success('サブスクリプションの作成に成功しました');
                    router.refresh();
                }}
                onError={(error) => toast.error(error)}
            />
            <Toaster />
        </main>
    );
}