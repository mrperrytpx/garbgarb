import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FiGithub, FiLinkedin, FiLogIn, FiLogOut, FiMenu } from "react-icons/fi";
import { BsShop } from "react-icons/bs";
import { usePathname } from "next/navigation";
import { CartIconWithNumber } from "../components/CartIconWithNumber";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { ErrorBoundary } from "../utils/ErrorBoundary";

interface ILayoutProps {
  children: JSX.Element | JSX.Element[];
}

const Layout = ({ children }: ILayoutProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: session } = useSession();

  const pathname = usePathname();

  useEffect(() => setIsExpanded(false), [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 grid h-14 items-center border-b-2 border-slate-300 bg-slate-200 px-4 shadow  shadow-slate-100">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between">
          <div className="flex items-center justify-center gap-4">
            <Link className="p-1 text-3xl" href="/">
              L
            </Link>
            <Link
              className="hidden rounded-md p-2 shadow transition-all hover:bg-white sm:inline"
              href="/products"
            >
              <BsShop size="24" />
            </Link>
            {session?.user && (
              <Link className="sm:hidden" href="/my_orders">
                <Image
                  className="w-7 rounded-full"
                  width={100}
                  height={100}
                  src={session?.user?.image!}
                  alt="User's profile"
                />
              </Link>
            )}
          </div>
          <div className="flex items-center justify-center gap-4">
            {session?.user && (
              <Link className="hidden sm:inline" href="/my_orders">
                <Image
                  className="w-7 rounded-full"
                  width={100}
                  height={100}
                  src={session?.user?.image!}
                  alt="User's profile"
                />
              </Link>
            )}
            {session?.user && (
              <button
                onClick={() => signOut()}
                title="Sign out"
                className="hidden rounded-md p-2 shadow transition-all hover:bg-white sm:inline-block"
              >
                <FiLogOut size="24" />
              </button>
            )}
            {!session?.user && (
              <button
                onClick={() => signIn()}
                title="Sign in"
                className="hidden rounded-md p-2 shadow transition-all hover:bg-white sm:inline-block"
              >
                <FiLogIn size="24" />
              </button>
            )}
            <Link className="text-3xl" href="/cart">
              <CartIconWithNumber />
            </Link>
            <button
              onClick={() => setIsExpanded((old) => !old)}
              className="selext-none text-3xl sm:hidden"
              role="button"
            >
              <FiMenu />
            </button>
          </div>
        </div>
      </header>
      {/* Mobile Menu */}
      {isExpanded ? (
        <div className="overflow-hidde flex h-[calc(max(600px,100vh)-56px)] flex-col items-center justify-center bg-slate-100">
          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            <Link className="text-xl font-medium hover:underline  focus:underline" href="/products">
              Shop
            </Link>
            {session?.user && (
              <Link
                className="text-xl font-medium hover:underline  focus:underline"
                href="/my_orders"
              >
                Profile
              </Link>
            )}
            {session?.user && (
              <button
                onClick={() => signOut()}
                title="Sign out"
                className="text-xl font-medium hover:underline  focus:underline"
              >
                Sign Out
              </button>
            )}
            {!session?.user && (
              <button
                onClick={() => signIn()}
                title="Sign in"
                className="text-xl font-medium hover:underline  focus:underline"
              >
                Sign In
              </button>
            )}
          </div>
          <div className="mt-auto flex gap-4">
            <a
              className="my-8"
              target="_blank"
              referrerPolicy="no-referrer"
              href="https://github.com/mrperrytpx/garbgarb"
            >
              <FiGithub size={40} />
            </a>
            <a
              className="my-8"
              target="_blank"
              referrerPolicy="no-referrer"
              href="https://www.linkedin.com/"
            >
              <FiLinkedin size={40} />
            </a>
          </div>
        </div>
      ) : (
        <>
          <ErrorBoundary>
            <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-screen-2xl flex-1">
              {children}
            </main>
          </ErrorBoundary>
          {/* Footer */}
          <footer className="bg-slate-200 px-4 shadow-2xl shadow-slate-100 ">
            <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-center gap-4 py-8">
              <div className="flex w-full flex-col gap-4 md:flex-row md:justify-between">
                <div className="flex flex-col items-center justify-center gap-4 p-2 md:flex-row md:gap-6">
                  <Link
                    className="border-black  font-medium hover:underline focus:underline"
                    href="/returns-faq"
                  >
                    Returns & FAQ
                  </Link>
                  <Link className=" font-medium hover:underline focus:underline" href="/contact">
                    Contact
                  </Link>
                  <Link className=" font-medium hover:underline focus:underline" href="/privacy">
                    Privacy Policy
                  </Link>
                </div>
                <div className="flex justify-center gap-2 p-2 md:gap-4">
                  <a
                    className="p-2"
                    target="_blank"
                    referrerPolicy="no-referrer"
                    href="https://github.com/mrperrytpx/garbgarb"
                  >
                    <FiGithub stroke="black" size={24} />
                  </a>
                  <a
                    className="p-2"
                    target="_blank"
                    referrerPolicy="no-referrer"
                    href="https://www.linkedin.com/"
                  >
                    <FiLinkedin stroke="black" size={24} />
                  </a>
                </div>
              </div>
              <div className="w-full pl-2 text-center text-sm text-slate-500 md:text-left">
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
