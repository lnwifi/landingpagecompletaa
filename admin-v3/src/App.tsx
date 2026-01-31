import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { UsersPage } from '@/pages/usuarios/UsersPage';
import { PetsPage } from '@/pages/mascotas/PetsPage';
import { MembershipsPage } from '@/pages/membresias/MembershipsPage';
import { ProductsPage } from '@/pages/tienda/productos/ProductsPage';
import { OrdersPage } from '@/pages/tienda/pedidos/OrdersPage';
import { CategoriesPage } from '@/pages/tienda/categorias/CategoriesPage';
import { CouponsPage } from '@/pages/tienda/cupones/CouponsPage';
import { EventsPage } from '@/pages/eventos/EventsPage';
import { PlacesPage } from '@/pages/lugares/PlacesPage';
import { BannersPage } from '@/pages/banners/BannersPage';
import { RedDeAyudaPage } from '@/pages/red-de-ayuda/RedDeAyudaPage';
import RefugiosPage from '@/pages/refugios/RefugiosPage';
import AnalyticsPage from '@/pages/analytics/AnalyticsPage';
import ConfiguracionPage from '@/pages/configuracion/ConfiguracionPage';
import NotificationsPage from '@/pages/notifications/NotificationsPage';
import { PromotionalCodesPage } from '@/pages/codigos-promocionales/PromotionalCodesPage';
import { ReportsPage } from '@/pages/reportes/ReportsPage';
import { PopupsPage } from '@/pages/popups/PopupsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="admin-container">
            <Routes>
              {/* Rutas de autenticación */}
              <Route path="/login" element={<LoginPage />} />

              {/* Rutas protegidas */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />

                {/* Gestión de usuarios */}
                <Route path="usuarios" element={<UsersPage />} />

                {/* Gestión de mascotas */}
                <Route path="mascotas" element={<PetsPage />} />

                {/* Gestión de membresías */}
                <Route path="membresias" element={<MembershipsPage />} />

                {/* Gestión de tienda */}
                <Route path="tienda">
                  <Route path="productos" element={<ProductsPage />} />
                  <Route path="pedidos" element={<OrdersPage />} />
                  <Route path="categorias" element={<CategoriesPage />} />
                  <Route path="cupones" element={<CouponsPage />} />
                </Route>

                {/* Gestión de eventos */}
                <Route path="eventos" element={<EventsPage />} />

                {/* Gestión de lugares */}
                <Route path="lugares" element={<PlacesPage />} />

                {/* Gestión de banners */}
                <Route path="banners" element={<BannersPage />} />

                {/* Gestión de Red de Ayuda */}
                <Route path="red-de-ayuda" element={<RedDeAyudaPage />} />

                {/* Gestión de Reportes */}
                <Route path="reportes" element={<ReportsPage />} />

                {/* Gestión de refugios */}
                <Route path="refugios" element={<RefugiosPage />} />

                {/* Analíticas */}
                <Route path="analytics" element={<AnalyticsPage />} />

                {/* Notificaciones */}
                <Route path="notificaciones" element={<NotificationsPage />} />

                {/* Códigos Promocionales */}
                <Route path="codigos-promocionales" element={<PromotionalCodesPage />} />

                {/* Popups de la App */}
                <Route path="popups" element={<PopupsPage />} />

                {/* Configuración */}
                <Route path="configuracion" element={<ConfiguracionPage />} />
              </Route>

              {/* Ruta por defecto */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4aed88',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ff6b6b',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;