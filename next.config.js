/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['undici'],
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                dns: false,
                child_process: false,
                perf_hooks: false,
            };
        }
        return config;
    },
}

module.exports = nextConfig 