/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  images: {
    domains: ['res.cloudinary.com', 'raw.githubusercontent.com'], 
  }
};

export default nextConfig;
