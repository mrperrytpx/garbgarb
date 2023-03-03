import { useEffect, useState, useRef, Dispatch, SetStateAction } from "react";

interface IDropdownProps {
  options: {
    state: string;
  }[];
  state: string;
  setState: Dispatch<SetStateAction<string>>;
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
    <div
      ref={ref}
      className="relative z-[2] m-auto max-w-md select-none rounded-md border border-red-600"
    >
      <span
        className="flex min-w-[60px] cursor-pointer flex-col items-center justify-center py-1 px-2 font-semibold uppercase"
        tabIndex={0}
        onClick={() => setIsActive(!isActive)}
      >
        {state}
      </span>
      {isActive && (
        <div className="absolute top-full left-0 flex w-full min-w-[150px] flex-col items-center justify-center overflow-hidden rounded-md">
          {options.map((option, i) => (
            <span
              className="inline-block w-full cursor-pointer py-1 px-2 text-left"
              tabIndex={0}
              key={i}
              onClick={() => {
                setState(option.state);
                setIsActive(false);
              }}
            >
              {option.state.toUpperCase()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
