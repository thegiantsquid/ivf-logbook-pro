
import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Toaster } from '@/components/ui/sonner';

const Layout: React.FC = () => {
  const {
    currentUser,
    loading
  } = useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 rounded-full border-4 border-t-primary border-primary/20 animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>;
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{
      from: location
    }} replace />;
  }
  
  return <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-hidden bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col w-full overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-background">
            <div className="page-transition max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </SidebarProvider>;
};

export default Layout;
