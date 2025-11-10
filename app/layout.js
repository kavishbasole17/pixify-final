// app/layout.js
import "./globals.css";

export const metadata = {
  title: "Pixify",
  // Combining the best description from both versions
  description: "AI-powered image search and tagging app by Kavish Basole. Upload, search, and explore your images with AWS Rekognition.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Retaining the HEAD body structure to keep the layout flexible and use styles defined in page.js */}
      <body className="bg-[#0a0a0a] text-white min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}