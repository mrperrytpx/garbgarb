import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FiGithub, FiLinkedin, FiMenu } from "react-icons/fi";
import { usePathname } from "next/navigation";
import { CartIconWithNumber } from "../components/CartIconWithNumber";
import Image from "next/image";
import { useSession } from "next-auth/react";

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
            {session?.user && (
              <Link href="/profile">
                <Image
                  className="rounded-full"
                  width={24}
                  height={24}
                  src={session?.user?.image!}
                  alt="User's profile"
                />
              </Link>
            )}
          </div>
          <div className="flex items-center justify-center gap-4">
            <Link className="p-1 text-3xl" href="/cart">
              <CartIconWithNumber />
            </Link>
            <button
              onClick={() => setIsExpanded((old) => !old)}
              className="selext-none text-3xl lg:hidden"
              role="button"
            >
              <FiMenu />
            </button>
          </div>
        </div>
      </header>
      {/* Mobile Menu */}
      {isExpanded ? (
        <div className="overflow-hidde flex h-[calc(max(600px,100vh)-60px)] flex-col items-center justify-center bg-slate-100">
          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            <Link
              className="text-2xl font-medium hover:underline  focus:underline"
              href="/products"
            >
              Shop
            </Link>
            <Link className="text-2xl font-medium hover:underline focus:underline" href="/login">
              Login
            </Link>
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
          <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-screen-2xl flex-1">
            {children}
          </main>
          {/* Footer */}
          <footer className="border-t-2 border-slate-300 bg-slate-200 px-4 shadow-2xl shadow-slate-100 ">
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
                <div className="flex justify-center gap-2 p-2 md:gap-6">
                  <a
                    target="_blank"
                    referrerPolicy="no-referrer"
                    href="https://github.com/mrperrytpx/garbgarb"
                  >
                    <FiGithub stroke="black" size={24} />
                  </a>
                  <a target="_blank" referrerPolicy="no-referrer" href="https://www.linkedin.com/">
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
