import "../styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "./layout";
import { Provider } from "react-redux";
import { persistor, store } from "../redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { Hydrate, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider, useSession } from "next-auth/react";
import React, { ReactNode, useEffect, useState } from "react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { NextComponentType } from "next";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ToastContainer } from "react-toastify";
import { ToastContainerProps } from "react-toastify/dist/types";
import "react-toastify/dist/ReactToastify.css";

type CustomAppProps = AppProps & {
    Component: NextComponentType & { auth?: boolean };
};

const toastProps: ToastContainerProps = {
    autoClose: 1500,
    theme: "dark",
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
