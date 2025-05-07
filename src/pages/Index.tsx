import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { currentUser, loading } = useAuth();
  
  // If loading, show nothing yet
  if (loading) return null;
  
  // If user is logged in, redirect to dashboard
  if (currentUser) {
    console.log('User is logged in, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  // Otherwise redirect to landing page
  console.log('User is not logged in, redirecting to landing page');
  return <Navigate to="/" replace />;
};

export default Index;
