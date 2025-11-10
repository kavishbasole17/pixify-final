/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add the 'images' configuration block
  images: {
    // List the hostnames you need to allow
    remotePatterns: [
      {
        protocol: 'https',
        // This is the specific hostname of your S3 bucket
        hostname: 'my-image-search-bucket-kavishbasole28.s3.us-east-1.amazonaws.com',
        // Allow all paths on that host
        pathname: '/**', 
      },
      // You can also add a pattern for the general S3 domain if needed
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
    ],
  },
};

module.exports = nextConfig;