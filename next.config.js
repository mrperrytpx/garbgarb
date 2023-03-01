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
        ],
    },
};

module.exports = nextConfig;
