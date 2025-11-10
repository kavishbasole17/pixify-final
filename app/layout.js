// app/layout.js
import "./globals.css";

export const metadata = {
  title: "Pixify",
  description: "AI-powered image search and tagging app by Kavish Basole",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-white min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
