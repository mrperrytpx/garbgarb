import React from "react";
import { LinkButton } from "../../components/LinkButton";
import { BsFillEnvelopeFill } from "react-icons/bs";

const VerifyRequestPage = () => {
    return (
        <div className="m-auto w-full max-w-screen-sm flex-1 p-4 text-gray-200">
            <div className="mb-20 flex w-full flex-col items-center gap-4 rounded-lg bg-black p-4 py-8 text-center">
                <div className="flex w-full flex-col items-center justify-center">
                    <BsFillEnvelopeFill size="80" />
                    <h1 className="text-2xl uppercase">
                        <strong>Check your email</strong>
                    </h1>
                </div>
                <p>A sign in link has been sent to your email address.</p>
                <LinkButton
                    className="mt-2 w-full border-slate-500 bg-zinc-950 shadow-sm shadow-slate-500 hover:bg-slate-200 hover:text-black focus:bg-slate-200 focus:text-black sm:w-60"
                    href="/"
                >
                    Back to Homepage
                </LinkButton>
            </div>
        </div>
    );
};

export default VerifyRequestPage;
