import Link from "next/link";
import { Dispatch, SetStateAction } from "react";

const CartIcon = () => {
  // https://heroicons.com/
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="white"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  );
};

interface HeaderProps {
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
}

const Header = ({ setIsExpanded }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-10 flex h-[60px] items-center justify-between bg-gray-500 px-4">
      <div className="flex items-center justify-center gap-4">
        <Link className="p-1 text-3xl text-white" href="/">
          L
        </Link>
        <Link className="p-1 text-3xl uppercase text-white hover:text-black" href="/products">
          Shop
        </Link>
      </div>
      <div className="flex items-center justify-center gap-4">
        <Link className="p-1 text-3xl text-white" href="/cart">
          <CartIcon />
        </Link>
        <button
          onClick={() => setIsExpanded((old) => !old)}
          className="selext-none text-3xl"
          role="button"
        >
          C
        </button>
      </div>
    </header>
  );
};

export default Header;
