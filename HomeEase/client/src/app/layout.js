import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'HomeEase — Find Your Perfect Home & Services',
  description: 'HomeEase connects you with rental properties and trusted local service providers.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#0F172A',
                color: '#F8FAFC',
                borderRadius: '12px',
                fontSize: '14px',
                padding: '12px 20px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              },
              success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
            }}
          />
          <Navbar />
          <main className="flex-1 pt-[72px]">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
