"use client"

import React, { Suspense, useState } from "react";
import Image from "next/image";
import { Toaster } from 'react-hot-toast';
import { Container as Loading } from "@/src/components/Common/Loading";
import SignupForm from "@/src/components/login/SignupForm";
import LoginForm from "@/src/components/login/LoginForm";
import { ResetPasswordModal } from "@/src/components/login/ResetPasswordModal";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

const LOGIN_TAB = { name: 'ログイン' }
const SIGNUP_TAB = { name: '新規登録' }

const tabs = (process.env.NODE_ENV === "production" && process.env.STRIPE_SECRET_KEY?.startsWith("pk_live_")) ? [LOGIN_TAB, SIGNUP_TAB] : [LOGIN_TAB]


function PageContent() {
  const [tabIndex, setTabIndex] = useState(0);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col text-center">
        <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
            <Image 
              src="/logo.png" 
              width={256} 
              height={256} 
              alt="Synergy MatchMaker" 
              priority 
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <div className="hidden sm:block">
              <div className="border-b border-gray-200">
                <nav aria-label="Tabs" className="-mb-px flex justify-center">
                  {tabs.map((tab, index) => (
                    <span
                      key={tab.name}
                      aria-current={index === tabIndex ? 'page' : undefined}
                      className={classNames(
                        index === tabIndex
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                        'w-1/2 border-b-2 px-1 py-4 text-center text-sm font-medium',
                      )}
                      onClick={() => setTabIndex(index)}
                    >
                      {tab.name}
                    </span>
                  ))}
                </nav>
              </div>
            </div>

            {
              tabIndex === 0 ? <LoginForm /> : <SignupForm />
            }

            <div className="text-center mt-6">
              <ResetPasswordModal show={show} handleClose={handleClose} handleShow={handleShow} />
            </div>
            <Toaster />
          </div>
        </div>
      </div>
    </div >
  )
}

export default function LoginPage() {

  return (
    <Suspense fallback={<Loading />}>
      <PageContent />
    </Suspense>
  );
}