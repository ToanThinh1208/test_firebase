
'use client'; // Make header a client component to use hooks

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, BookOpen, Mic, Trophy, User, LogOut, LayoutDashboard } from 'lucide-react'; // Added LayoutDashboard
import { useAuth } from '@/context/auth-context'; // Import useAuth
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import Dropdown components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';


export function Header() {
  const { currentUser, logOut, loading } = useAuth(); // Get auth state and functions
  const router = useRouter();
  const { toast } = useToast();

  // Define base navigation items
  const baseNavItems = [
    { href: '/', label: 'Home', icon: BookOpen, requiresAuth: false },
    { href: '/lessons', label: 'Lessons', icon: BookOpen, requiresAuth: false },
    { href: '/pronunciation', label: 'Pronunciation', icon: Mic, requiresAuth: false },
    { href: '/quizzes', label: 'Quizzes', icon: Trophy, requiresAuth: false },
  ];

  // Add dashboard link only if logged in
  const navItems = currentUser
    ? [ { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresAuth: true }, ...baseNavItems ]
    : baseNavItems;

  const handleLogout = async () => {
    await logOut();
    toast({ title: 'Logged Out Successfully' });
    router.push('/'); // Redirect to home after logout
    router.refresh(); // Force refresh potentially needed data on other pages
  };

    // Function to get initials from email
   const getInitials = (email?: string | null) => {
       if (!email) return 'U'; // Default 'U' for User
       return email.charAt(0).toUpperCase();
   };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Desktop Logo and Nav */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-primary">
              <path fillRule="evenodd" d="M15.75 2.25H21a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V4.81L12.97 12H18a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0v-3.567l-7.5-7.5H10.5a.75.75 0 0 1 0 1.5H4.81L3.03 6.03a.75.75 0 0 1 1.06-1.06L6 6.718V3a.75.75 0 0 1 .75-.75h5.25a.75.75 0 0 1 0 1.5H8.152l7.5 7.5h-1.82a.75.75 0 0 1-.703-1.136l1.618-2.311Z" clipRule="evenodd" />
            </svg>
            <span className="font-bold">LinguaLeap</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems
                .filter(item => !item.requiresAuth || currentUser) // Filter out auth-required items if not logged in
                .map((item) => (
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

         {/* Mobile Menu Trigger and Logo */}
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
                {navItems
                    .filter(item => !item.requiresAuth || currentUser) // Filter out auth-required items if not logged in
                    .map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center space-x-2 px-6 py-2 text-foreground hover:bg-accent hover:text-accent-foreground rounded-md"
                    >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                    </Link>
                ))}
                 <DropdownMenuSeparator className="mx-6" />
                 {/* Auth Buttons in Mobile Menu */}
                 {!loading && (
                     currentUser ? (
                        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start px-6">
                          <LogOut className="mr-2 h-5 w-5" />
                           <span>Log Out</span>
                        </Button>
                     ) : (
                         <>
                            <Link href="/login" className="block">
                                <Button variant="ghost" className="w-full justify-start px-6">Log In</Button>
                            </Link>
                            <Link href="/signup" className="block">
                                <Button className="w-full justify-start mx-6 my-1" style={{ width: 'calc(100% - 3rem)' }}>Sign Up</Button>
                            </Link>
                        </>
                     )
                 )}
              </nav>
            </SheetContent>
          </Sheet>
           {/* Mobile Logo */}
          <Link href="/" className="flex items-center space-x-2 md:hidden">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-primary">
              <path fillRule="evenodd" d="M15.75 2.25H21a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V4.81L12.97 12H18a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0v-3.567l-7.5-7.5H10.5a.75.75 0 0 1 0 1.5H4.81L3.03 6.03a.75.75 0 0 1 1.06-1.06L6 6.718V3a.75.75 0 0 1 .75-.75h5.25a.75.75 0 0 1 0 1.5H8.152l7.5 7.5h-1.82a.75.75 0 0 1-.703-1.136l1.618-2.311Z" clipRule="evenodd" />
            </svg>
            <span className="font-bold">LinguaLeap</span>
          </Link>
        </div>

        {/* Desktop Auth Buttons/User Menu */}
        <div className="hidden md:flex flex-1 items-center justify-end space-x-4">
          {!loading && (
             currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                       <Avatar className="h-8 w-8">
                          {/* Add AvatarImage if you store user profile pics */}
                          {/* <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || "User"} /> */}
                          <AvatarFallback>{getInitials(currentUser.email)}</AvatarFallback>
                       </Avatar>
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">My Account</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {currentUser.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/dashboard">
                        <DropdownMenuItem>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </DropdownMenuItem>
                    </Link>
                     <DropdownMenuItem disabled> {/* Add links to profile/settings later */}
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                 <Link href="/login">
                     <Button variant="ghost">Log In</Button>
                 </Link>
                 <Link href="/signup">
                     <Button>Sign Up</Button>
                 </Link>
              </>
            )
          )}
          {/* Show a simple loading state or nothing while checking auth */}
           {loading && <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>}
        </div>
      </div>
    </header>
  );
}
