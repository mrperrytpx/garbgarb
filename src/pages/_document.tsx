import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900;1000&display=swap"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Roboto:wght@500&display=swap"
                    rel="stylesheet"
                />
                <script src="https://unpkg.com/large-small-dynamic-viewport-units-polyfill@0.1.1/dist/large-small-dynamic-viewport-units-polyfill.min.js" />
            </Head>
            <body>
                <Main />
                <div id="portal" />
                <NextScript />
            </body>
        </Html>
    );
}
