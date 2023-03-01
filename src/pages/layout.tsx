import Link from "next/link";
import React, { useState } from "react";
import Header from "../components/Header";

interface ILayoutProps {
  children: JSX.Element | JSX.Element[];
}

const Layout = ({ children }: ILayoutProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
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
        </div>
      ) : (
        children
      )}
    </>
  );
};

export default Layout;
