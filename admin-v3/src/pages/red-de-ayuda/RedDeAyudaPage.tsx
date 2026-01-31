import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Search,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  MapPin,
  Calendar,
  User,
  Phone,
  Heart,
  Dog,
  Cat,
} from 'lucide-react';
import { redDeAyudaService } from '@/services/supabase';
import { formatDate, getStatusColor } from '@/utils/formatters';
import toast from 'react-hot-toast';

const tiposAviso = {
  perdido: { label: 'Perdido', icon: AlertTriangle, color: 'text-red-500' },
  encontrado: { label: 'Encontrado', icon: CheckCircle, color: 'text-green-500' },
  adopcion: { label: 'Adopción', icon: Heart, color: 'text-purple-500' },
};

const especiesIcons = {
  perro: Dog,
  gato: Cat,
  otro: User,
};

const estados = {
  activo: { label: 'Activo', color: 'bg-green-100 text-green-800' },
  resuelto: { label: 'Resuelto', color: 'bg-blue-100 text-blue-800' },
  expirado: { label: 'Expirado', color: 'bg-gray-100 text-gray-800' },
  eliminado: { label: 'Eliminado', color: 'bg-red-100 text-red-800' },
};

export function RedDeAyudaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAviso, setSelectedAviso] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);

  const queryClient = useQueryClient();

  // Queries
  const { data: avisos, isLoading, error } = useQuery({
    queryKey: ['avisos-red-ayuda'],
    queryFn: redDeAyudaService.getAll,
    retry: 3,
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) =>
      redDeAyudaService.updateStatus(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avisos-red-ayuda'] });
      setIsStatusDialogOpen(false);
      setSelectedAviso(null);
      toast.success('Estado del aviso actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar estado');
    },
  });

  const toggleDestacadoMutation = useMutation({
    mutationFn: ({ id, destacado }: { id: string; destacado: boolean }) =>
      redDeAyudaService.toggleDestacado(
        id,
        destacado,
        destacado ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avisos-red-ayuda'] });
      toast.success('Estado de destacado actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar destacado');
    },
  });

  const filteredAvisos = avisos?.filter(aviso => {
    const matchesSearch =
      aviso.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aviso.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aviso.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aviso.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aviso.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFeatured = !showOnlyFeatured || aviso.destacado;

    return matchesSearch && matchesFeatured;
  }) || [];

  // Estadísticas
  const totalAvisos = avisos?.length || 0;
  const avisosActivos = avisos?.filter(a => a.estado === 'activo').length || 0;
  const avisosDestacados = avisos?.filter(a => a.destacado).length || 0;
  const avisosResueltos = avisos?.filter(a => a.estado === 'resuelto').length || 0;

  const handleViewDetails = (aviso: any) => {
    setSelectedAviso(aviso);
    setIsDetailsDialogOpen(true);
  };

  const handleUpdateStatus = (aviso: any) => {
    setSelectedAviso(aviso);
    setNewStatus(aviso.estado);
    setIsStatusDialogOpen(true);
  };

  const handleStatusUpdate = () => {
    if (!selectedAviso || !newStatus) return;

    updateStatusMutation.mutate({
      id: selectedAviso.id,
      estado: newStatus,
    });
  };

  const handleToggleDestacado = (aviso: any) => {
    toggleDestacadoMutation.mutate({
      id: aviso.id,
      destacado: !aviso.destacado,
    });
  };

  const getEspecieIcon = (especie: string) => {
    const IconComponent = especiesIcons[especie as keyof typeof especiesIcons] || especiesIcons.otro;
    return IconComponent;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error cargando los avisos: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Red de Ayuda
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra los avisos de la red de ayuda comunitaria
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total de Avisos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totalAvisos}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avisos Activos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {avisosActivos}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Destacados
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {avisosDestacados}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Resueltos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {avisosResueltos}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar avisos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured-filter"
              checked={showOnlyFeatured}
              onChange={(e) => setShowOnlyFeatured(e.target.checked)}
              className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
            />
            <Label htmlFor="featured-filter" className="flex items-center space-x-1 text-sm font-medium">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>Solo destacados</span>
            </Label>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {showOnlyFeatured
            ? `${avisosDestacados} avisos destacados`
            : `Mostrando ${filteredAvisos.length} de ${totalAvisos} avisos`
          }
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Información</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAvisos.map((aviso) => {
                const TipoIcon = tiposAviso[aviso.tipo_aviso as keyof typeof tiposAviso]?.icon || AlertTriangle;
                const EspecieIcon = getEspecieIcon(aviso.especie);
                const tipoConfig = tiposAviso[aviso.tipo_aviso as keyof typeof tiposAviso];
                const estadoConfig = estados[aviso.estado as keyof typeof estados];

                return (
                  <TableRow key={aviso.id} className={aviso.destacado ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-l-yellow-400' : ''}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {aviso.destacado && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded-full">
                              DESTACADO
                            </span>
                          </div>
                        )}
                        <div className={`p-2 rounded-lg ${tipoConfig ? tipoConfig.color : 'text-gray-500'}`}>
                          <TipoIcon className="w-4 h-4" />
                        </div>
                        <div className="flex items-center space-x-1">
                          <EspecieIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">
                            {tipoConfig?.label || aviso.tipo_aviso}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {aviso.nombre}
                          </p>
                          {aviso.destacado && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        {aviso.descripcion && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                            {aviso.descripcion}
                          </p>
                        )}
                        {aviso.sexo && (
                          <p className="text-xs text-gray-400">
                            Sexo: {aviso.sexo}
                          </p>
                        )}
                        {aviso.destacado && aviso.destacado_hasta && (
                          <p className="text-xs text-yellow-600 dark:text-yellow-400">
                            Destacado hasta: {formatDate(aviso.destacado_hasta)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-sm">{aviso.ubicacion}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {aviso.profiles?.full_name}
                          </p>
                          {aviso.profiles?.full_name?.includes('Usuario #') && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              ID: {aviso.profiles?.full_name?.split('#')[1]}
                            </span>
                          )}
                          {aviso.profiles?.full_name?.includes('Usuario desconocido') && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                              Contacto
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {aviso.profiles?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-sm">{formatDate(aviso.fecha || aviso.created_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            estadoConfig?.color || 'bg-gray-100 text-gray-800'
                          }`}>
                            {estadoConfig?.label || aviso.estado}
                          </span>
                        </div>
                        {aviso.destacado && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                              Destacado
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(aviso)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(aviso)}
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Cambiar estado
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleDestacado(aviso)}
                          >
                            <Star className="mr-2 h-4 w-4" />
                            {aviso.destacado ? 'Quitar destacado' : 'Destacar'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Aviso</DialogTitle>
            <DialogDescription>
              Información completa del aviso de la red de ayuda
            </DialogDescription>
          </DialogHeader>

          {selectedAviso && (
            <div className="space-y-6">
              {/* Aviso Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${
                      tiposAviso[selectedAviso.tipo_aviso as keyof typeof tiposAviso]?.color || 'text-gray-500'
                    }`}>
                      {React.createElement(
                        tiposAviso[selectedAviso.tipo_aviso as keyof typeof tiposAviso]?.icon || AlertTriangle,
                        { className: "w-6 h-6" }
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">{selectedAviso.nombre}</h3>
                        {selectedAviso.destacado && (
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{React.createElement(getEspecieIcon(selectedAviso.especie), { className: "w-4 h-4" })}</span>
                        <span>{selectedAviso.especie}</span>
                        {selectedAviso.sexo && <span>• {selectedAviso.sexo}</span>}
                      </div>
                    </div>
                  </div>
                  {selectedAviso.destacado && (
                    <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/50 px-3 py-2 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400 fill-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        AVISO DESTACADO
                      </span>
                    </div>
                  )}
                </div>

                {selectedAviso.descripcion && (
                  <div>
                    <h4 className="font-medium mb-2">Descripción</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedAviso.descripcion}
                    </p>
                  </div>
                )}

                {selectedAviso.contacto && (
                  <div>
                    <h4 className="font-medium mb-2">Contacto</h4>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedAviso.contacto}</span>
                    </div>
                  </div>
                )}

                {selectedAviso.ubicacion && (
                  <div>
                    <h4 className="font-medium mb-2">Ubicación</h4>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{selectedAviso.ubicacion}</span>
                    </div>
                  </div>
                )}

                {selectedAviso.imagen_url && (
                  <div>
                    <h4 className="font-medium mb-2">Imagen</h4>
                    <img
                      src={selectedAviso.imagen_url}
                      alt={selectedAviso.nombre}
                      className="w-full max-w-md rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Información del Usuario</h3>
                <div className="space-y-3">
                  {selectedAviso.profiles?.full_name === 'Usuario no encontrado' ? (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-orange-800 dark:text-orange-200">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Usuario no encontrado</span>
                      </div>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        El usuario que creó este aviso ya no existe en el sistema. Los datos del usuario no están disponibles.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{selectedAviso.profiles?.full_name || 'No disponible'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>{selectedAviso.profiles?.email || 'No disponible'}</span>
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    <p>ID de usuario: {selectedAviso.user_id}</p>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Estado del Aviso</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      estados[selectedAviso.estado as keyof typeof estados]?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      {estados[selectedAviso.estado as keyof typeof estados]?.label || selectedAviso.estado}
                    </span>
                  </div>

                  {selectedAviso.destacado && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400 fill-yellow-600" />
                          <span className="font-medium text-yellow-800 dark:text-yellow-200">
                            Aviso Destacado
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        {selectedAviso.destacado_hasta && (
                          <p>
                            <span className="font-medium">Vigencia hasta:</span> {formatDate(selectedAviso.destacado_hasta)}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Beneficios:</span> Mayor visibilidad en la aplicación, aparición en resultados destacados y prioridad en búsquedas
                        </p>
                        {selectedAviso.payment_status && (
                          <p>
                            <span className="font-medium">Estado del pago:</span> {selectedAviso.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Estado del Aviso</DialogTitle>
            <DialogDescription>
              Cambia el estado del aviso "{selectedAviso?.nombre}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Estado Actual</Label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                selectedAviso && estados[selectedAviso.estado as keyof typeof estados]?.color
              }`}>
                {selectedAviso && estados[selectedAviso.estado as keyof typeof estados]?.label}
              </span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-status">Nuevo Estado</Label>
              <select
                id="new-status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {Object.entries(estados).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleStatusUpdate} disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending ? 'Actualizando...' : 'Actualizar Estado'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}