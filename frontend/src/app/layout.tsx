import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Web Security Audit Tool",
  description: "Scan web applications for security vulnerabilities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-800 text-white">
            <div className="p-6">
              <h1 className="text-xl font-bold">Security Audit</h1>
            </div>
            <nav className="mt-6">
              <ul>
                <li>
                  <Link 
                    href="/" 
                    className="block px-6 py-3 hover:bg-gray-700"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/web-applications" 
                    className="block px-6 py-3 hover:bg-gray-700"
                  >
                    Web Applications
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/scan-results" 
                    className="block px-6 py-3 hover:bg-gray-700"
                  >
                    Scan Results
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/vulnerabilities" 
                    className="block px-6 py-3 hover:bg-gray-700"
                  >
                    Vulnerabilities
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 bg-gray-100">
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
} 