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

    const [_, ...segments] = path.split("/");
    const hasPath = segments.length > 0; // check if not root

    return (
        <nav className="flex items-center gap-1 overflow-x-auto rounded-md border-b p-1 text-sm capitalize">
            <Link className="hover:underline focus:underline" href="/">
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
                        <Link className="capitalize hover:underline focus:underline" href={href}>
                            {segment}
                        </Link>
                        {!isLast ? <p>&gt;</p> : null}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};
