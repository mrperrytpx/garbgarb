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
            className={className}
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
