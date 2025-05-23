"use client"

import Link from 'next/link';
import { useSignupForm } from "@/src/hooks/useSingupForm";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";


export default function SignupForm() {
    const { register, onSubmit, errors } = useSignupForm();

    return (
        <form
            onSubmit={onSubmit}
        >
            <div className="form-control mt-5">
                <input
                    {...register("name")}
                    type="text" 
                    placeholder="名前" 
                    className="input input-bordered" 
                    required 
                    name="name"
                />
                {errors.name && (
                    <div
                        className="flex rounded-lg bg-red-100 p-4 dark:bg-red-200"
                        role="alert"
                    >
                        <div className="h-5 w-5 flex-shrink-0 text-red-700 dark:text-red-800" >
                            <ExclamationCircleIcon />
                        </div>
                        <div className="ml-3 text-sm font-medium text-red-700 dark:text-red-800">
                            {errors.name.message}
                        </div>
                    </div>
                )}
            </div>
            <div className="form-control mt-5">
                <input
                    {...register("email")}
                    type="email" 
                    placeholder="email" 
                    className="input input-bordered" 
                    required 
                    name="email"
                    autoComplete="username"
                />
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
            <div className="form-control mt-5">
                <input
                    {...register("password")}
                    type="password" 
                    placeholder="password" 
                    className="input input-bordered" 
                    required 
                    name="password"
                    autoComplete="new-password"
                />
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
            </div>
            <div className="mt-5 text-xs text-gray-600">
                本サービスを利用しているユーザーは、<br />
                <Link href="/terms-of-services" className="underline">利用規約</Link>に同意したものとみなします
            </div>

            <div className="form-control mt-6">
                <button className="btn btn-primary" type="submit">新規登録</button>
            </div>
        </form>
    );
}