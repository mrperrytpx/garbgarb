import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { FiGithub, FiLinkedin } from "react-icons/fi";
import { usePathname } from "next/navigation";

interface ILayoutProps {
  children: JSX.Element | JSX.Element[];
}

const Layout = ({ children }: ILayoutProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const pathname = usePathname();
  useEffect(() => {
    setIsExpanded(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header setIsExpanded={setIsExpanded} />
      {isExpanded ? (
        <div className="flex h-[calc(max(600px,100vh)-60px)] flex-col items-center justify-center gap-6 overflow-hidden bg-gray-500">
          <Link className="text-3xl text-white" href="/products">
            Shop
          </Link>
          <Link className="text-3xl text-white" href="/login">
            Login
          </Link>
          <Link className="text-3xl text-white" href="/contact">
            Contact
          </Link>
          <div className="flex gap-4">
            <a
              className="my-8"
              target="_blank"
              referrerPolicy="no-referrer"
              href="https://github.com/mrperrytpx/garbgarb"
            >
              <FiGithub stroke="white" size={40} />
            </a>
            <a
              className="my-8"
              target="_blank"
              referrerPolicy="no-referrer"
              href="https://www.linkedin.com/"
            >
              <FiLinkedin stroke="white" size={40} />
            </a>
          </div>
        </div>
      ) : (
        <>
          {children}
          <div className="flex h-[100px] items-center justify-center bg-red-400">I AM FOOTER</div>
        </>
      )}
    </div>
  );
};

export default Layout;
