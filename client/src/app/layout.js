import { Instrument_Serif, Unbounded, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';

const instrument = Instrument_Serif({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-instrument',
});

const unbounded = Unbounded({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-unbounded',
});

const spaceGrotesk = Space_Grotesk({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata = {
  title: 'HomeEase — Find Your Perfect Home & Services',
  description: 'HomeEase connects you with rental properties and trusted local service providers.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${instrument.variable} ${unbounded.variable} ${spaceGrotesk.variable} font-body antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#000000',
                color: '#FFFFFF',
                borderRadius: '0px',
                border: '1px solid #000000',
                fontSize: '11px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '16px 24px',
                boxShadow: 'none',
              },
              success: { iconTheme: { primary: '#FFFFFF', secondary: '#000' } },
              error: { iconTheme: { primary: '#FF0000', secondary: '#fff' } },
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
