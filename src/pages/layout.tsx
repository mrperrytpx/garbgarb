import Link from "next/link";
import React, { useState } from "react";
import Header from "../components/Header";
import { FiGithub } from "react-icons/fi";

interface ILayoutProps {
  children: JSX.Element | JSX.Element[];
}

const Layout = ({ children }: ILayoutProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
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
          <a
            target="_blank"
            referrerPolicy="no-referrer"
            href="https://github.com/mrperrytpx/garbgarb"
          >
            <FiGithub stroke="white" size={40} />
          </a>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default Layout;
