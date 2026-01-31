import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Dog,
  ShoppingBag,
  DollarSign,
  Calendar,
  MapPin,
  Heart,
  Star,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Clock,
  UserPlus,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';
import { analyticsService, dashboardService } from '@/services/supabase';
import { formatDate, formatDateTime } from '@/utils/formatters';

interface AnalyticsData {
  period: {
    newUsers: number;
    newPets: number;
    newOrders: number;
    newMemberships: number;
    newEvents: number;
    newPlaces: number;
    newRedDeAyuda: number;
    newRefugios: number;
    revenue: number;
  };
  categories: {
    places: Record<string, number>;
    events: Record<string, number>;
    redDeAyuda: Record<string, number>;
    pets: Record<string, number>;
  };
  memberships: Record<string, { total: number; active: number }>;
  adoptions: {
    totalAdoptions: number;
    totalCapacity: number;
    totalCurrentAnimals: number;
    averageOccupancy: number;
    totalRefugios: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    icon: string;
  }>;
}

interface GrowthMetrics {
  users: { current: number; previous: number; growth: number };
  pets: { current: number; previous: number; growth: number };
  orders: { current: number; previous: number; growth: number };
  revenue: { current: number; previous: number; growth: number };
}

const periodOptions = [
  { value: 'week', label: 'Última Semana' },
  { value: 'month', label: 'Último Mes' },
  { value: 'quarter', label: 'Último Trimestre' },
  { value: 'year', label: 'Último Año' },
];

const placeCategoryLabels: Record<string, string> = {
  veterinaria: 'Veterinarias',
  tienda: 'Tiendas',
  guarderia: 'Guarderías',
  spa: 'Spa/Estética',
  entrenamiento: 'Entrenamiento',
  refugio: 'Refugios',
  cafeteria: 'Cafeterías',
  hotel: 'Hoteles',
  casa_cuna: 'Casas Cuna',
  otro: 'Otros'
};

const eventTypeLabels: Record<string, string> = {
  adoption: 'Adopciones',
  training: 'Entrenamiento',
  health: 'Salud',
  social: 'Social',
  competition: 'Competencias',
  otro: 'Otros'
};

const avisoTypeLabels: Record<string, string> = {
  perdido: 'Perdidos',
  encontrado: 'Encontrados',
  adopcion: 'Adopción',
  otro: 'Otros'
};

const petTypeLabels: Record<string, string> = {
  perro: 'Perros',
  gato: 'Gatos',
  ave: 'Aves',
  roedor: 'Roedores',
  exotico: 'Exóticos',
  otro: 'Otros'
};

const AnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics | null>(null);
  const [overallStats, setOverallStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analytics, growth, overall] = await Promise.all([
        analyticsService.getDetailedStats(selectedPeriod),
        analyticsService.getGrowthMetrics(selectedPeriod),
        dashboardService.getStats()
      ]);

      setAnalyticsData(analytics);
      setGrowthMetrics(growth);
      setOverallStats(overall);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Error al cargar las analíticas');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case 'user': return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'order': return <ShoppingBag className="w-4 h-4 text-green-500" />;
      case 'aviso': return <Heart className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderMetricCard = (
    title: string,
    value: string | number,
    growth?: number,
    previousValue?: string | number,
    icon?: React.ReactNode,
    description?: string
  ) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {growth !== undefined && (
          <div className="flex items-center gap-1 text-xs">
            {getGrowthIcon(growth)}
            <span className={getGrowthColor(growth)}>
              {growth > 0 ? '+' : ''}{growth}% vs período anterior
            </span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  const renderCategoryChart = (
    title: string,
    data: Record<string, number>,
    labels: Record<string, string>,
    icon: React.ReactNode,
    color: string
  ) => {
    const total = Object.values(data).reduce((sum, count) => sum + count, 0);
    const sortedEntries = Object.entries(data).sort(([, a], [, b]) => b - a);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <CardDescription>
            Distribución por categorías ({total} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedEntries.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
          ) : (
            <div className="space-y-3">
              {sortedEntries.slice(0, 5).map(([key, count]) => {
                const percentage = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {labels[key] || key}
                        </span>
                        <span className="text-sm text-gray-600">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {sortedEntries.length > 5 && (
                <p className="text-xs text-gray-500 text-center">
                  y {sortedEntries.length - 5} categorías más...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analíticas</h1>
          <p className="text-gray-600 mt-2">Visualiza métricas y reportes avanzados</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Growth Metrics */}
      {growthMetrics && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Métricas de Crecimiento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderMetricCard(
              "Nuevos Usuarios",
              growthMetrics.users.current,
              growthMetrics.users.growth,
              growthMetrics.users.previous,
              <Users className="w-4 h-4 text-blue-500" />
            )}
            {renderMetricCard(
              "Nuevas Mascotas",
              growthMetrics.pets.current,
              growthMetrics.pets.growth,
              growthMetrics.pets.previous,
              <Dog className="w-4 h-4 text-purple-500" />
            )}
            {renderMetricCard(
              "Nuevos Pedidos",
              growthMetrics.orders.current,
              growthMetrics.orders.growth,
              growthMetrics.orders.previous,
              <ShoppingBag className="w-4 h-4 text-green-500" />
            )}
            {renderMetricCard(
              "Ingresos",
              formatCurrency(growthMetrics.revenue.current),
              growthMetrics.revenue.growth,
              formatCurrency(growthMetrics.revenue.previous),
              <DollarSign className="w-4 h-4 text-yellow-500" />
            )}
          </div>
        </div>
      )}

      {/* Period Stats */}
      {analyticsData && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Estadísticas del Período
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderMetricCard(
              "Usuarios Registrados",
              analyticsData.period.newUsers,
              undefined,
              undefined,
              <UserPlus className="w-4 h-4 text-blue-500" />,
              "Nuevos registros en el período"
            )}
            {renderMetricCard(
              "Mascotas Registradas",
              analyticsData.period.newPets,
              undefined,
              undefined,
              <Dog className="w-4 h-4 text-purple-500" />,
              "Nuevas mascotas en el período"
            )}
            {renderMetricCard(
              "Pedidos",
              analyticsData.period.newOrders,
              undefined,
              undefined,
              <ShoppingBag className="w-4 h-4 text-green-500" />,
              "Pedidos realizados"
            )}
            {renderMetricCard(
              "Ingresos",
              formatCurrency(analyticsData.period.revenue),
              undefined,
              undefined,
              <DollarSign className="w-4 h-4 text-yellow-500" />,
              "Ingresos generados"
            )}
            {renderMetricCard(
              "Membresías",
              analyticsData.period.newMemberships,
              undefined,
              undefined,
              <Star className="w-4 h-4 text-indigo-500" />,
              "Nuevas membresías activadas"
            )}
            {renderMetricCard(
              "Eventos",
              analyticsData.period.newEvents,
              undefined,
              undefined,
              <Calendar className="w-4 h-4 text-orange-500" />,
              "Eventos creados"
            )}
            {renderMetricCard(
              "Lugares",
              analyticsData.period.newPlaces,
              undefined,
              undefined,
              <MapPin className="w-4 h-4 text-red-500" />,
              "Nuevos lugares registrados"
            )}
            {renderMetricCard(
              "Avisos Red de Ayuda",
              analyticsData.period.newRedDeAyuda,
              undefined,
              undefined,
              <Heart className="w-4 h-4 text-pink-500" />,
              "Nuevos avisos publicados"
            )}
          </div>
        </div>
      )}

      {/* Category Charts */}
      {analyticsData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderCategoryChart(
            "Lugares por Categoría",
            analyticsData.categories.places,
            placeCategoryLabels,
            <MapPin className="w-4 h-4" />,
            "bg-blue-500"
          )}
          {renderCategoryChart(
            "Eventos por Tipo",
            analyticsData.categories.events,
            eventTypeLabels,
            <Calendar className="w-4 h-4" />,
            "bg-green-500"
          )}
          {renderCategoryChart(
            "Avisos por Tipo",
            analyticsData.categories.redDeAyuda,
            avisoTypeLabels,
            <Heart className="w-4 h-4" />,
            "bg-red-500"
          )}
          {renderCategoryChart(
            "Mascotas por Tipo",
            analyticsData.categories.pets,
            petTypeLabels,
            <Dog className="w-4 h-4" />,
            "bg-purple-500"
          )}
        </div>
      )}

      {/* Adoptions Stats */}
      {analyticsData && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Estadísticas de Adopciones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderMetricCard(
              "Total Adopciones",
              analyticsData.adoptions.totalAdoptions,
              undefined,
              undefined,
              <CheckCircle className="w-4 h-4 text-green-500" />,
              "Animales adoptados"
            )}
            {renderMetricCard(
              "Capacidad Total",
              analyticsData.adoptions.totalCapacity,
              undefined,
              undefined,
              <Users className="w-4 h-4 text-blue-500" />,
              "Capacidad de todos los refugios"
            )}
            {renderMetricCard(
              "Animales Actuales",
              analyticsData.adoptions.totalCurrentAnimals,
              undefined,
              undefined,
              <Dog className="w-4 h-4 text-purple-500" />,
              "Animales en refugios actualmente"
            )}
            {renderMetricCard(
              "Ocupación Promedio",
              `${analyticsData.adoptions.averageOccupancy}%`,
              undefined,
              undefined,
              <BarChart3 className="w-4 h-4 text-orange-500" />,
              "Porcentaje de ocupación"
            )}
          </div>
        </div>
      )}

      {/* Overall Stats */}
      {overallStats && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Estadísticas Generales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderMetricCard(
              "Total Usuarios",
              overallStats.totalUsers,
              undefined,
              undefined,
              <Users className="w-4 h-4 text-blue-500" />
            )}
            {renderMetricCard(
              "Total Mascotas",
              overallStats.totalPets,
              undefined,
              undefined,
              <Dog className="w-4 h-4 text-purple-500" />
            )}
            {renderMetricCard(
              "Total Pedidos",
              overallStats.totalOrders,
              undefined,
              undefined,
              <ShoppingBag className="w-4 h-4 text-green-500" />
            )}
            {renderMetricCard(
              "Ingresos Totales",
              formatCurrency(overallStats.totalRevenue),
              undefined,
              undefined,
              <DollarSign className="w-4 h-4 text-yellow-500" />
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {analyticsData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Últimas actividades en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
            ) : (
              <div className="space-y-3">
                {analyticsData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsPage;