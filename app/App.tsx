import React, { useEffect } from 'react';
import './i18n'; // Import i18n to ensure initialization
import AppRouter from './router/AppRouter.tsx';
import { AuthProvider } from './hooks/useAuth.tsx'; // Updated import path
import { initializeSampleData } from './constants.ts';

const App = () => {
  useEffect(() => {
    // Initialize sample data for testing
    initializeSampleData();
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <AppRouter />
      </div>
    </AuthProvider>
  );
};

export default App;