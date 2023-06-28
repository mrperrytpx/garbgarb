import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FiGithub, FiLinkedin, FiLogIn, FiLogOut, FiMenu } from "react-icons/fi";
import { BsShop } from "react-icons/bs";
import { usePathname } from "next/navigation";
import { CartIconWithNumber } from "../components/CartIconWithNumber";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import DefaultPic from "../../public/static/default.png";
import NextNProgress from "nextjs-progressbar";

import dynamic from "next/dynamic";
import { LoadingSpinner } from "../components/LoadingSpinner";

const Logo = dynamic(() => import("../components/Logos").then((mod) => mod.Logo), {
    loading: () => <LoadingSpinner size={30} />,
});

interface ILayoutProps {
    children: JSX.Element | JSX.Element[];
}

const Layout = ({ children }: ILayoutProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { data: session, status } = useSession();

    const pathname = usePathname();

    useEffect(() => setIsExpanded(false), [pathname]);

    return (
        <div className="flex min-h-screen flex-col">
            {/* Header */}
            <header className="sticky top-0 z-30 grid h-16 items-center border-b border-gray-700 bg-black px-4 text-gray-200">
                <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between">
                    <div className="flex items-center justify-center gap-4">
                        <Link
                            aria-label="Home page"
                            className="flex items-center justify-center rounded-lg text-3xl hover:animate-hop hover:bg-slate-200"
                            href="/"
                        >
                            <Logo />
                        </Link>
                        <Link
                            aria-label="Shop"
                            className="group hidden rounded-md p-2 hover:animate-hop hover:bg-slate-200 sm:inline"
                            href="/products"
                        >
                            <BsShop className="group-hover:fill-black" size="24" />
                        </Link>
                        {status === "loading" ? (
                            <div className="sm:hidden">
                                {" "}
                                <LoadingSpinner size={30} />
                            </div>
                        ) : null}
                        {session?.user && (
                            <Link
                                className="rounded-full p-0.5 hover:animate-hop hover:bg-slate-200 sm:hidden"
                                href="/my_orders"
                                aria-label="Profile"
                            >
                                <Image
                                    className="w-7 rounded-full bg-slate-200"
                                    width={100}
                                    height={100}
                                    src={session?.user?.image ?? DefaultPic}
                                    alt="User's profile"
                                />
                            </Link>
                        )}
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        {status === "loading" ? (
                            <div className="hidden sm:inline-block">
                                {" "}
                                <LoadingSpinner size={30} />
                            </div>
                        ) : null}
                        {session?.user && (
                            <Link
                                className="hidden rounded-full p-0.5 hover:animate-hop hover:bg-slate-200 sm:inline"
                                href="/my_orders"
                                aria-label="Profile"
                            >
                                <Image
                                    className="w-8 rounded-full bg-slate-200"
                                    width={100}
                                    height={100}
                                    src={session?.user?.image ?? DefaultPic}
                                    alt="User's profile"
                                />
                            </Link>
                        )}
                        {session?.user && (
                            <button
                                onClick={() => signOut()}
                                title="Sign out"
                                aria-label="Sign out"
                                className="group hidden rounded-md p-2 hover:animate-hop hover:bg-slate-200 sm:inline-block"
                            >
                                <FiLogOut className="group-hover:stroke-black" size="24" />
                            </button>
                        )}
                        {!session?.user && (
                            <button
                                onClick={() => signIn()}
                                title="Sign in"
                                aria-label="Sign in"
                                className="group hidden rounded-md p-2 hover:animate-hop hover:bg-slate-200 sm:inline-block"
                            >
                                <FiLogIn className="group-hover:stroke-black" size="24" />
                            </button>
                        )}
                        <Link aria-label="Cart" className="text-3xl" href="/cart">
                            <CartIconWithNumber />
                        </Link>
                        <button
                            aria-label="Menu"
                            onClick={() => setIsExpanded((old) => !old)}
                            className="select-none text-3xl sm:hidden"
                            role="button"
                        >
                            <FiMenu />
                        </button>
                    </div>
                </div>
            </header>
            <NextNProgress
                height={2}
                options={{
                    showSpinner: false,
                    trickle: true,
                }}
                color="rgb(209 213 219)"
                showOnShallow={false}
            />
            {/* Mobile Menu */}
            {isExpanded ? (
                <div className="flex h-[calc(max(600px,100svh)-64px)] flex-col items-center justify-center bg-black text-gray-200">
                    <div className="flex flex-1 flex-col items-center justify-center gap-6">
                        <Link
                            aria-label="Shop"
                            className="text-xl font-medium hover:animate-hop hover:underline  focus:underline"
                            href="/products"
                        >
                            Shop
                        </Link>
                        {session?.user && (
                            <Link
                                aria-label="Profile"
                                className="text-xl font-medium hover:animate-hop hover:underline  focus:underline"
                                href="/my_orders"
                            >
                                Profile
                            </Link>
                        )}
                        {session?.user && (
                            <button
                                onClick={() => signOut()}
                                title="Sign out"
                                aria-label="Sign out"
                                className="text-xl font-medium hover:animate-hop hover:underline  focus:underline"
                            >
                                Sign Out
                            </button>
                        )}
                        {!session?.user && (
                            <button
                                aria-label="Sign in"
                                onClick={() => signIn()}
                                title="Sign in"
                                className="text-xl font-medium hover:animate-hop hover:underline focus:underline"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                    <div className="mt-auto flex gap-4">
                        <a
                            className="group my-10 rounded-lg p-2 hover:animate-hop hover:bg-slate-200 "
                            target="_blank"
                            rel="noreferrer"
                            href="https://github.com/mrperrytpx/garbgarb"
                            aria-label="Github"
                        >
                            <FiGithub
                                className="group-hover:stroke-black"
                                size={32}
                                stroke="#D1D5DB"
                            />
                        </a>
                        <a
                            className="group my-10 rounded-lg p-2 hover:animate-hop hover:bg-slate-200 "
                            target="_blank"
                            rel="noreferrer"
                            href="https://www.linkedin.com/in/tomislav-siprak"
                            aria-label="LinkedIn"
                        >
                            <FiLinkedin
                                className="group-hover:stroke-black"
                                size={32}
                                stroke="#D1D5DB"
                            />
                        </a>
                    </div>
                </div>
            ) : (
                <>
                    <ErrorBoundary>
                        <main className="mx-auto flex min-h-[calc(100svh-64px)] w-full max-w-screen-2xl">
                            {children}
                        </main>
                    </ErrorBoundary>
                    {/* Footer */}
                    <footer className="border-t border-gray-700 bg-black px-2 text-gray-200 ">
                        <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-center gap-4 py-8">
                            <div className="flex w-full flex-col gap-4 md:flex-row md:justify-between">
                                <div className="flex flex-col items-center justify-center gap-4 p-2 md:flex-row md:gap-6">
                                    <Link
                                        className="border-black font-medium hover:animate-hop hover:underline focus:underline"
                                        href="/static/returns-faq"
                                    >
                                        Returns & FAQ
                                    </Link>
                                    <Link
                                        className="font-medium hover:animate-hop hover:underline focus:underline"
                                        href="/static/contact"
                                    >
                                        Contact
                                    </Link>
                                    <Link
                                        className="font-medium hover:animate-hop hover:underline focus:underline"
                                        href="/static/privacy"
                                    >
                                        Privacy Policy
                                    </Link>
                                </div>
                                <div className="flex justify-center gap-2 p-2 md:gap-4">
                                    <a
                                        className="group rounded-md p-2 hover:animate-hop hover:bg-slate-200"
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label="Github"
                                        href="https://github.com/mrperrytpx/garbgarb"
                                    >
                                        <FiGithub
                                            className="group-hover:stroke-black"
                                            stroke="#D1D5DB"
                                            size={24}
                                        />
                                    </a>
                                    <a
                                        className="group rounded-md p-2 hover:animate-hop hover:bg-slate-200"
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label="LinkedIn"
                                        href="https://www.linkedin.com/in/tomislav-siprak"
                                    >
                                        <FiLinkedin
                                            className="group-hover:stroke-black"
                                            stroke="#D1D5DB"
                                            size={24}
                                        />
                                    </a>
                                </div>
                            </div>
                            <div className="w-full pl-2 text-center text-sm text-slate-200 md:text-left">
                                <strong>©</strong> {new Date().getFullYear()} GarbGarb
                            </div>
                        </div>
                    </footer>
                </>
            )}
        </div>
    );
};

export default Layout;
