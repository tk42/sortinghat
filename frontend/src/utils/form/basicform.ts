import { z } from "zod";

export const signUpFormSchema = z.object({
    name: z.string().min(1, { message: "名前を入力してください" }),
    email: z.string().min(1, { message: "メールアドレスを入力してください" }),
    password: z
        .string()
        .min(6, { message: "6桁以上のパスワードを入力してください" })
        .regex(/^[a-zA-Z0-9]+$/, {
            message: "英大文字、英小文字、数字で入力してください",
        }),
});

export type SignUpFormSchemaType = z.infer<typeof signUpFormSchema>;


export const LoginFormSchema = z.object({
    email: z.string().min(1, { message: "メールアドレスを入力してください" }),
    password: z
        .string()
        .min(6, { message: "6桁以上のパスワードを入力してください" })
        .regex(/^[a-zA-Z0-9]+$/, {
            message: "英大文字、英小文字、数字で入力してください",
        }),
});

export type LoginFormSchemaType = z.infer<typeof LoginFormSchema>;
