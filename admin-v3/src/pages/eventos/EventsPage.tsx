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
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  MoreHorizontal,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Tag,
} from 'lucide-react';
import { eventsService } from '@/services/supabase';
import { formatDate, formatDateTime, getStatusColor } from '@/utils/formatters';
import toast from 'react-hot-toast';

const eventCategories = [
  { value: 'adopcion', label: 'Adopción' },
  { value: 'taller', label: 'Taller' },
  { value: 'feria', label: 'Feria' },
  { value: 'social', label: 'Evento Social' },
  { value: 'medico', label: 'Médico/Veterinario' },
  { value: 'entrenamiento', label: 'Entrenamiento' },
  { value: 'otro', label: 'Otro' },
];

const eventStatuses = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos', color: 'green' },
  { value: 'inactive', label: 'Inactivos', color: 'gray' },
];

export function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'otro',
    event_date: '',
    start_time: '',
    end_time: '',
    location: '',
    max_participants: '',
    is_active: true,
    image_url: '',
    is_featured: false,
  });

  const queryClient = useQueryClient();

  // Queries
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: eventsService.getAll,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: eventsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Evento creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear evento');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => eventsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
      resetForm();
      toast.success('Evento actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar evento');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: eventsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsDetailDialogOpen(false);
      setSelectedEvent(null);
      toast.success('Evento eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar evento');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'otro',
      event_date: '',
      start_time: '',
      end_time: '',
      location: '',
      max_participants: '',
      is_active: true,
      image_url: '',
      is_featured: false,
    });
  };

  const handleViewEvent = (event: any) => {
    setSelectedEvent(event);
    setIsDetailDialogOpen(true);
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      event_type: event.event_type || 'otro',
      event_date: event.event_date ? event.event_date.split('T')[0] : '',
      start_time: event.start_time || '',
      end_time: event.end_time || '',
      location: event.location || '',
      max_participants: event.max_participants?.toString() || '',
      is_active: event.is_active !== false,
      image_url: event.image_url || '',
      is_featured: event.is_featured || false,
    });
    setIsEditDialogOpen(true);
    setIsDetailDialogOpen(false);
  };

  const handleCreateEvent = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleCreateSubmit = () => {
    if (!formData.title || !formData.event_date || !formData.location) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const eventData = {
      ...formData,
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
    };

    createMutation.mutate(eventData);
  };

  const handleEditSubmit = () => {
    if (!selectedEvent || !formData.title || !formData.event_date || !formData.location) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const eventData = {
      ...formData,
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
    };

    updateMutation.mutate({
      id: selectedEvent.id,
      ...eventData,
    });
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;

    if (confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate(selectedEvent.id);
    }
  };

  const filteredEvents = events?.filter(event => {
    const matchesSearch =
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && event.is_active !== false) ||
      (statusFilter === 'inactive' && event.is_active === false);
    const matchesCategory = categoryFilter === 'all' || event.event_type === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  // Estadísticas
  const stats = {
    total: events?.length || 0,
    active: events?.filter(e => e.is_active !== false).length || 0,
    inactive: events?.filter(e => e.is_active === false).length || 0,
    featured: events?.filter(e => e.is_featured === true).length || 0,
    upcoming: events?.filter(e => new Date(e.event_date) > new Date()).length || 0,
    past: events?.filter(e => new Date(e.event_date) <= new Date()).length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Gestión de Eventos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra los eventos de la comunidad
          </p>
        </div>
        <Button onClick={handleCreateEvent} className="mt-4 sm:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="admin-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          </div>
        </div>
        <div className="admin-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Activos</p>
          </div>
        </div>
        <div className="admin-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Inactivos</p>
          </div>
        </div>
        <div className="admin-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.featured}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Destacados</p>
          </div>
        </div>
        <div className="admin-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Próximos</p>
          </div>
        </div>
        <div className="admin-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.past}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pasados</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {eventStatuses.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {eventCategories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Events Table */}
      <div className="admin-card">
        <div className="rounded-md border overflow-x-auto">
          <div className="min-w-[900px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">Evento</TableHead>
                  <TableHead className="min-w-[120px] hidden sm:table-cell">Categoría</TableHead>
                  <TableHead className="min-w-[150px]">Fecha y Hora</TableHead>
                  <TableHead className="min-w-[150px] hidden md:table-cell">Ubicación</TableHead>
                  <TableHead className="min-w-[100px]">Estado</TableHead>
                  <TableHead className="min-w-[100px] hidden lg:table-cell">Participantes</TableHead>
                  <TableHead className="text-right min-w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        {event.image_url && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={event.image_url}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{event.title}</p>
                          {event.is_featured && (
                            <span className="text-xs text-yellow-600 whitespace-nowrap">⭐ Destacado</span>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate sm:hidden">
                            {eventCategories.find(c => c.value === event.event_type)?.label || event.event_type}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 whitespace-nowrap">
                        <Tag className="w-3 h-3 mr-1" />
                        {eventCategories.find(c => c.value === event.event_type)?.label || event.event_type}
                      </span>
                    </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm">{formatDate(event.event_date)}</p>
                        <p className="text-xs text-gray-500">{event.start_time}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm truncate max-w-32">
                        {event.location}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      event.is_active !== false
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {event.is_active !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {event.current_participants || 0}
                        {event.max_participants && `/${event.max_participants}`}
                      </span>
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
                        <DropdownMenuItem onClick={() => handleViewEvent(event)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteEvent()} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No se encontraron eventos que coincidan con los filtros'
                : 'No hay eventos registrados'}
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Evento</DialogTitle>
            <DialogDescription>
              Información completa del evento
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              {/* Event Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Información del Evento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Título</p>
                    <p className="font-medium">{selectedEvent.titulo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Categoría</p>
                    <p className="font-medium">
                      {eventCategories.find(c => c.value === selectedEvent.categoria)?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha y Hora</p>
                    <p className="font-medium">
                      {formatDateTime(selectedEvent.fecha_evento + ' ' + selectedEvent.hora_evento)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ubicación</p>
                    <p className="font-medium">{selectedEvent.ubicacion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEvent.estado)}`}>
                      {eventStatuses.find(s => s.value === selectedEvent.estado)?.label}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Participantes</p>
                    <p className="font-medium">
                      {selectedEvent.inscripciones_count || 0}
                      {selectedEvent.capacidad_maxima && ` de ${selectedEvent.capacidad_maxima}`}
                    </p>
                  </div>
                  {selectedEvent.costo && selectedEvent.costo > 0 && (
                    <div>
                      <p className="text-sm text-gray-500">Costo</p>
                      <p className="font-medium">${selectedEvent.costo}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedEvent.descripcion && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Descripción</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedEvent.descripcion}
                  </p>
                </div>
              )}

              {/* Requirements */}
              {selectedEvent.requisitos && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Requisitos</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedEvent.requisitos}
                  </p>
                </div>
              )}

              {/* Contact Info */}
              {selectedEvent.info_contacto && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Información de Contacto</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedEvent.info_contacto}
                  </p>
                </div>
              )}

              {/* Image */}
              {selectedEvent.imagen_url && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Imagen del Evento</h3>
                  <img
                    src={selectedEvent.imagen_url}
                    alt={selectedEvent.titulo}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={() => handleEditEvent(selectedEvent)}>
              Editar Evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Evento</DialogTitle>
            <DialogDescription>
              Completa la información para crear un nuevo evento
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2">
              <Label htmlFor="titulo">Título del Evento *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej: Feria de Adopción de Mascotas"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe el evento en detalle..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="categoria">Categoría</Label>
              <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventStatuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fecha_evento">Fecha del Evento *</Label>
              <Input
                id="fecha_evento"
                type="date"
                value={formData.fecha_evento}
                onChange={(e) => setFormData({ ...formData, fecha_evento: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="hora_evento">Hora del Evento</Label>
              <Input
                id="hora_evento"
                type="time"
                value={formData.hora_evento}
                onChange={(e) => setFormData({ ...formData, hora_evento: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="ubicacion">Ubicación *</Label>
              <Input
                id="ubicacion"
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                placeholder="Ej: Parque Central, Ciudad"
              />
            </div>
            <div>
              <Label htmlFor="capacidad_maxima">Capacidad Máxima</Label>
              <Input
                id="capacidad_maxima"
                type="number"
                value={formData.capacidad_maxima}
                onChange={(e) => setFormData({ ...formData, capacidad_maxima: e.target.value })}
                placeholder="Opcional"
              />
            </div>
            <div>
              <Label htmlFor="costo">Costo</Label>
              <Input
                id="costo"
                type="number"
                step="0.01"
                value={formData.costo}
                onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="requisitos">Requisitos</Label>
              <Textarea
                id="requisitos"
                value={formData.requisitos}
                onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
                placeholder="Requisitos para participar..."
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="info_contacto">Información de Contacto</Label>
              <Textarea
                id="info_contacto"
                value={formData.info_contacto}
                onChange={(e) => setFormData({ ...formData, info_contacto: e.target.value })}
                placeholder="Teléfono, email, etc..."
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="imagen_url">URL de Imagen</Label>
              <Input
                id="imagen_url"
                value={formData.imagen_url}
                onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creando...' : 'Crear Evento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
            <DialogDescription>
              Modifica la información del evento
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2">
              <Label htmlFor="edit_titulo">Título del Evento *</Label>
              <Input
                id="edit_titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej: Feria de Adopción de Mascotas"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="edit_descripcion">Descripción</Label>
              <Textarea
                id="edit_descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe el evento en detalle..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit_categoria">Categoría</Label>
              <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventStatuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_fecha_evento">Fecha del Evento *</Label>
              <Input
                id="edit_fecha_evento"
                type="date"
                value={formData.fecha_evento}
                onChange={(e) => setFormData({ ...formData, fecha_evento: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_hora_evento">Hora del Evento</Label>
              <Input
                id="edit_hora_evento"
                type="time"
                value={formData.hora_evento}
                onChange={(e) => setFormData({ ...formData, hora_evento: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="edit_ubicacion">Ubicación *</Label>
              <Input
                id="edit_ubicacion"
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                placeholder="Ej: Parque Central, Ciudad"
              />
            </div>
            <div>
              <Label htmlFor="edit_capacidad_maxima">Capacidad Máxima</Label>
              <Input
                id="edit_capacidad_maxima"
                type="number"
                value={formData.capacidad_maxima}
                onChange={(e) => setFormData({ ...formData, capacidad_maxima: e.target.value })}
                placeholder="Opcional"
              />
            </div>
            <div>
              <Label htmlFor="edit_costo">Costo</Label>
              <Input
                id="edit_costo"
                type="number"
                step="0.01"
                value={formData.costo}
                onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="edit_requisitos">Requisitos</Label>
              <Textarea
                id="edit_requisitos"
                value={formData.requisitos}
                onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
                placeholder="Requisitos para participar..."
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="edit_info_contacto">Información de Contacto</Label>
              <Textarea
                id="edit_info_contacto"
                value={formData.info_contacto}
                onChange={(e) => setFormData({ ...formData, info_contacto: e.target.value })}
                placeholder="Teléfono, email, etc..."
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="edit_imagen_url">URL de Imagen</Label>
              <Input
                id="edit_imagen_url"
                value={formData.imagen_url}
                onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubmit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Evento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
  );
}