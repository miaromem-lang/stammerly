import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const DevHome = () => {
  return (
    <>
      <Helmet>
        <title>Stammerly | Speech Therapy Platform for Kids, Parents, Teachers & Therapists</title>
        <meta 
          name="description" 
          content="Stammerly empowers every voice through synchronised care. A collaborative speech therapy platform connecting children, parents, teachers, and therapists. Start your 14-day free pilot today." 
        />
        <meta name="keywords" content="speech therapy, stammering, stuttering, speech-language pathology, SLP, fluency, children speech therapy, Lidcombe, IEP" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <main className="min-h-screen">
        {/* Hero Section with Hub Cards */}
        <HeroSection />
        
        {/* Footer */}
        <Footer />
      </main>
    </>
  );
};

export default DevHome;
