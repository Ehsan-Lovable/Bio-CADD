import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const navLinks = [
  { name: 'Home', path: '/', title: 'Go to homepage' },
  { name: 'Courses', path: '/courses', title: 'Browse available courses' },
  { name: 'Portfolio', path: '/portfolio', title: 'View project portfolio' },
  { name: 'Blog', path: '/blog', title: 'Read our blog' },
  { name: 'Contact', path: '/contact', title: 'Get in touch' },
  { name: 'Career', path: '/career', title: 'Career opportunities' },
];

interface MainNavProps {
  className?: string;
}

export function MainNav({ className }: MainNavProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close mobile menu on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const NavLink = ({ link, mobile = false }: { link: typeof navLinks[0], mobile?: boolean }) => (
    <Link
      to={link.path}
      title={link.title}
      aria-current={isActive(link.path) ? 'page' : undefined}
      className={cn(
        'relative text-sm font-medium transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-2 py-1',
        mobile 
          ? 'block w-full text-left py-3 px-4 text-base border-b border-border last:border-0'
          : 'hover:text-foreground',
        isActive(link.path)
          ? 'text-foreground font-semibold'
          : 'text-muted-foreground',
        className
      )}
      onClick={mobile ? () => setIsOpen(false) : undefined}
    >
      {link.name}
      {!mobile && isActive(link.path) && (
        <span 
          className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full"
          aria-hidden="true"
        />
      )}
    </Link>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <span className="font-semibold text-lg">Navigation</span>
            <SheetClose asChild>
              <Button variant="ghost" size="sm" aria-label="Close navigation menu">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          <nav className="py-4" role="navigation" aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavLink key={link.path} link={link} mobile />
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
      {navLinks.map((link) => (
        <NavLink key={link.path} link={link} />
      ))}
    </nav>
  );
}