import "../styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "./layout";
import { Provider } from "react-redux";
import { persistor, store } from "../redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { Hydrate, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider, useSession } from "next-auth/react";
import React, { ReactNode, useState } from "react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { NextComponentType } from "next";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ToastContainer } from "react-toastify";
import { ToastContainerProps } from "react-toastify/dist/types";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";

type CustomAppProps = AppProps & {
    Component: NextComponentType & { auth?: boolean };
};

const toastProps: ToastContainerProps = {
    autoClose: 1500,
    theme: "dark",
    limit: 5,
};

export default function App({ Component, pageProps }: CustomAppProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        retry: 1,
                    },
                },
            })
    );

    return (
        <>
            <Head>
                <title>GarbGarb</title>
                <link rel="icon" type="image/svg+xml" href="/static/favicon.svg" />
                <link rel="icon" type="image/png" href="/static/favicon.png" />
                <meta name="description" content="GarbGarb - Buy yourself something nice" />
                <meta property="og:title" content="GarbGarb" />
                <meta
                    property="og:image"
                    content={`${process.env.NEXT_PUBLIC_SERVER_URL}/static/homepage.png`}
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://garbgarb.vercel.app/" />
                <meta property="og:description" content="GarbGarb - Buy yourself something nice" />
                <meta name="theme-color" content="#0a0a0a" />
            </Head>
            <SessionProvider session={pageProps.session}>
                <QueryClientProvider client={queryClient}>
                    <Hydrate state={pageProps.dehydratedState}>
                        <Provider store={store}>
                            <PersistGate persistor={persistor} loading={null}>
                                <ErrorBoundary>
                                    <Layout>
                                        {Component.auth ? (
                                            <Auth>
                                                <Component {...pageProps} />

                                                <ToastContainer {...toastProps} />
                                            </Auth>
                                        ) : (
                                            <>
                                                <Component {...pageProps} />
                                                <ToastContainer {...toastProps} />
                                            </>
                                        )}
                                    </Layout>
                                </ErrorBoundary>
                                <ReactQueryDevtools initialIsOpen={false} />
                            </PersistGate>
                        </Provider>
                    </Hydrate>
                </QueryClientProvider>
            </SessionProvider>
        </>
    );
}

function Auth({ children }: { children: ReactNode }) {
    const { status } = useSession({ required: true });

    if (status === "loading") {
        return (
            <div className="mx-auto flex w-full flex-1 flex-col items-center justify-center gap-2 text-gray-200">
                <LoadingSpinner size={50} />
            </div>
        );
    }

    return <React.Fragment>{children}</React.Fragment>;
}
