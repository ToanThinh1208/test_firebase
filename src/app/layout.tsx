
'use client'; // Needs to be client component for state and effects

import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Use Inter instead of GeistSans
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { Button } from "@/components/ui/button"; // Import Button
import { MessageSquare } from 'lucide-react'; // Import icon for chat button
import { ChatWidget } from '@/components/chat/chat-widget'; // Import ChatWidget
import { useState } from 'react'; // Import useState

const inter = Inter({ // Use inter variable name
  variable: '--font-inter', // Update CSS variable name
  subsets: ['latin'],
});

// Note: Metadata export is generally for Server Components,
// but we keep it here for Next.js to potentially use.
// Actual dynamic metadata might need different handling in client components.
/* export const metadata: Metadata = {
  title: 'LinguaLeap - Learn English Effectively',
  description: 'Interactive English lessons, pronunciation feedback, and quizzes.',
}; */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    // Apply the Inter font variable to the html tag
    <html lang="en" className={inter.variable}>
      {/* Keep font-sans for base styling, Inter will be applied via the variable */}
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <Providers>
          <Header />
          {/* Adjusted main padding to ensure content doesn't overlap fixed footer/header */}
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
          <Toaster />

          {/* Chat Widget and Toggle Button */}
          <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
          {!isChatOpen && (
              <Button
                  variant="default" // Use default variant for primary color
                  size="icon"
                  className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-40" // Ensure button is above chat if needed, adjust z-index
                  onClick={() => setIsChatOpen(true)}
                  aria-label="Open support chat"
              >
                  <MessageSquare className="h-6 w-6" />
              </Button>
          )}
        </Providers>
      </body>
    </html>
  );
}

