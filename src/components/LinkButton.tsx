import Link from "next/link";
import { ReactNode } from "react";

interface ILinkButtonProps {
    children: ReactNode | ReactNode[];
    href: string;
    className?: string;
    minWidth?: number;
}

export const LinkButton = ({ children, href, className, minWidth, ...rest }: ILinkButtonProps) => {
    return (
        <Link
            className={
                "rounded-lg border py-2 px-4 text-center font-medium uppercase shadow-lg transition-all hover:bg-slate-500 hover:text-white " +
                className
            }
            href={href}
            style={{
                minWidth: minWidth + "px" || 0,
            }}
            {...rest}
        >
            {children}
        </Link>
    );
};
