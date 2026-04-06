import './globals.css';
import { Lexend } from 'next/font/google';
import Providers from '@/components/Providers';
import AppShell from '@/components/AppShell';
import Script from 'next/script';

export const metadata = {
  title: 'Postcraft',
  description: 'Generate cybersecurity and personal brand X posts in your voice',
};

const lexend = Lexend({ 
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('postcraft-theme')||'dark';document.documentElement.classList.remove('dark','light');document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('dark');}})();`}
        </Script>
      </head>
      <body className={`${lexend.className} antialiased`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
