import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getProviders, signIn } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import Image from "next/image";
import { useRouter } from "next/router";
import { TextLogoNoClothing } from "../../components/Logos";

export default function SignIn({
    providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter();
    const { error } = router.query;

    // config provider order matters
    const allProviders = Object.values(providers).slice(1);
    const emailProvider = Object.values(providers)[0];

    return (
        <div className="mx-auto mt-4 flex w-full max-w-screen-xs flex-1 items-start justify-start text-white">
            <div className="flex w-full flex-col items-center justify-start gap-8 rounded-lg bg-gray-900 p-2 py-16">
                <div className="flex flex-col items-center gap-2">
                    <div className="min-w-[min(95%,500px)]">
                        <TextLogoNoClothing />
                    </div>
                    {error === "SessionRequired" && (
                        <p className="text-sm">
                            Please <strong>Sign In</strong> to access this page.
                        </p>
                    )}
                    {error === "OAuthAccountNotLinked" && (
                        <p className="text-sm">This email is already linked to another account.</p>
                    )}
                    {error === "Default" && (
                        <p className="text-sm">Something is wrong... Try reloading the page.</p>
                    )}
                </div>
                <form
                    onSubmit={() => signIn(emailProvider.id)}
                    className="flex w-full flex-col gap-4"
                >
                    <div className="flex w-full flex-col gap-1">
                        <label className="px-2" htmlFor="email">
                            <strong>Email</strong>
                        </label>
                        <input
                            required
                            className="h-[40px] rounded-lg px-2 text-sm font-medium text-black"
                            type="email"
                            id="email"
                            name="email"
                            placeholder="john.doe@foo.com"
                        />
                    </div>
                    <button
                        type="submit"
                        className="animate-hop rounded-lg bg-gray-600 p-2 font-medium text-gray-300"
                    >
                        Sign in
                    </button>
                </form>
                <p className="text-sm">
                    <strong>OR</strong>
                </p>
                {allProviders.map((provider) => (
                    <button
                        key={provider.id}
                        className="flex h-[40px] w-full items-center justify-center gap-2 rounded-lg border-2 border-[#4285F4] bg-[#4285F4] text-sm"
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
