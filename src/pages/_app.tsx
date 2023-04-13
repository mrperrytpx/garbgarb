import "../styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "./layout";
import { Provider } from "react-redux";
import { persistor, store } from "../redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { Hydrate, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import { ErrorBoundary } from "../utils/ErrorBoundary";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
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
                  <Component {...pageProps} />
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
