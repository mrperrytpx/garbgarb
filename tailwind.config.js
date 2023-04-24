/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",

        // Or if using `src` directory:
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    future: {
        hoverOnlyWhenSupported: true,
    },
    theme: {
        screens: {
            // eslint-disable no-console, no-control-regex
            xs: "520px",
            sm: "640px",
            // => @media (min-width: 640px) { ... }

            md: "768px",
            // => @media (min-width: 768px) { ... }

            lg: "1024px",
            // => @media (min-width: 1024px) { ... }

            xl: "1280px",
            // => @media (min-width: 1280px) { ... }

            "2xl": "1536px",
            // => @media (min-width: 1536px) { ... }
        },
        extend: {
            keyframes: {
                hop: {
                    "0%": { transform: "translateY(0%)" },
                    "50%": { transform: "translateY(-2px)" },
                    "100%": { transform: "translateY(0%)" },
                },
            },
            animation: {
                hop: "hop 0.1s linear",
            },
            height: {
                screen: ["100vh /* fallback for Opera, IE and etc. */", "100dvh"],
            },
        },
    },
    plugins: [],
};
