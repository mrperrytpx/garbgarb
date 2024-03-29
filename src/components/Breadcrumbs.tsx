import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export const Breadcrumbs = () => {
    const router = useRouter();
    const [path, setPath] = useState(router.asPath);

    useEffect(() => {
        const handleRouteChange = () => {
            setPath(router.asPath);
        };

        router.events.on("routeChangeComplete", handleRouteChange);

        return () => {
            router.events.off("routeChangeComplete", handleRouteChange);
        };
    }, [router]);

    const pathWithoutQuery = path.split("?")[0];
    const [_, ...segments] = pathWithoutQuery.split("/");
    const hasPath = segments.length > 0; // check if not root

    return (
        <nav className="flex items-center gap-1 overflow-x-auto border-b border-slate-500 p-1 text-sm capitalize text-gray-200">
            <Link className="hover:animate-hop hover:underline focus:underline" href="/">
                Home
            </Link>
            {hasPath && <p>&gt;</p>}
            {segments.map((segment, index) => {
                const href = `/${segments.slice(0, index + 1).join("/")}`;
                const isLast = index === segments.length - 1;

                return isLast ? (
                    segment
                ) : (
                    <React.Fragment key={href}>
                        <Link
                            className="capitalize hover:animate-hop hover:underline focus:underline"
                            href={href}
                        >
                            {segment}
                        </Link>
                        {!isLast ? <p>&gt;</p> : null}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};
