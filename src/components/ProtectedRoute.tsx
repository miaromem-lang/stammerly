import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  // Dev bypass for admin hub viewing via hidden /admin-login route
  const devBypass = sessionStorage.getItem("dev_admin_bypass") === "true";
  if (devBypass) {
    return <>{children}</>;
  }

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

  if (!role) {
    return <Navigate to="/select-role" replace />;
  }

  if (role === 'admin') {
    return <>{children}</>;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const roleToHub: Record<AppRole, string> = {
      kid: '/hub/kid',
      parent: '/hub/parent',
      teacher: '/hub/teacher',
      therapist: '/hub/therapist',
      admin: '/hub/therapist',
    };
    return <Navigate to={roleToHub[role]} replace />;
  }

  return <>{children}</>;
}
