import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AccountPageClient from '@/src/components/account/AccountPageClient';
import { auth } from "@/src/utils/firebase/firebase";

async function handleLogout() {
    'use server';
    
    try {
        // Firebaseのセッションを終了
        await auth.signOut();
        
        // auth-tokenクッキーを削除 -> middleware が login ページに飛ばしてくれる
        const cookieStore = cookies();
        cookieStore.delete('auth-token');
    } catch (error) {
        console.error('Logout failed:', error);
        throw error;
    }
}

async function handleDeleteAccount() {
    'use server';
    
    try {
        const cookieStore = cookies();
        const authToken = cookieStore.get('auth-token')?.value;
        
        if (!authToken) {
            throw new Error('認証トークンが見つかりません');
        }
        
        // auth-tokenクッキーを削除
        cookieStore.delete('auth-token');
        
        // トップページへリダイレクト
        redirect('/');
    } catch (error) {
        console.error('Account deletion failed:', error);
        throw error;
    }
}

export default async function AccountPage() {
    return <AccountPageClient 
        showPaymentColumn={false}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
    />;
}