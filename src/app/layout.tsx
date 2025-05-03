import type { Metadata } from 'next';
import { GeistSans as Geist } from 'next/font/google'; // Updated import
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const geist = Geist({ // Updated variable name
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LinguaLeap - Learn English Effectively',
  description: 'Interactive English lessons, pronunciation feedback, and quizzes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <Providers>
          <Header />
          <main className="flex-grow container py-8">
            {children}
          </main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
