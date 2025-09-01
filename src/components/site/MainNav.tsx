import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, X, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const navLinks = [
  { name: 'Home', path: '/', title: 'Go to homepage', icon: Sparkles },
  { name: 'Courses', path: '/courses', title: 'Browse available courses' },
  { name: 'Portfolio', path: '/portfolio', title: 'View project portfolio' },
  { name: 'Blog', path: '/blog', title: 'Read our blog' },
  { name: 'Contact', path: '/contact', title: 'Get in touch' },
  { name: 'Career', path: '/career', title: 'Career opportunities' },
];

interface MainNavProps {
  className?: string;
  scrolled?: boolean;
}

export function MainNav({ className, scrolled = false }: MainNavProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Debug logging
  console.log('MainNav render:', { isMobile, location: location.pathname, scrolled });

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
        'relative text-sm font-medium transition-all duration-200 group',
        'focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 rounded-lg px-3 py-2',
        mobile 
          ? 'block w-full text-left py-4 px-6 text-base border-b border-violet-100 last:border-0 hover:bg-violet-50/50'
          : 'hover:bg-violet-50/50 transition-colors',
        isActive(link.path)
          ? 'text-violet-700 font-semibold bg-violet-50/80' 
          : 'text-violet-600 hover:text-violet-700',
        className
      )}
      onClick={mobile ? () => setIsOpen(false) : undefined}
    >
      <div className="flex items-center gap-2">
        {link.icon && <link.icon className="w-4 h-4" />}
        {link.name}
      </div>
      {!mobile && isActive(link.path) && (
        <span 
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-violet-600 rounded-full transition-all duration-300"
          aria-hidden="true"
        />
      )}
    </Link>
  );

  // Show mobile menu button for small screens
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="md:hidden hover:bg-violet-50 transition-all duration-300"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5 text-violet-600" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0 bg-white border-r border-violet-100">
          <div className="flex items-center justify-between p-6 border-b border-violet-100 bg-violet-50/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-violet-900">Navigation</span>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="sm" aria-label="Close navigation menu" className="hover:bg-violet-100">
                <X className="h-4 w-4 text-violet-600" />
              </Button>
            </SheetClose>
          </div>
          <nav className="py-6" role="navigation" aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavLink key={link.path} link={link} mobile />
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    );
  }

  // Show desktop navigation for larger screens or while loading
  return (
    <nav className="hidden md:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
      {navLinks.map((link) => (
        <NavLink key={link.path} link={link} />
      ))}
    </nav>
  );
}