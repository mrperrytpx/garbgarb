import "../styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "./layout";
import { Provider } from "react-redux";
import { persistor, store } from "../redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate persistor={persistor} loading={null}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
          <ReactQueryDevtools initialIsOpen={false} />
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  );
}
