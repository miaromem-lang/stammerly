import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DevRoleSwitcher } from "@/components/DevRoleSwitcher";
import { AccessibilityProvider } from "@/hooks/useAccessibility";
import Index from "./pages/Index";
import DevHome from "./pages/DevHome";
import Auth from "./pages/Auth";
import WaitlistThankYou from "./pages/WaitlistThankYou";
import KidHub from "./pages/KidHub";
import ParentHub from "./pages/ParentHub";
import TeacherHub from "./pages/TeacherHub";
import TherapistHub from "./pages/TherapistHub";
import TherapistAnalyticsHub from "./pages/TherapistAnalyticsHub";
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
import ChildrensPrivacy from "./pages/ChildrensPrivacy";
import NhsCompliance from "./pages/NhsCompliance";
import AccessibilityStatement from "./pages/AccessibilityStatement";
import KidHubOverview from "./pages/KidHubOverview";
import StoryExercise from "./pages/StoryExercise";
import FreeTalk from "./pages/FreeTalk";
import SelectRole from "./pages/SelectRole";
import Product from "./pages/Product";
import HardwareSafety from "./pages/HardwareSafety";
import Procurement from "./pages/Procurement";
import PendantSetup from "./pages/PendantSetup";
import SystemStatus from "./pages/SystemStatus";
import Blog from "./pages/Blog";
import Roadmap from "./pages/Roadmap";
import AlgorithmChangelog from "./pages/AlgorithmChangelog";
import NhsWaitTimes from "./pages/NhsWaitTimes";
import FindTherapist from "./pages/FindTherapist";
import RegulatoryStatus from "./pages/RegulatoryStatus";
import SensoryFitGuide from "./pages/SensoryFitGuide";
import FundingSupport from "./pages/FundingSupport";
import TechnicalIntegration from "./pages/TechnicalIntegration";
import AdminHub from "./pages/AdminHub";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DevRoleSwitcher />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/dev" element={<DevHome />} />
            <Route path="/signin" element={<Auth />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/about" element={<About />} />
            <Route path="/our-story" element={<OurStory />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/research" element={<Research />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/team" element={<Team />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/childrens-privacy" element={<ChildrensPrivacy />} />
            <Route path="/nhs-compliance" element={<NhsCompliance />} />
            <Route path="/accessibility" element={<AccessibilityStatement />} />
            <Route path="/product" element={<Product />} />
            <Route path="/hardware-safety" element={<HardwareSafety />} />
            <Route path="/procurement" element={<Procurement />} />
            <Route path="/system-status" element={<SystemStatus />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/algorithm-changelog" element={<AlgorithmChangelog />} />
            <Route path="/nhs-wait-times" element={<NhsWaitTimes />} />
            <Route path="/nhs-wait-times/:region" element={<NhsWaitTimes />} />
            <Route path="/find-a-therapist" element={<FindTherapist />} />
            <Route path="/regulatory" element={<RegulatoryStatus />} />
            <Route path="/sensory-fit-guide" element={<SensoryFitGuide />} />
            <Route path="/funding-support" element={<FundingSupport />} />
            <Route path="/technical-integration" element={<TechnicalIntegration />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/hub/kid" element={<ProtectedRoute allowedRoles={['kid']}><KidHub /></ProtectedRoute>} />
            <Route path="/hub/parent" element={<ProtectedRoute allowedRoles={['parent']}><ParentHub /></ProtectedRoute>} />
            <Route path="/hub/parent/pendant-setup" element={<ProtectedRoute allowedRoles={['parent']}><PendantSetup /></ProtectedRoute>} />
            <Route path="/hub/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherHub /></ProtectedRoute>} />
            <Route path="/hub/therapist" element={<ProtectedRoute allowedRoles={['therapist', 'admin']}><TherapistHub /></ProtectedRoute>} />
            <Route path="/hub/kid-overview" element={<ProtectedRoute allowedRoles={['kid']}><KidHubOverview /></ProtectedRoute>} />
            <Route path="/story-exercise" element={<ProtectedRoute><StoryExercise /></ProtectedRoute>} />
            <Route path="/free-talk" element={<ProtectedRoute><FreeTalk /></ProtectedRoute>} />
            <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
            <Route path="/analytics/:role" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/therapist-analytics" element={<ProtectedRoute allowedRoles={['therapist', 'admin']}><TherapistAnalyticsHub /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminHub /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
