import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Web Application Security Audit Tool',
  description: 'Scan your web applications for security vulnerabilities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-gray-800 text-white">
          <div className="p-4 font-bold text-lg md:text-xl border-b border-gray-700">
            Security Audit
          </div>
          <nav className="p-2">
            <ul>
              <li className="mb-1">
                <Link href="/" className="block p-2 rounded hover:bg-gray-700 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li className="mb-1">
                <Link href="/web-applications" className="block p-2 rounded hover:bg-gray-700 transition-colors">
                  Web Applications
                </Link>
              </li>
              <li className="mb-1">
                <Link href="/scan-results" className="block p-2 rounded hover:bg-gray-700 transition-colors">
                  Scan Results
                </Link>
              </li>
              <li className="mb-1">
                <Link href="/vulnerabilities" className="block p-2 rounded hover:bg-gray-700 transition-colors">
                  Vulnerabilities
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 bg-gray-100">
          {children}
        </main>
      </body>
    </html>
  );
}
