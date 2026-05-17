import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import AdminFloatingToggle from '@/components/admin/AdminFloatingToggle';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Layout
import AppLayout from '@/components/layout/AppLayout';

// Pages
import Dashboard from '@/pages/Dashboard';
import Signals from '@/pages/Signals';
import PaperTrading from '@/pages/PaperTrading';
import BotRental from '@/pages/BotRental';
import MyMentors from '@/pages/MyMentors';
import Watchlists from '@/pages/Watchlists';
import Leaderboard from '@/pages/Leaderboard.jsx';
import Community from '@/pages/Community';
import Education from '@/pages/Education';
import Feedback from '@/pages/Feedback';
import Settings from '@/pages/Settings';
import ForgotPassword from '@/pages/ForgotPassword';
import CinematicIntro from '@/pages/CinematicIntro';
import RentalRoom from '@/pages/RentalRoom';
import FacultySitIn from '@/pages/FacultySitIn';
import AcademyHub from '@/pages/AcademyHub';
import Backtester from '@/pages/Backtester';
import RiskAnalysis from '@/pages/RiskAnalysis';
import RiskMonitoring from '@/pages/RiskMonitoring';
import TraderProfile from '@/pages/TraderProfile';
import Terms from '@/pages/Terms';
import StereoPlayer from '@/pages/StereoPlayer';
import Landing from '@/pages/Landing';
import AcademyStore from '@/pages/AcademyStore';
import TradingPlatformCheckout from '@/pages/TradingPlatformCheckout';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import RobotDemo from '@/pages/RobotDemo';
import SceneStudio from '@/pages/SceneStudio';
import DirectorsCut from '@/pages/DirectorsCut';
import SovereignLogPage from '@/pages/SovereignLog';
import LessonScriptGenerator from '@/pages/LessonScriptGenerator';
import VoiceStudio from '@/pages/VoiceStudio.jsx';
import NarrativePortal from '@/pages/NarrativePortal';
import AudioStudio from '@/pages/AudioStudio';
import AcademyCommand from '@/pages/AcademyCommand';
import GraduationCeremony from '@/pages/GraduationCeremony';
import CharacterLockStudio from '@/pages/CharacterLockStudio';
import BridgeMaster from '@/pages/BridgeMaster.jsx';
import TheBard from '@/pages/TheBard';
import Affiliates from '@/pages/Affiliates';
import ScopeTesting from '@/pages/ScopeTesting';
import BrandingShowcase from '@/pages/BrandingShowcase';
import CharacterProfiles from '@/pages/CharacterProfiles';
import CharacterTimeline from '@/pages/CharacterTimeline';
import AssetDashboard from '@/pages/AssetDashboard';
import PromptPlayground from '@/pages/PromptPlayground';
import StoryboardExport from '@/pages/StoryboardExport';
import RenderPipeline from '@/pages/RenderPipeline';
import OfficeHours from '@/pages/OfficeHours';
import BridgeMasterSite from '@/pages/BridgeMasterSite';
import MissionControl from '@/pages/MissionControl';
import VoiceCloningLab from '@/pages/VoiceCloningLab';
import SceneSandbox from '@/pages/SceneSandbox';
import ProductionMetrics from '@/pages/ProductionMetrics';
import DeviceMockup from '@/pages/DeviceMockup';
import PageIndex from '@/pages/PageIndex';
import ThemeSwitcher from '@/pages/ThemeSwitcher';
import BrandShowcase from '@/pages/BrandShowcase';
import WelcomePacketScene from '@/components/intro/WelcomePacketScene';
import Imaginarium from '@/pages/Imaginarium';
import CharacterDesignLab from '@/pages/CharacterDesignLab';
import AdminPreview from '@/pages/AdminPreview';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 bg-[#070b14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#1e293b] border-t-[#00d4aa] rounded-full animate-spin"></div>
          <p className="text-xs text-[#64748b]">Loading IINT Platform...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Public pages (no layout) */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/academy-store" element={<AcademyStore />} />
      <Route path="/trading-platform" element={<TradingPlatformCheckout />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/intro" element={<CinematicIntro />} />
      <Route path="/rental-room" element={<RentalRoom />} />

      {/* App pages (with layout) */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/signals" element={<Signals />} />
        <Route path="/paper-trading" element={<PaperTrading />} />
        <Route path="/bot-rental" element={<BotRental />} />
        <Route path="/my-mentors" element={<MyMentors />} />
        <Route path="/watchlists" element={<Watchlists />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/community" element={<Community />} />
        <Route path="/education" element={<Education />} />
        <Route path="/faculty-sit-in" element={<FacultySitIn />} />
        <Route path="/academy-hub" element={<AcademyHub />} />
        <Route path="/backtester" element={<Backtester />} />
        <Route path="/risk-analysis" element={<RiskAnalysis />} />
        <Route path="/risk-monitoring" element={<RiskMonitoring />} />
        <Route path="/trader-profile" element={<TraderProfile />} />
        <Route path="/stereo" element={<StereoPlayer />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="/terms" element={<Terms />} />
      <Route path="/robot-demo" element={<RobotDemo />} />
      <Route path="/scene-studio" element={<SceneStudio />} />
      <Route path="/directors-cut" element={<DirectorsCut />} />
      <Route path="/sovereign-log" element={<SovereignLogPage />} />
      <Route path="/lesson-generator" element={<LessonScriptGenerator />} />
      <Route path="/voice-studio" element={<VoiceStudio />} />
      <Route path="/narrative-portal" element={<NarrativePortal />} />
      <Route path="/audio-studio" element={<AudioStudio />} />
      <Route path="/academy-command" element={<AcademyCommand />} />
      <Route path="/graduation" element={<GraduationCeremony />} />
      <Route path="/character-lock" element={<CharacterLockStudio />} />
      <Route path="/bridge-master" element={<BridgeMaster />} />
      <Route path="/the-bard" element={<TheBard />} />
      <Route path="/affiliates" element={<Affiliates />} />
      <Route path="/scope-testing" element={<ScopeTesting />} />
      <Route path="/branding" element={<BrandingShowcase />} />
      <Route path="/character-profiles" element={<CharacterProfiles />} />
      <Route path="/character-timeline" element={<CharacterTimeline />} />
      <Route path="/asset-dashboard" element={<AssetDashboard />} />
      <Route path="/prompt-playground" element={<PromptPlayground />} />
      <Route path="/storyboard" element={<StoryboardExport />} />
      <Route path="/render-pipeline" element={<RenderPipeline />} />
      <Route path="/office-hours" element={<OfficeHours />} />
      <Route path="/thebridge" element={<BridgeMasterSite />} />
      <Route path="/mission-control" element={<MissionControl />} />
      <Route path="/voice-cloning-lab" element={<VoiceCloningLab />} />
      <Route path="/scene-sandbox" element={<SceneSandbox />} />
      <Route path="/production-metrics" element={<ProductionMetrics />} />
      <Route path="/device-mockup" element={<DeviceMockup />} />
      <Route path="/page-index" element={<PageIndex />} />
      <Route path="/theme-switcher" element={<ThemeSwitcher />} />
      <Route path="/brand-showcase" element={<BrandShowcase />} />
      <Route path="/welcome-scene" element={<WelcomePacketScene onComplete={() => window.history.back()} onSkip={() => window.history.back()} />} />
      <Route path="/imaginarium" element={<Imaginarium />} />
      <Route path="/character-design-lab" element={<CharacterDesignLab />} />
      <Route path="/admin-preview" element={<AdminPreview />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
          <NotificationCenter />
          <AdminFloatingToggle />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;