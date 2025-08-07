import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import './App.css';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Retry sayısını azalttık
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Max delay'i azalttık
      refetchOnWindowFocus: false, // Window focus'ta refetch yapmasın
      refetchOnReconnect: false, // Reconnect'te refetch yapmasın
      refetchOnMount: false, // Mount'ta refetch yapmasın
      staleTime: 15 * 60 * 1000, // 15 dakika (daha uzun)
      gcTime: 30 * 60 * 1000, // 30 dakika (daha uzun)
      refetchInterval: false, // Otomatik refetch yapmasın
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </div>
          </Router>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
