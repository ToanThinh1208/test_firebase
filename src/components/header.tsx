import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, BookOpen, Mic, Trophy, LeapForward } from 'lucide-react'; // Assuming LeapForward icon exists or using placeholder

export function Header() {
  const navItems = [
    { href: '/', label: 'Home', icon: BookOpen }, // Changed Home icon
    { href: '/lessons', label: 'Lessons', icon: BookOpen },
    { href: '/pronunciation', label: 'Pronunciation', icon: Mic },
    { href: '/quizzes', label: 'Quizzes', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {/* Placeholder for LeapForward or similar icon */}
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-primary">
              <path fillRule="evenodd" d="M15.75 2.25H21a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V4.81L12.97 12H18a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0v-3.567l-7.5-7.5H10.5a.75.75 0 0 1 0 1.5H4.81L3.03 6.03a.75.75 0 0 1 1.06-1.06L6 6.718V3a.75.75 0 0 1 .75-.75h5.25a.75.75 0 0 1 0 1.5H8.152l7.5 7.5h-1.82a.75.75 0 0 1-.703-1.136l1.618-2.311Z" clipRule="evenodd" />
            </svg>
            <span className="font-bold">LinguaLeap</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link href="/" className="mr-6 flex items-center space-x-2 mb-6 px-6">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-primary">
                    <path fillRule="evenodd" d="M15.75 2.25H21a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V4.81L12.97 12H18a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0v-3.567l-7.5-7.5H10.5a.75.75 0 0 1 0 1.5H4.81L3.03 6.03a.75.75 0 0 1 1.06-1.06L6 6.718V3a.75.75 0 0 1 .75-.75h5.25a.75.75 0 0 1 0 1.5H8.152l7.5 7.5h-1.82a.75.75 0 0 1-.703-1.136l1.618-2.311Z" clipRule="evenodd" />
                  </svg>
                <span className="font-bold">LinguaLeap</span>
              </Link>
              <nav className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center space-x-2 px-6 py-2 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center space-x-2">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-primary">
              <path fillRule="evenodd" d="M15.75 2.25H21a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V4.81L12.97 12H18a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0v-3.567l-7.5-7.5H10.5a.75.75 0 0 1 0 1.5H4.81L3.03 6.03a.75.75 0 0 1 1.06-1.06L6 6.718V3a.75.75 0 0 1 .75-.75h5.25a.75.75 0 0 1 0 1.5H8.152l7.5 7.5h-1.82a.75.75 0 0 1-.703-1.136l1.618-2.311Z" clipRule="evenodd" />
            </svg>
            <span className="font-bold">LinguaLeap</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Add Login/Signup buttons here if needed */}
           <Button variant="ghost">Log In</Button>
           <Button>Sign Up</Button>
        </div>
      </div>
    </header>
  );
}
