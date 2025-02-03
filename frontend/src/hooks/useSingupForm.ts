import toast from 'react-hot-toast';
import { SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import {
  signUpFormSchema,
  SignUpFormSchemaType,
} from "@/src/utils/form/basicform";
import { zodResolver } from "@hookform/resolvers/zod";
import { auth } from "@/src/utils/firebase/firebase"
import { sendEmailVerification, ActionCodeSettings, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"

export const useSignupForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormSchemaType>();

  const isValid: SubmitHandler<SignUpFormSchemaType & { name: string }> = async (data: SignUpFormSchemaType & { name: string }) => {
    const { email, password, name } = data;
    try {
      const actionCodeSettings: ActionCodeSettings = {
        url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000' + '/login',
        handleCodeInApp: true,
      };

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // displayNameを設定
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // メール確認を送信
      await sendEmailVerification(userCredential.user, actionCodeSettings);
      toast.success("確認メールを送信しました。メールを確認後、ログインしてください。");

    } catch (error: any) {
      if (error.toString().includes("auth/email-already-in-use")) {
        toast.error("このメールアドレスは既に使用されています。")
        return;
      }
      if (error.toString().includes("auth/invalid-email")) {
        toast.error("メールアドレスの形式が正しくありません。");
        return;
      }
      console.error("エラー:", error);
      toast.error("エラーが発生しました。");
    }
  };

  const isInValid: SubmitErrorHandler<SignUpFormSchemaType & { name: string }> = async (errors: any) => {
    console.error("エラー:", errors);
    toast.error("エラーが発生しました。");
  };

  return {
    register,
    onSubmit: handleSubmit(isValid, isInValid),
    errors,
  };
};
