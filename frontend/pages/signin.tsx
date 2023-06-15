import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface LoginForm {
  email: string;
  password: string;
}

export default function Page() {
  const router = useRouter();
  const isValid: SubmitHandler<LoginForm> = (data: LoginForm) => {
    // Login with Azure Active Directory
    signIn("azure-ad", {
      email: data.email,
      password: data.password,
      callbackUrl: "/", // ログイン後に遷移するURL
    });
  };
  const isInValid: SubmitErrorHandler<LoginForm> = (errors: any) => {
    console.log(errors);
    console.log("Fail Login");
  };
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  return (
    <>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col text-center">
          <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <div className="card-body">
              <Image src="/logo.png" width={256} height={256} alt="Synergy MatchMaker" />

              <form
                onSubmit={handleSubmit(isValid, isInValid)}
              >
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    {...register("email", { required: "emailを入力してください" })}
                    type="text" placeholder="email" className="input input-bordered" />
                  {errors.email && (
                    <div
                      className="flex rounded-lg bg-red-100 p-4 dark:bg-red-200"
                      role="alert"
                    >
                      <div className="h-5 w-5 flex-shrink-0 text-red-700 dark:text-red-800" >
                        <ExclamationCircleIcon />
                      </div>
                      <div className="ml-3 text-sm font-medium text-red-700 dark:text-red-800">
                        {errors.email.message}
                      </div>
                    </div>
                  )}
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <input
                    {...register("password", {
                      required: "passwordを入力してください",
                      minLength: { value: 8, message: "8文字以上入力してください" },
                    })}
                    type="password" placeholder="password" className="input input-bordered" />
                  {errors.password && (
                    <div
                      className="flex rounded-lg bg-red-100 p-4 dark:bg-red-200"
                      role="alert"
                    >
                      <div className="h-5 w-5 flex-shrink-0 text-red-700 dark:text-red-800" >
                        <ExclamationCircleIcon />
                      </div>
                      <div className="ml-3 text-sm font-medium text-red-700 dark:text-red-800">
                        {errors.password.message}
                      </div>
                    </div>
                  )}
                  {/*
                  Azure AD とパスワード共通なのでここでPassword変更できないほうが良い
                <label className="label">
                  <a href="#" className="label-text-alt link link-hover">Forgot password?</a>
                </label>
                */}
                </div>
                <div className="form-control mt-6">
                  <button className="btn btn-primary" type="submit">Login</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div >
    </>
  );
}
