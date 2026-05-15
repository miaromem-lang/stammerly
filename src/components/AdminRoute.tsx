import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import PageBackground from '@/components/PageBackground';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Strict admin-only guard for /admin and AdminHub.
 * Unlike ProtectedRoute, this DOES NOT honour the dev_admin_bypass
 * sessionStorage flag — only authenticated users with the `admin`
 * role granted via the database (user_roles) may pass.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <PageBackground />
        <Card className="w-full max-w-md bg-card/95 backdrop-blur border shadow-xl relative">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-3">
              <ShieldAlert className="w-7 h-7 text-destructive" />
            </div>
            <CardTitle className="font-display text-xl">Admin access required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              This area is restricted to authorised Stammerly administrators.
              Your account does not have the admin role.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <Button asChild variant="outline">
                <Link to="/">Go home</Link>
              </Button>
              <Button asChild>
                <Link to="/signin">Sign in as admin</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

export default AdminRoute;
