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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to signin, preserving the intended destination
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If specific roles are required, check if user has one of them
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to appropriate hub based on user's actual role
    const roleToHub: Record<AppRole, string> = {
      kid: '/hub/kid',
      parent: '/hub/parent',
      teacher: '/hub/teacher',
      therapist: '/hub/therapist',
      admin: '/hub/therapist', // Admin can access therapist hub
    };
    return <Navigate to={roleToHub[role]} replace />;
  }

  return <>{children}</>;
}
