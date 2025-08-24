import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/LoadingState';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'student';
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole = 'admin',
  fallbackPath = '/' 
}: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingState />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-auto text-center p-6">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to access this page.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link to={fallbackPath}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (requiredRole === 'admin' && userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-auto text-center p-6">
          <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page. Admin privileges are required.
          </p>
          <div className="space-y-3">
            <Button variant="ghost" asChild className="w-full">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link to={fallbackPath}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}