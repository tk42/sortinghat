import { useLoginForm } from "@/src/hooks/useLoginForm";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";


export default function LoginForm() {
    const { register, onSubmit, errors } = useLoginForm();

    return (
        <form
            onSubmit={onSubmit}
        >
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
                    autoComplete="current-password"
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

            <div className="form-control mt-6">
                <button className="btn btn-primary" type="submit">ログイン</button>
            </div>
        </form>
    );
}