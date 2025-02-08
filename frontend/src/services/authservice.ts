import { auth } from "@/src/utils/firebase/firebase";
import { Teacher } from '@/src/lib/interfaces';
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import toast from 'react-hot-toast';
import { updateTeacher } from '@/src/utils/actions/update_teacher';
import { deleteTeacher } from '@/src/utils/actions/delete_teacher';
import { getIdToken } from 'firebase/auth';

// メールアドレスを更新
export const handleEmailUpdate = async (user: any, email: string, teacher: Teacher) => {
    try {
        const password = prompt("現在のパスワードを入力してください");
        if (!password) return;

        const credential = EmailAuthProvider.credential(user.email!, password);
        await reauthenticateWithCredential(user, credential);
        await updateEmail(auth.currentUser!, email);
        toast.success("メールアドレスを更新しました。");
        const idToken = await getIdToken(user);
        const result = await updateTeacher(idToken, teacher.name, email);
        if (result.success && result.data) {
            updateStripeUserData(result.data);
        } else {
            throw new Error(result.error || 'Failed to update teacher');
        }
    } catch (error) {
        console.error(error);
        toast.error("メールアドレスの更新に失敗しました。");
    }
};

// パスワードリセット
export const handleResetPassword = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
        toast.success("パスワードリセットリクエストを受け付けました。");
    } catch (error) {
        console.error(error);
        toast.error("パスワードリセットリクエストに失敗しました。");
    }
};

// ログアウト処理
export const handleLogout = async (router: ReturnType<typeof useRouter>) => {
    try {
        // まずサーバーサイドのセッションを削除
        const response = await fetch('/api/auth/session', {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete session');
        }

        // Firebaseからサインアウト
        await auth.signOut();
        router.push('/');
        toast.success('ログアウトしました。');
    } catch (error) {
        console.error(error);
        toast.error('ログアウトに失敗しました。');
    }
};

// 退会（アカウント削除）処理
export const handleDeleteAccount = async function(router: ReturnType<typeof useRouter>, user: any, teacher: Teacher, onDeleteAccount: () => Promise<void>) {
    try {
        const reply = confirm("アカウントを削除すると復元することはできません。本当に削除してもよろしいですか?");
        if (!reply) return;

        // 再認証のためのパスワード入力
        const password = prompt("セキュリティのため、現在のパスワードを入力してください");
        if (!password) return;

        // ユーザーを再認証
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);

        const formData = new FormData();
        formData.append('id', teacher.id.toString());

        // Delete from backend first
        const result = await deleteTeacher(formData);
        if (!result || result.error) {
            throw new Error(result?.error || '教師の削除に失敗しました');
        }

        // Delete from Firebase Auth
        await user.delete();
        
        toast.success('アカウントを削除しました。');
        
        // Server Actionを呼び出し
        try {
            await onDeleteAccount();
        } catch (error: any) {
            // NEXT_REDIRECTエラーは正常な動作なので無視
            if (!error.digest?.startsWith('NEXT_REDIRECT')) {
                throw error;
            }
        }
    } catch (error) {
        console.error('Account deletion error:', error);
        if (error instanceof Error) {
            toast.error(`アカウントの削除に失敗しました: ${error.message}`);
        } else {
            toast.error('アカウントの削除に失敗しました。');
        }
    }
};

// Stripe ユーザーデータを更新
export const updateStripeUserData = async (teacher: Teacher): Promise<Teacher | null> => {
    try {
        const res = await fetch('/api/stripe/update-customer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'cookie': `customerId=${teacher.stripe_id}`
            },
            body: JSON.stringify({
                email: teacher.email
            }),
        });
        if (!res.ok) throw new Error('Failed to update stripe user data');
        return await res.json();
    } catch (error) {
        console.error('Failed to update stripe user data', error);
        return null;
    }
}