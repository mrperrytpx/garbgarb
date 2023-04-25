import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getProviders, signIn } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import Image from "next/image";
import { useRouter } from "next/router";
import { TextLogoNoClothing } from "../../components/Logos";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import { LoadingSpinner } from "../../components/LoadingSpinner";

type ValidatedLoginForm = z.infer<typeof loginValidationSchema>;

const loginValidationSchema = z.object({
    email: z.string().email().min(1, "Required"),
});

export default function SignIn({
    providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter();
    const { error } = router.query;

    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm<ValidatedLoginForm>({
        resolver: zodResolver(loginValidationSchema),
    });

    // config provider order matters
    const allProviders = Object.values(providers).slice(1);

    const onSubmit = handleSubmit((data) => {
        setIsLoading(true);
        signIn("email", {
            email: data.email,
            callbackUrl: "/",
        });
    });

    return (
        <>
            <Head>
                <title>GarbGarb - Sign In</title>
            </Head>
            <div className="mx-auto mt-4 w-full max-w-screen-xs flex-1  text-gray-200 lg:mt-20">
                <div className="mb-10 flex w-full flex-col items-center justify-start gap-8 rounded-lg p-4">
                    <div className="flex w-full flex-col items-center gap-2">
                        <div className="w-full min-w-[min(95%,500px)]">
                            <TextLogoNoClothing />
                        </div>
                        {error === "SessionRequired" && (
                            <p className="text-sm">
                                <u>
                                    Please <strong>Sign In</strong> to access this page.
                                </u>
                            </p>
                        )}
                        {error === "OAuthAccountNotLinked" && (
                            <p className="text-sm">
                                <u> This email is already linked to another account.</u>
                            </p>
                        )}
                        {error === "Default" && (
                            <p className="text-sm text-red-600">Something is wrong... Try again.</p>
                        )}
                    </div>
                    <form
                        method="post"
                        action="/api/auth/signin/email"
                        onSubmit={onSubmit}
                        className="flex w-full flex-col gap-2"
                    >
                        <div className="flex w-full flex-col gap-1">
                            <label className="pl-1 text-sm font-semibold" htmlFor="email">
                                Email
                            </label>
                            <input
                                style={{
                                    borderColor: errors.email
                                        ? "rgb(220 38 38)"
                                        : "rgb(107 114 128)",
                                }}
                                {...register("email")}
                                className="h-10 w-full rounded-md border border-slate-500 bg-black p-2 text-sm font-medium focus:bg-slate-200 focus:text-black"
                                type="email"
                                id="email"
                                name="email"
                                required
                                placeholder="john.doe@foo.com"
                            />
                            {errors.email && (
                                <span className="pl-1 text-xs font-semibold text-red-500">
                                    {errors.email.message}
                                </span>
                            )}
                        </div>
                        <button
                            disabled={isLoading}
                            type="submit"
                            className="h-10 animate-hop rounded-lg border border-slate-500 bg-black p-2 text-sm font-medium text-gray-200 shadow-sm shadow-slate-500 enabled:hover:bg-slate-200 enabled:hover:text-black enabled:focus:bg-slate-200 enabled:focus:text-black disabled:opacity-50"
                        >
                            {isLoading ? <LoadingSpinner size={20} /> : "Sign in"}
                        </button>
                    </form>
                    <div className="relative flex w-full items-center justify-center text-xs">
                        <span className="absolute left-0 top-1/2 h-0.5 w-1/2 -translate-y-1/2 transform bg-slate-500" />
                        <span className="z-10 bg-zinc-950 p-2">OR</span>
                        <span className="absolute right-0 top-1/2 h-0.5 w-1/2 -translate-y-1/2 transform bg-slate-500" />
                    </div>
                    {allProviders.map((provider) => (
                        <button
                            key={provider.id}
                            className="mb-2 flex h-[40px] w-full items-center justify-center gap-2 rounded-lg border-2 border-[#4285F4] bg-[#4285F4] text-sm hover:border-slate-200 hover:bg-white hover:text-black"
                            onClick={() => signIn(provider.id)}
                        >
                            <div className="rounded-sm bg-white p-2">
                                <Image
                                    className="h-[18px] w-[18px]"
                                    src="https://authjs.dev/img/providers/google.svg"
                                    alt="Google Logo"
                                    width={18}
                                    height={18}
                                />
                            </div>
                            <span className="google pr-2">Sign in with {provider.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerSession(context.req, context.res, authOptions);

    // If the user is already logged in, redirect.
    // Note: Make sure not to redirect to the same page
    // To avoid an infinite loop!
    if (session) {
        return { redirect: { destination: "/" } };
    }

    const providers = await getProviders();

    return {
        props: { providers: providers ?? [] },
    };
}
