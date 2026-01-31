import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Heart,
  Crown,
  ShoppingCart,
  Calendar,
  MapPin,
  HelpCircle,
  Building,
  TrendingUp,
  DollarSign,
  Package,
  AlertCircle,
} from 'lucide-react';
import { dashboardService } from '@/services/supabase';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div className="admin-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 break-words">{value}</p>
          {trend && (
            <div className={`flex items-center mt-1 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 flex-shrink-0 ${
                !trend.isPositive ? 'rotate-180' : ''
              }`} />
              <span className="truncate">{trend.value}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
    retry: 2, // Reintentar solo 2 veces
    staleTime: 60000, // Considerar datos frescos por 1 minuto
    refetchInterval: 60000, // Refrescar cada 1 minuto
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Cargando estadísticas...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="admin-card">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Error al cargar las estadísticas
          </p>
        </div>
        <div className="admin-card">
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error.message || 'Error al cargar las estadísticas del dashboard'}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Usuarios Totales',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Usuarios Activos',
      value: stats?.activeUsers || 0,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Mascotas Registradas',
      value: stats?.totalPets || 0,
      icon: Heart,
      color: 'bg-pink-500',
    },
    {
      title: 'Mascotas Activas',
      value: stats?.activePets || 0,
      icon: Heart,
      color: 'bg-purple-500',
    },
    {
      title: 'Membresías Totales',
      value: stats?.totalMemberships || 0,
      icon: Crown,
      color: 'bg-yellow-500',
    },
    {
      title: 'Membresías Activas',
      value: stats?.activeMemberships || 0,
      icon: Crown,
      color: 'bg-orange-500',
    },
    {
      title: 'Pedidos Totales',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-indigo-500',
    },
    {
      title: 'Ingresos Totales',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'bg-green-600',
    },
    {
      title: 'Eventos',
      value: stats?.totalEvents || 0,
      icon: Calendar,
      color: 'bg-red-500',
    },
    {
      title: 'Lugares',
      value: stats?.totalPlaces || 0,
      icon: MapPin,
      color: 'bg-teal-500',
    },
    {
      title: 'Avisos Red de Ayuda',
      value: stats?.totalRedDeAyuda || 0,
      icon: HelpCircle,
      color: 'bg-cyan-500',
    },
    {
      title: 'Avisos Activos',
      value: stats?.activeRedDeAyuda || 0,
      icon: HelpCircle,
      color: 'bg-lime-500',
    },
    {
      title: 'Refugios',
      value: stats?.totalRefugios || 0,
      icon: Building,
      color: 'bg-rose-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Resumen general de la plataforma PetoClub
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Usuarios Recientes
          </h3>
          <div className="space-y-3">
            {stats?.recentUsers?.slice(0, 5).map((user, index) => (
              <div key={user.id || index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.full_name || 'Administrador'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email || 'admin@petoclub.com'}
                  </p>
                </div>
                <div className="text-right sm:text-left">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.created_at ? formatDate(user.created_at) : 'Reciente'}
                  </p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 whitespace-nowrap">
                    Activo
                  </span>
                </div>
              </div>
            ))}
            {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No hay usuarios recientes
              </p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Pedidos Recientes
          </h3>
          <div className="space-y-3">
            {stats?.recentOrders?.slice(0, 5).map((order, index) => (
              <div key={order.id || index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Cliente
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(order.total || 0)}
                  </p>
                </div>
                <div className="text-right sm:text-left">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(order.fecha_pedido)}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    order.estado_pago === 'pagado'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : order.estado_pago === 'pendiente'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {order.estado_pago === 'pagado' ? 'Pagado' :
                     order.estado_pago === 'pendiente' ? 'Pendiente' : order.estado_pago}
                  </span>
                </div>
              </div>
            ))}
            {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No hay pedidos recientes
              </p>
            )}
          </div>
        </div>

        {/* Recent Red de Ayuda */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Avisos Recientes - Red de Ayuda
          </h3>
          <div className="space-y-3">
            {stats?.recentRedDeAyuda?.slice(0, 5).map((aviso, index) => (
              <div key={aviso.id || index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {aviso.nombre || aviso.tipo_aviso || 'Aviso'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {aviso.tipo_aviso} {aviso.especie ? `- ${aviso.especie}` : ''}
                  </p>
                </div>
                <div className="text-right sm:text-left">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(aviso.created_at)}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    aviso.estado === 'activo'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : aviso.estado === 'resuelto'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {aviso.estado === 'activo' ? 'Activo' :
                     aviso.estado === 'resuelto' ? 'Resuelto' : aviso.estado}
                  </span>
                </div>
              </div>
            ))}
            {(!stats?.recentRedDeAyuda || stats.recentRedDeAyuda.length === 0) && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No hay avisos recientes
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          <button className="flex flex-col items-center p-3 sm:p-4 text-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-w-0">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mb-2 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">Gestión de Usuarios</span>
          </button>
          <button className="flex flex-col items-center p-3 sm:p-4 text-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-w-0">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500 mb-2 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">Mascotas</span>
          </button>
          <button className="flex flex-col items-center p-3 sm:p-4 text-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-w-0">
            <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 mb-2 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">Membresías</span>
          </button>
          <button className="flex flex-col items-center p-3 sm:p-4 text-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-w-0">
            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500 mb-2 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">Tienda</span>
          </button>
          <button className="flex flex-col items-center p-3 sm:p-4 text-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-w-0">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 mb-2 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">Eventos</span>
          </button>
          <button className="flex flex-col items-center p-3 sm:p-4 text-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-w-0">
            <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-500 mb-2 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">Red de Ayuda</span>
          </button>
        </div>
      </div>
    </div>
  );
}