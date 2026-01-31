import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute:', { loading, user: user?.id });

  if (loading) {
    console.log('⏳ ProtectedRoute: Still loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Cargando...</span>
      </div>
    );
  }

  if (!user) {
    console.log('🔐 ProtectedRoute: No user, redirecting to login');
    // Redirigir a la página de login manteniendo la ubicación actual
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('✅ ProtectedRoute: User authenticated, rendering children');
  return <>{children}</>;
}