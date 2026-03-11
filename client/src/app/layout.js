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
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1E293B',
                color: '#FFFFFF',
                borderRadius: '12px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                padding: '14px 20px',
                boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
              },
              success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#F43F5E', secondary: '#fff' } },
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
