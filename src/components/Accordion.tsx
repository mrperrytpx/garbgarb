import React, { KeyboardEventHandler, useEffect, useRef, useState } from "react";

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
            fill="white"
            className={`transform transition-transform duration-300 group-hover:fill-black ${
                isExpanded ? "rotate-180" : "rotate-0"
            }`}
        >
            <path d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z"></path>
        </svg>
    );
};

export const Accordion = ({ children, title }: IAccordionProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const childrenRef = useRef<HTMLDivElement>(null);
    const childrenHeight = useRef(0);

    const calculateChildrenHeight = () => {
        if (childrenRef.current) {
            const children = childrenRef.current.children;
            let totalHeight = 0;
            for (let i = 0; i < children.length; i++) {
                const child = children[i] as HTMLElement;
                totalHeight += child.offsetHeight;
            }
            childrenHeight.current = totalHeight;
        }
    };

    useEffect(() => {
        calculateChildrenHeight();
    }, []);

    return (
        <div className="flex w-full flex-col items-center justify-start">
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.code === "Space" || e.code === "Enter") {
                        e.preventDefault();
                        setIsExpanded(!isExpanded);
                    }
                }}
                className="group flex w-full cursor-pointer items-center justify-between gap-2 p-2 shadow-sm shadow-slate-500 hover:bg-slate-200 hover:text-black"
            >
                <p className="select-none text-sm font-bold uppercase">{title}</p>
                <TriangleIcon isExpanded={isExpanded} />
            </div>
            <div
                ref={childrenRef}
                className="mt-2 flex max-h-0 w-full flex-col gap-2 overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                    maxHeight: isExpanded ? `${childrenHeight.current * 2}px` : 0,
                }}
            >
                {children}
            </div>
        </div>
    );
};
