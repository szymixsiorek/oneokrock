import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import ParticleBackground from "@/components/ParticleBackground";
import FloatingNav from "@/components/FloatingNav";
import PlayerBar from "@/components/PlayerBar";
import Index from "./pages/Index";
import Albums from "./pages/Albums";
import AlbumDetail from "./pages/AlbumDetail";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import LearnMore from "./pages/LearnMore";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AudioPlayerProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ParticleBackground />
          <FloatingNav />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/albums" element={<Albums />} />
            <Route path="/album/:slug" element={<AlbumDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/learn-more" element={<LearnMore />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <PlayerBar />
        </BrowserRouter>
      </AudioPlayerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
