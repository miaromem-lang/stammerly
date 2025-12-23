import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import KidHub from "./pages/KidHub";
import ParentHub from "./pages/ParentHub";
import TeacherHub from "./pages/TeacherHub";
import TherapistHub from "./pages/TherapistHub";
import Practice from "./pages/Practice";
import Analytics from "./pages/Analytics";
import About from "./pages/About";
import OurStory from "./pages/OurStory";
import Mission from "./pages/Mission";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Research from "./pages/Research";
import Contact from "./pages/Contact";
import Team from "./pages/Team";
import Reviews from "./pages/Reviews";

import KidHubOverview from "./pages/KidHubOverview";
import StoryExercise from "./pages/StoryExercise";
import FreeTalk from "./pages/FreeTalk";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/hub/kid" element={<KidHub />} />
            <Route path="/hub/parent" element={<ParentHub />} />
            <Route path="/hub/teacher" element={<TeacherHub />} />
            <Route path="/hub/therapist" element={<TherapistHub />} />
            <Route path="/hub/kid-overview" element={<KidHubOverview />} />
            <Route path="/story-exercise" element={<StoryExercise />} />
            <Route path="/free-talk" element={<FreeTalk />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/analytics/:role" element={<Analytics />} />
            <Route path="/about" element={<About />} />
            <Route path="/our-story" element={<OurStory />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/research" element={<Research />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/team" element={<Team />} />
            <Route path="/reviews" element={<Reviews />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;