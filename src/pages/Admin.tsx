import { useState } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  BookOpen, 
  Video, 
  FileText, 
  Users, 
  Settings,
  Upload,
  Menu,
  X,
  Briefcase
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// Import admin page components
import AdminDashboard from './admin/AdminDashboard';
import AdminCourses from './admin/AdminCourses';
import AdminPortfolio from './admin/AdminPortfolio';
import AdminLessons from './admin/AdminLessons';
import AdminResources from './admin/AdminResources';
import AdminDFTSubmissions from './admin/AdminDFTSubmissions';
import AdminUsers from './admin/AdminUsers';
import AdminSiteSettings from './admin/AdminSiteSettings';

const sidebarItems = [
  { 
    name: 'Dashboard', 
    path: '/admin', 
    icon: LayoutDashboard,
    exact: true
  },
  { 
    name: 'Courses', 
    path: '/admin/courses', 
    icon: BookOpen 
  },
  { 
    name: 'Portfolio', 
    path: '/admin/portfolio', 
    icon: Briefcase 
  },
  { 
    name: 'Lessons/Recordings', 
    path: '/admin/lessons', 
    icon: Video 
  },
  { 
    name: 'Resources', 
    path: '/admin/resources', 
    icon: FileText 
  },
  { 
    name: 'DFT Submissions', 
    path: '/admin/submissions', 
    icon: Upload 
  },
  { 
    name: 'Users', 
    path: '/admin/users', 
    icon: Users 
  },
  { 
    name: 'Site Settings', 
    path: '/admin/settings', 
    icon: Settings 
  }
];

const AdminSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-card border-r z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${!isMobile ? 'relative translate-x-0' : ''}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
            {isMobile && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={isMobile ? onClose : undefined}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${active 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="absolute bottom-6 left-6 right-6">
          <Separator className="mb-4" />
          <Link to="/dashboard">
            <Button variant="outline" className="w-full">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default function Admin() {
  const { userProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Guard against non-admin users
  if (!userProfile || userProfile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar 
        isOpen={sidebarOpen || !isMobile} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <main className={`flex-1 ${!isMobile ? 'ml-64' : ''}`}>
        {/* Mobile header */}
        {isMobile && (
          <header className="sticky top-0 z-30 bg-background border-b p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </header>
        )}
        
        <div className="p-6">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="courses/*" element={<AdminCourses />} />
            <Route path="portfolio/*" element={<AdminPortfolio />} />
            <Route path="lessons/*" element={<AdminLessons />} />
            <Route path="resources/*" element={<AdminResources />} />
            <Route path="submissions" element={<AdminDFTSubmissions />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSiteSettings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}