import { Helmet } from "react-helmet-async";
import { StammerDetector } from "@/components/StammerDetector";
import { HubNavigation } from "@/components/HubNavigation";

const Session = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Helmet>
        <title>Live Session | Stammerly</title>
        <meta name="description" content="Real-time stammer detection session with Stammerly." />
        <link rel="canonical" href="/session" />
      </Helmet>
      <HubNavigation />
      <main className="container mx-auto px-4 py-10 flex justify-center">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-6 md:p-10">
          <h1 className="sr-only">Live Stammer Detection Session</h1>
          <StammerDetector childName="Leo" childId="child_001" defaultView="parent" />
        </div>
      </main>
    </div>
  );
};

export default Session;
