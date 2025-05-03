export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8 mt-12">
      <div className="container flex flex-col items-center justify-center md:flex-row md:justify-between">
        <p className="text-sm text-muted-foreground text-center md:text-left">
          © {new Date().getFullYear()} LinguaLeap. All rights reserved.
        </p>
        <nav className="flex gap-4 mt-4 md:mt-0">
          <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
            Privacy Policy
          </a>
          <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
            Terms of Service
          </a>
        </nav>
      </div>
    </footer>
  );
}
