import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomeScreen from './pages/HomeScreen';
import StoryScreen from './pages/StoryScreen';
import HistoryScreen from './pages/HistoryScreen';
import CharactersScreen from './pages/CharactersScreen';
import SettingsScreen from './pages/SettingsScreen';
import BottomNav from './components/BottomNav';
import SplashScreen from './components/SplashScreen';
import { ExpandIcon, ShrinkIcon } from './components/icons/Icons';
import { StoryHistoryProvider } from './context/StoryHistoryContext';

const App: React.FC = () => {
  return (
    <HashRouter>
      <StoryHistoryProvider>
        <Main />
      </StoryHistoryProvider>
    </HashRouter>
  );
};

const Main: React.FC = () => {
  const location = useLocation();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSplash, setShowSplash] = useState(!sessionStorage.getItem('splashShown'));
  const showBottomNav = location.pathname !== '/story';

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullScreen(true));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullScreen(false));
      }
    }
  }, []);
  
  // Listen for fullscreen changes (e.g., user pressing ESC)
  useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullScreenChange);
  }, []);

  // Timer to hide splash screen
  useEffect(() => {
    if (showSplash) {
      sessionStorage.setItem('splashShown', 'true');
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 3500); // Splash screen duration
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  return (
    <div className="h-screen w-screen flex flex-col items-center bg-gradient-to-b from-orange-50 to-amber-100 font-sans relative">
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>

      <button 
        onClick={toggleFullScreen} 
        className="absolute top-5 right-5 z-50 p-2.5 bg-white/60 rounded-full text-gray-700 backdrop-blur-md shadow-md hover:bg-white/90 transition-all duration-200"
        aria-label={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullScreen ? <ShrinkIcon /> : <ExpandIcon />}
      </button>
      <main className="flex-grow w-full max-w-md mx-auto overflow-y-auto">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/story" element={<StoryScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/characters" element={<CharactersScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

export default App;