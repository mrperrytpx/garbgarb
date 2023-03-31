import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900;1000&display=swap"
        />
      </Head>
      <body>
        <Main />
        <div id="portal" />
        <NextScript></NextScript>
        {/* <script
          async
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDuJE7r4MTt-S-zIY6tcG1GL0oI3X2RS6M&libraries=places&callback=initMap"
        ></script> */}
      </body>
    </Html>
  );
}
