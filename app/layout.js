// app/layout.js
import "./globals.css";

export const metadata = {
  title: "Pixify",
  description: "Upload, search, and explore your images with AWS Rekognition - Kavish Basole",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="layout">
          <header className="header">
            <h1 className="logo">Pixify</h1>
          </header>
          <main className="content">{children}</main>
          <footer className="footer">© {new Date().getFullYear()} Kavish Basole</footer>
        </div>
      </body>
    </html>
  );
}
