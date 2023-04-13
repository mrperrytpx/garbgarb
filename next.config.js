/** @type {import('next').NextConfig} */
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

module.exports = nextConfig;
