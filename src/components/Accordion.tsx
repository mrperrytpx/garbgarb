import React, { Children, useEffect, useRef, useState } from "react";

interface IAccordionProps {
  children: React.ReactNode;
  title: string;
}

const TriangleIcon = ({ isExpanded }: { isExpanded: boolean }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="black"
      className={`transform transition-transform ${isExpanded ? "rotate-180" : "rotate-0"}`}
    >
      <path d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z"></path>
    </svg>
  );
};

export const Accordion = ({ children, title }: IAccordionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const childrenRef = useRef<HTMLUListElement>(null);
  const childrenHeight = useRef(0);

  useEffect(() => {
    if (childrenRef.current) {
      const children = childrenRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        childrenHeight.current += child.offsetHeight;
      }
    }
  }, []);

  return (
    <div className="flex w-full flex-col items-center justify-start border-b-2">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full cursor-pointer items-center justify-between py-2"
      >
        <p className="text-sm font-bold uppercase">{title}</p>
        <TriangleIcon isExpanded={isExpanded} />
      </div>
      <ul
        ref={childrenRef}
        className="flex max-h-0 w-full flex-col gap-2 overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isExpanded ? `${childrenHeight.current * (3 / 4)}px` : 0,
        }}
      >
        {children}
      </ul>
    </div>
  );
};
