import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Use Inter instead of GeistSans
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const inter = Inter({ // Use inter variable name
  variable: '--font-inter', // Update CSS variable name
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
    // Apply the Inter font variable to the html tag
    <html lang="en" className={inter.variable}>
      {/* Keep font-sans for base styling, Inter will be applied via the variable */}
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
