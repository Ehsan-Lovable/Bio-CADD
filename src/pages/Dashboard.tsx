import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { signOut } from '@/lib/supabase/client';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome back!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">
                Email: {user?.email}
              </p>
              {userProfile && (
                <p className="text-muted-foreground">
                  Role: {userProfile.role || 'user'}
                </p>
              )}
            </CardContent>
          </Card>

          {userProfile?.role === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Panel</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate('/admin')}>
                  Go to Admin
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}