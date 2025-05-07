
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@radix-ui/react-tooltip';

// Components
import { Toaster } from '@/components/ui/sonner';
import Layout from '@/components/Layout';
import LoginPage from '@/components/auth/LoginPage';

// Context
import { AuthProvider } from '@/context/AuthContext';

// Pages
import Dashboard from '@/pages/Dashboard';
import AddRecord from '@/pages/AddRecord';
import ViewRecords from '@/pages/ViewRecords';
import EditRecord from '@/pages/EditRecord';
import Profile from '@/pages/Profile';
import Summary from '@/pages/Summary';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import Subscribe from '@/pages/Subscribe';
import SubscriptionManagement from '@/pages/SubscriptionManagement';
import LandingPage from '@/pages/LandingPage';
import Index from '@/pages/Index';

// Style
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public routes outside of Layout */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                
                {/* Default route for authenticated users and redirection */}
                <Route path="/index" element={<Index />} />
                
                {/* Protected routes inside Layout */}
                <Route path="/" element={<Layout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="records" element={<ViewRecords />} />
                  <Route path="records/edit/:id" element={<EditRecord />} />
                  <Route path="add-record" element={<AddRecord />} />
                  <Route path="summary" element={<Summary />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="subscribe" element={<Subscribe />} />
                  <Route path="subscription" element={<SubscriptionManagement />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
              <Toaster />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
