import { useEffect, useState, useRef, Dispatch, SetStateAction } from "react";
import type { TDropdownData } from "../pages/products/[articleId]";

interface IDropdownProps {
  options: TDropdownData[];
  state: string;
  setState: Dispatch<SetStateAction<TDropdownData>>;
}

export const Dropdown = ({ options, state, setState }: IDropdownProps) => {
  const [isActive, setIsActive] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function collapseDropdown() {
      const element = ref.current;

      const closeMenu: EventListenerOrEventListenerObject = (e) => {
        const node = e.target as Node;
        if (element?.contains(node)) return;
        setIsActive(false);
      };

      if (!element) return;
      ["click", "touchstart"].forEach((type) => {
        document.addEventListener(type, closeMenu);

        return () => document.removeEventListener(type, closeMenu);
      });
    }

    collapseDropdown();
  }, [setIsActive, ref]);

  return (
    <div ref={ref} className="relative z-[2] m-auto max-w-md select-none">
      <span
        className="flex min-w-[60px] cursor-pointer flex-col items-center justify-center border py-1 px-2 font-semibold uppercase"
        tabIndex={0}
        onClick={() => setIsActive(!isActive)}
      >
        {state}
      </span>
      {isActive && (
        <div className="absolute left-1/2 flex w-full min-w-[150px] -translate-x-1/2 flex-col items-center justify-center overflow-hidden bg-white">
          {options.map((option, i) => (
            <span
              className="inline-block w-full cursor-pointer border py-1 px-2 text-center hover:bg-slate-300"
              tabIndex={0}
              key={i}
              onClick={() => {
                setState(option);
                setIsActive(false);
              }}
            >
              {option.text.toUpperCase()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
