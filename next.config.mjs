/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === "development" 
      ? "http://localhost:3000/"
      : "https://linpack.vercel.app/",
    NEXT_PUBLIC_LINPACK_URL: process.env.NEXT_PUBLIC_LINPACK_URL,
    NEXT_PUBLIC_LINGU_URL: process.env.NEXT_PUBLIC_LINGU_URL,
  },
    images: {
        remotePatterns: [
            {
              protocol: 'https',
              hostname: 'swiperjs.com',
              port: '',
              pathname: '**/demos/images/**',
            },
            {
              protocol: 'https',
              hostname: 'in.mathworks.com',
              port: '',
              pathname: '**/videos/**',
            },
            {
              protocol: 'https',
              hostname: 'www.overleaf.com',
              port: '',
              pathname:"**/videos/**",
            },
            {
              protocol: 'https',
              hostname: 'media.licdn.com',
              port: '',
              pathname:"**/dms/image/v2/D4D03AQHcmgOH1C86ww/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/**",
            },
          ],
    },
    async headers() {
      return [
        {
          source: '/api/:path*',
          headers: [
            { key: 'Access-Control-Allow-Credentials', value: 'true' },
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
            { key: 'Access-Control-Allow-Headers', value: '*' }
          ],
        }
      ];
    },
    rewrites: async () => {
      const isDev = process.env.NODE_ENV === "development";
      return [
        {
          source: "/api/py/:path*",
          destination: isDev
            ? "http://127.0.0.1:8000/api/py/:path*"
            : "/api/py/:path*",
        },
        {
          source: "/api/py/health",
          destination: isDev
            ? "http://127.0.0.1:8000/api/py/health"
            : `${process.env.NEXT_PUBLIC_LINPACK_URL}api/py/health`,
        },
        {
          source: "/docs",
          destination: isDev
            ? "http://127.0.0.1:8000/api/py/docs"
            : "/api/py/docs",
        },
        {
          source: "/openapi.json",
          destination: isDev
            ? "http://127.0.0.1:8000/api/py/openapi.json"
            : "/api/py/openapi.json",
        },
      ];
    },  
};

export default nextConfig;
