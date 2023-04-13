import Link from "next/link";
import { ReactNode } from "react";

interface ILinkButtonProps {
  children: ReactNode | ReactNode[];
  href: string;
  className?: string;
}

export const LinkButton = ({ children, href, className, ...rest }: ILinkButtonProps) => {
  return (
    <Link className={className} href={href} {...rest}>
      {children}
    </Link>
  );
};
