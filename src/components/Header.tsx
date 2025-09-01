import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { signOut } from '@/lib/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { User, Settings, LogOut, Shield, Sparkles } from 'lucide-react';
import { SearchCommand } from '@/components/SearchCommand';
import { MainNav } from '@/components/site/MainNav';
import { useEffect, useState } from 'react';

export function Header() {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-violet-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-violet-900">
                BioGenius
              </h1>
            </div>
            <div className="animate-pulse">
              <div className="h-8 w-8 bg-violet-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl border-b border-violet-100 shadow-lg' 
        : 'bg-white/90 backdrop-blur-xl border-b border-violet-50'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-violet-700">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-violet-900 group-hover:text-violet-700 transition-colors duration-300">
                BioGenius
              </h1>
              <span className="text-xs text-violet-500 font-medium">
                Excellence in Bioinformatics
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <MainNav scrolled={scrolled} />

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <SearchCommand />

            {/* Auth Section */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-violet-50 transition-all duration-300">
                    <Avatar className="h-10 w-10 ring-2 ring-violet-100">
                      <AvatarFallback className="font-semibold bg-violet-600 text-white">
                        {userProfile?.full_name ? getInitials(userProfile.full_name) : getInitials(user.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white"></div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-3 border-violet-200 shadow-xl" align="end" forceMount>
                  <div className="flex flex-col space-y-3 p-3 bg-violet-50 rounded-lg mb-3">
                    <p className="text-sm font-semibold text-violet-900">
                      {userProfile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-violet-600">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-violet-500" />
                      <span className="text-xs text-violet-600 capitalize">
                        {userProfile?.role || 'student'}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-violet-200" />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} className="hover:bg-violet-50 rounded-lg transition-colors">
                    <User className="mr-2 h-4 w-4 text-violet-600" />
                    <span className="text-violet-900">Dashboard</span>
                  </DropdownMenuItem>
                  {userProfile?.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="hover:bg-violet-50 rounded-lg transition-colors">
                      <Shield className="mr-2 h-4 w-4 text-violet-600" />
                      <span className="text-violet-900">Admin Panel</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="hover:bg-violet-50 rounded-lg transition-colors">
                    <Settings className="mr-2 h-4 w-4 text-violet-600" />
                    <span className="text-violet-900">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-violet-200" />
                  <DropdownMenuItem onClick={handleSignOut} className="hover:bg-red-50 rounded-lg transition-colors text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/auth')}
                  className="text-violet-700 hover:text-violet-800 hover:bg-violet-50 transition-all duration-300"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="bg-violet-600 hover:bg-violet-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}