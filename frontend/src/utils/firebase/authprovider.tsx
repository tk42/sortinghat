"use client";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useReducer,
    Dispatch,
} from 'react';
import { onAuthStateChanged, User, getIdToken, signInWithCustomToken } from '@firebase/auth';
import { auth } from './firebase';
import { createTeacher } from '@/src/utils/actions/create_teacher';
import { findTeacher } from '@/src/utils/actions/fetch_teacher';
import { Teacher } from '@/src/lib/interfaces';

// アクションタイプの定義
type AuthAction = 
    | { type: 'SET_USER'; payload: User | null }
    | { type: 'SET_TEACHER'; payload: Teacher | null }
    | { type: 'SET_INITIALIZING'; payload: boolean };

// 状態の型定義
interface AuthState {
    user: User | null;
    teacher: Teacher | null;
    initializing: boolean;
}

const initialState: AuthState = {
    user: null,
    teacher: null,
    initializing: true,
};

// 状態更新用のリデューサー
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload };
        case 'SET_TEACHER':
            return { ...state, teacher: action.payload, initializing: false };
        case 'SET_INITIALIZING':
            return { ...state, initializing: action.payload };
        default:
            return state;
    }
};

// AuthContextの作成
const AuthContext = createContext<{ state: AuthState; dispatch: Dispatch<AuthAction> }>({
    state: initialState,
    dispatch: () => null,
});

type Props = { children: ReactNode };

export const AuthProvider = ({ children }: Props) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    
    useEffect(() => {
        // セッションCookieからカスタムトークンを取得してFirebase Authにサインイン
        (async () => {
            try {
                const res = await fetch('/api/auth/session');
                const data = await res.json();
                if (data.customToken) {
                    await signInWithCustomToken(auth, data.customToken);
                }
            } catch (error) {
                console.error('Error restoring session:', error);
            }
        })();

        const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
            dispatch({ type: 'SET_USER', payload: user });
    
            if (user?.email && user.emailVerified) {
                const idToken = await getIdToken(user);
    
                if (!idToken) {
                    alert('Failed to get ID token');
                    dispatch({ type: 'SET_INITIALIZING', payload: false });
                    return;
                }
    
                // セッションAPIを呼び出してセッションクッキーを設定
                try {
                    const response = await fetch('/api/auth/session', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ idToken }),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to create session');
                    }

                    // Teacherの情報を取得
                    const teacherResponse = await findTeacher(idToken);

                    if (!teacherResponse.success || !teacherResponse.data) {
                        // メール確認後の最初のログイン時のみ実行
                        // console.warn('FOUND A FRESH LOGIN', JSON.stringify(teacherResponse))

                        try {
                            // まずStripe customerを作成
                            const response = await fetch('/api/stripe/create-customer', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${idToken}`,
                                },
                                body: JSON.stringify({ email: user.email || '' }),
                            });

                            if (!response.ok) {
                                throw new Error(`Failed to create Stripe customer: ${response.status}`);
                            }

                            const data = await response.json();
                            if (!data.customerId) {
                                throw new Error('No customer ID received from Stripe');
                            }

                            const { customerId } = data;

                            // Teacherを作成（Stripe IDを含める）
                            const createTeacherResponse = await createTeacher(
                                user.displayName || user.email!.split('@')[0], // displayNameがない場合のみメールアドレスから生成
                                user.email || '',
                                customerId,
                                idToken
                            );

                            if (!createTeacherResponse.success) {
                                throw new Error('Failed to create teacher');
                            }

                            dispatch({ type: 'SET_TEACHER', payload: createTeacherResponse.data as Teacher });
                        } catch (error) {
                            console.error('Error in creating teacher with stripe:', error);
                            if (error instanceof Error) {
                                console.error('Error details:', error.message);
                            }
                            dispatch({ type: 'SET_INITIALIZING', payload: false });
                        }
                    } else {
                        dispatch({ type: 'SET_TEACHER', payload: teacherResponse.data as Teacher });
                    }
                } catch (error) {
                    console.error('Error in auth state change:', error);
                    dispatch({ type: 'SET_INITIALIZING', payload: false });
                }
            } else {
                dispatch({ type: 'SET_TEACHER', payload: null });
                dispatch({ type: 'SET_INITIALIZING', payload: false });
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};

// AuthContextを使用するカスタムフック
export const useAuthContext = () => useContext(AuthContext);