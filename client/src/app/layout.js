import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-inter',
});

const jakarta = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-jakarta',
});

export const metadata = {
  title: 'HomeEase — Find Your Perfect Home & Services',
  description: 'HomeEase connects you with rental properties and trusted local service providers.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jakarta.variable} font-body antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <Toaster
            position="bottom-left"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0F172A',
                color: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '14px',
                fontWeight: '600',
                padding: '16px 24px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
              },
              success: {
                iconTheme: { primary: '#F59E0B', secondary: '#0F172A' },
              },
              error: {
                iconTheme: { primary: '#F43F5E', secondary: '#FFFFFF' }
              },
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
