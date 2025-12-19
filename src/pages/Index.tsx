import { HeroSection } from "@/components/HeroSection";
import { FourPillarHub } from "@/components/FourPillarHub";
import { KidsPlayground } from "@/components/KidsPlayground";
import { PracticeCard } from "@/components/PracticeCard";
import { ParentDashboard } from "@/components/ParentDashboard";
import { TeacherPortal } from "@/components/TeacherPortal";
import { TherapistPortal } from "@/components/TherapistPortal";
import { DataLoop } from "@/components/DataLoop";
import { EthicsSection } from "@/components/EthicsSection";
import { PricingSection } from "@/components/PricingSection";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Stammerly | Speech Therapy Platform for Kids, Parents, Teachers & Therapists</title>
        <meta 
          name="description" 
          content="Stammerly empowers every voice through synchronised care. A collaborative speech therapy platform connecting children, parents, teachers, and therapists. Start your 14-day free pilot today." 
        />
        <meta name="keywords" content="speech therapy, stammering, stuttering, speech-language pathology, SLP, fluency, children speech therapy, Lidcombe, IEP" />
        <link rel="canonical" href="https://stammerly.com" />
      </Helmet>
      
      <main className="min-h-screen">
        {/* CARD 1: Hero Section */}
        <HeroSection />
        
        {/* CARD 2: Four Pillar Hub */}
        <section id="features">
          <FourPillarHub />
        </section>
        
        {/* CARD 3: Kids Playground */}
        <section id="kids-section">
          <KidsPlayground />
        </section>
        
        {/* CARD 4: Practice Card Technical Preview */}
        <PracticeCard />
        
        {/* CARD 5: Parent Dashboard */}
        <section id="parent-section">
          <ParentDashboard />
        </section>
        
        {/* CARD 6: Teacher Portal */}
        <section id="teacher-section">
          <TeacherPortal />
        </section>
        
        {/* CARD 7: Therapist Clinical Portal */}
        <section id="therapist-section">
          <TherapistPortal />
        </section>
        
        {/* CARD 8: Data Loop */}
        <section id="how-it-works">
          <DataLoop />
        </section>
        
        {/* CARD 9: Ethics Section */}
        <EthicsSection />
        
        {/* CARD 10: Pricing & Founder Bio */}
        <section id="pricing">
          <PricingSection />
        </section>
        
        {/* Footer */}
        <Footer />
      </main>
    </>
  );
};

export default Index;
