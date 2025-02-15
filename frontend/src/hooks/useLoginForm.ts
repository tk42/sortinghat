import toast from 'react-hot-toast';
import { SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import {
  LoginFormSchema,
  LoginFormSchemaType,
} from "@/src/utils/form/basicform";
import { zodResolver } from "@hookform/resolvers/zod";
import { auth } from "@/src/utils/firebase/firebase"

import { signInWithEmailAndPassword } from "firebase/auth"


export const useLoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormSchemaType>({
    resolver: zodResolver(LoginFormSchema),
  });

  const isValid: SubmitHandler<LoginFormSchemaType> = async (data: LoginFormSchemaType) => {
    const { email, password } = data;
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      if (!userCredential.user.emailVerified) {
        toast.error("メール認証が完了していません。");
        return;
      }

      // IDトークンを取得
      const idToken = await userCredential.user.getIdToken(true);
      
      // セッションAPIを呼び出してセッションクッキーを設定
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
      
      toast.success("ログイン完了！");
      
      // セッションが確立された後に画面遷移
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);

    } catch (error: any) {
      if (error.toString().includes('auth/user-not-found')) {
        toast.error("ユーザーが見つかりません。");
        return
      }
      if (error.toString().includes("wrong-password")) {
        toast.error("パスワードが違います。");
        return
      }
      console.error("エラー:", error);
      toast.error("エラーが発生しました。");
    }
  };
  const isInValid: SubmitErrorHandler<LoginFormSchemaType> = async (errors: any) => {
    console.error("エラー:", errors);
    toast.error("エラーが発生しました。");
  };

  return {
    register,
    onSubmit: handleSubmit(isValid, isInValid),
    errors,
  };
};
