import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react';

import { auth } from "@/src/utils/firebase/firebase"
import { sendPasswordResetEmail } from "firebase/auth"

// ResetPasswordModalProps
type ResetPasswordModalProps = {
    show: boolean;
    handleClose: () => void;
    handleShow: () => void;
}

export function ResetPasswordModal(props: ResetPasswordModalProps) {

    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');

    const handleReset = async () => {
        if (email !== confirmEmail) {
            props.handleClose();
            toast.error("メールアドレスが一致しません！")
            return;
        }

        await sendPasswordResetEmail(auth, email)

        toast.success("パスワードリセットリクエストを受け付けました。");
        props.handleClose();
    };

    return (
        <>
            <div className="primary text-sm" onClick={props.handleShow}>
                パスワードを忘れた場合
            </div>

            <Dialog open={props.show} onClose={props.handleClose} className="fixed inset-0 flex items-center justify-center">
                <div className="fixed inset-0 bg-black/50 z-0" />
                <DialogPanel transition className="bg-white p-6 rounded shadow-lg max-w-md w-full backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0 z-10">
                    <DialogTitle className="text-lg font-medium">パスワードリセット</DialogTitle>
                    <Description className="mt-2">
                        <form>
                            <div className="mb-4">
                                <label htmlFor="formEmail" className="block text-sm font-medium text-gray-700">
                                    メールアドレス
                                </label>
                                <input
                                    id="formEmail"
                                    type="email"
                                    placeholder="Enter email"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="formConfirmEmail" className="block text-sm font-medium text-gray-700">
                                    メールアドレス（確認用）
                                </label>
                                <input
                                    id="formConfirmEmail"
                                    type="email"
                                    placeholder="Confirm email"
                                    value={confirmEmail}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmEmail(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </form>
                    </Description>
                    <div className="form-control mt-6">
                        <button className="btn btn-primary" type="submit" onClick={handleReset}>リセット</button>
                    </div>
                </DialogPanel>
            </Dialog>
            <Toaster />
        </>
    );
}

export default ResetPasswordModal;
