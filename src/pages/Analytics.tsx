import { useEffect, useState } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, BarChart3 } from "lucide-react";
import PageBackground from "@/components/PageBackground";
import { HubNavigation } from "@/components/HubNavigation";

/**
 * /analytics/:role validates the role param and redirects to the
 * matching hub analytics page. Shows a brief loading skeleton while
 * the destination is being determined; renders a friendly fallback
 * for unknown roles.
 */
const ROLE_ROUTES: Record<string, string> = {
  kid: "/hub/kid",
  parent: "/hub/parent",
  teacher: "/hub/teacher",
  therapist: "/therapist-analytics",
};

const Analytics = () => {
  const { role } = useParams();
  const [ready, setReady] = useState(false);

  // Brief skeleton tick so the user sees confirmation before navigating.
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 350);
    return () => clearTimeout(t);
  }, []);

  const target = role ? ROLE_ROUTES[role] : undefined;

  // Unknown / missing role — show friendly fallback (no auto-redirect).
  if (role && !target) {
    return (
      <div className="min-h-screen relative">
        <PageBackground />
        <HubNavigation />
        <main className="container mx-auto px-4 py-12 max-w-xl">
          <Card className="glass-card-strong">
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" aria-hidden />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Unknown analytics role
              </h1>
              <p className="text-sm text-muted-foreground">
                We couldn't find an analytics view for{" "}
                <code className="px-1.5 py-0.5 rounded bg-muted text-foreground">
                  {role}
                </code>
                . Choose a valid role below.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {Object.entries(ROLE_ROUTES).map(([r, path]) => (
                  <Button key={r} asChild variant="outline" className="capitalize">
                    <Link to={path}>{r}</Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Valid role + skeleton elapsed → redirect.
  if (ready && target) {
    return <Navigate to={target} replace />;
  }

  // Loading skeleton while we resolve the destination.
  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <HubNavigation />
      <main
        className="container mx-auto px-4 py-10 max-w-3xl"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-primary" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Loading {role ? `${role} ` : ""}analytics…
          </p>
        </div>

        <Card className="glass-card mb-6">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-8 w-16 mx-auto" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-card-strong">
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </CardContent>
        </Card>

        <span className="sr-only">Redirecting to your analytics dashboard.</span>
      </main>
    </div>
  );
};

export default Analytics;
