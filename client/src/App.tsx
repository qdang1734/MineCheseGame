import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { Router, Route } from "wouter";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Stats from "./pages/Stats";
import Invite from "./pages/Invite";
import Earn from "./pages/Earn";
import Wallet from "./pages/Wallet";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Profile from "./pages/Profile";
import Telegram from "./pages/Telegram";
import { ActiveScreen } from "./lib/types";
import backgroundImage from '@/assets/background.png';
import { LanguageProvider } from "./providers/LanguageProvider";

function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("home");
  const [previousScreen, setPreviousScreen] = useState<ActiveScreen | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Extract token from URL query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      setAuthToken(tokenFromUrl);
      
      // Use try-catch to handle potential localStorage security errors
      try {
        // Store token in localStorage for persistence across page refreshes
        localStorage.setItem('authToken', tokenFromUrl);
      } catch (e) {
        console.log('Notice: Could not access localStorage. Session will be temporary.');
        // Continue with the token in memory only
      }
      
      // Optionally remove token from URL for security
      if (window.history && window.history.replaceState) {
        try {
          // Create a new URL without the token
          const cleanUrl = window.location.protocol + "//" + 
                          window.location.host + 
                          window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch (e) {
          console.log('Notice: Could not modify browser history.');
        }
      }
    } else {
      // Check localStorage if no token in URL
      try {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
          setAuthToken(storedToken);
        }
      } catch (e) {
        console.log('Notice: Could not access localStorage.');
      }
    }
  }, []);

  // Add token to all API requests
  useEffect(() => {
    if (authToken) {
      // Configure axios or fetch default headers
      // This will be handled by the queryClient in lib/queryClient.ts
      
      // For debugging
      console.log("User authenticated with Telegram token");
    }
  }, [authToken]);

  const handleScreenChange = (screen: ActiveScreen) => {
    setPreviousScreen(activeScreen);
    setActiveScreen(screen);
  };

  const handleBack = () => {
    if (previousScreen) {
      setActiveScreen(previousScreen);
      setPreviousScreen(null);
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case "home":
        return <Home />;
      case "stats":
        return <Stats />;
      case "invite":
        return <Invite />;
      case "earn":
        return <Earn />;
      case "wallet":
        return <Wallet onScreenChange={handleScreenChange} />;
      case "deposit":
        return <Deposit onBack={handleBack} />;
      case "withdraw":
        return <Withdraw onBack={handleBack} />;
      case "profile":
        return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Router>
            <div className="flex justify-center items-start min-h-screen w-full bg-gray-900">
              <div className="w-full max-w-sm mx-auto h-screen overflow-y-auto overflow-x-hidden relative bg-black/30 shadow-2xl shadow-black/60 mobile-container" style={{ 
                maxHeight: '100vh', 
                width: 'var(--mobile-width)', 
                touchAction: 'manipulation',
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}>
                <div className="absolute inset-0 bg-black/75 z-0"></div>
                <main className="pb-16 relative z-10">
                  <Route path="/telegram" component={Telegram} />
                  <Route path="/">
                    {renderScreen()}
                  </Route>
                </main>
                <Navigation 
                  activeScreen={activeScreen} 
                  onScreenChange={handleScreenChange} 
                />
                <Toaster />
              </div>
            </div>
          </Router>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
