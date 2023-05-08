/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
    openAnalyzer: false,
});

const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "files.cdn.printful.com",
                port: "",
                pathname: "/files/**",
            },
            {
                protocol: "https",
                hostname: "files.cdn.printful.com",
                port: "",
                pathname: "/upload/**",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                port: "",
            },
        ],
    },
};

module.exports = withBundleAnalyzer(nextConfig);
