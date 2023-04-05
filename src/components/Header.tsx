import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { CartIconWithNumber } from "./CartIconWithNumber";

interface HeaderProps {
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
}

export const Header = ({ setIsExpanded }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between bg-gray-500 px-4">
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
          <CartIconWithNumber />
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
