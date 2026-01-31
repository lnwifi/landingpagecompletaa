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
import { Switch } from '@/components/ui/switch';
import {
  MoreHorizontal,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Star,
  Globe,
  Clock,
  QrCode,
  ToggleLeft,
  ToggleRight,
  Crown,
  UserX,
} from 'lucide-react';
import { placesService } from '@/services/supabase';
import { formatDate, formatDateTime } from '@/utils/formatters';
import toast from 'react-hot-toast';

const placeCategories = [
  { value: 'veterinaria', label: 'Veterinaria' },
  { value: 'tienda', label: 'Tienda' },
  { value: 'guarderia', label: 'Guardería' },
  { value: 'spa', label: 'Spa/Estética' },
  { value: 'entrenamiento', label: 'Entrenamiento' },
  { value: 'refugio', label: 'Refugio' },
  { value: 'cafeteria', label: 'Cafetería' },
  { value: 'hotel', label: 'Hotel para mascotas' },
  { value: 'casa_cuna', label: 'Casa de cuna' },
  { value: 'otro', label: 'Otro' },
];

const placeTypes = [
  { value: 'negocio', label: 'Negocio' },
  { value: 'refugio', label: 'Refugio' },
  { value: 'particular', label: 'Particular' },
];

export function PlacesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [isFeaturedDialogOpen, setIsFeaturedDialogOpen] = useState(false);
  const [featuredDate, setFeaturedDate] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    lat: '',
    lng: '',
    category: 'veterinaria',
    type: 'negocio',
    photo_url: '',
    phone: '',
    whatsapp: '',
    rating: 0,
    featured: false,
    featured_until: '',
    suspended: false,
    dashboard_access: false,
    hours: {
      monday: { open: '', close: '' },
      tuesday: { open: '', close: '' },
      wednesday: { open: '', close: '' },
      thursday: { open: '', close: '' },
      friday: { open: '', close: '' },
      saturday: { open: '', close: '' },
      sunday: { open: '', close: '' },
    },
  });

  const queryClient = useQueryClient();

  // Queries
  const { data: places, isLoading } = useQuery({
    queryKey: ['places'],
    queryFn: placesService.getAll,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: placesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      setIsCreateDialogOpen(false);
      resetForm();
      setPreviewImage('');
      toast.success('Lugar creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear lugar');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => placesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      setIsEditDialogOpen(false);
      setSelectedPlace(null);
      resetForm();
      setPreviewImage('');
      toast.success('Lugar actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar lugar');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: placesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      setIsDetailDialogOpen(false);
      setSelectedPlace(null);
      toast.success('Lugar eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar lugar');
    },
  });

  const toggleSuspendedMutation = useMutation({
    mutationFn: ({ id, suspended }: { id: string; suspended: boolean }) =>
      placesService.update(id, { suspended }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast.success('Estado del lugar actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar estado');
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, featured, featured_until }: { id: string; featured: boolean; featured_until?: string }) =>
      placesService.update(id, { featured, featured_until }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast.success('Estado destacado actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar estado destacado');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      latitude: '',
      longitude: '',
      lat: '',
      lng: '',
      category: 'veterinaria',
      type: 'negocio',
      photo_url: '',
      phone: '',
      whatsapp: '',
      rating: 0,
      featured: false,
      featured_until: '',
      suspended: false,
      dashboard_access: false,
      hours: {
        monday: { open: '', close: '' },
        tuesday: { open: '', close: '' },
        wednesday: { open: '', close: '' },
        thursday: { open: '', close: '' },
        friday: { open: '', close: '' },
        saturday: { open: '', close: '' },
        sunday: { open: '', close: '' },
      },
    });
  };

  const handleViewPlace = (place: any) => {
    setSelectedPlace(place);
    setIsDetailDialogOpen(true);
  };

  const handleEditPlace = (place: any) => {
    setSelectedPlace(place);
    setFormData({
      name: place.name || '',
      description: place.description || '',
      address: place.address || '',
      latitude: place.latitude?.toString() || '',
      longitude: place.longitude?.toString() || '',
      lat: place.lat?.toString() || '',
      lng: place.lng?.toString() || '',
      category: place.category || 'veterinaria',
      type: place.type || 'negocio',
      photo_url: place.photo_url || '',
      phone: place.phone || '',
      whatsapp: place.whatsapp || '',
      rating: place.rating || 0,
      featured: place.featured || false,
      featured_until: place.featured_until ? place.featured_until.split('T')[0] : '',
      suspended: place.suspended || false,
      dashboard_access: place.dashboard_access || false,
      hours: place.hours || {
        monday: { open: '', close: '' },
        tuesday: { open: '', close: '' },
        wednesday: { open: '', close: '' },
        thursday: { open: '', close: '' },
        friday: { open: '', close: '' },
        saturday: { open: '', close: '' },
        sunday: { open: '', close: '' },
      },
    });
    setPreviewImage(place.photo_url || '');
    setIsEditDialogOpen(true);
    setIsDetailDialogOpen(false);
  };

  const handleCreatePlace = () => {
    resetForm();
    setPreviewImage('');
    setIsCreateDialogOpen(true);
  };

  const handleCreateSubmit = () => {
    if (!formData.name || !formData.address || !formData.category) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const placeData = {
      ...formData,
      lat: formData.latitude || formData.lat ? parseFloat(formData.latitude || formData.lat) : null,
      lng: formData.longitude || formData.lng ? parseFloat(formData.longitude || formData.lng) : null,
      rating: formData.rating || 0,
      featured_until: formData.featured_until ? new Date(formData.featured_until).toISOString() : null,
    };

    // Clean up form fields
    delete placeData.latitude;
    delete placeData.longitude;

    createMutation.mutate(placeData);
  };

  const handleEditSubmit = () => {
    if (!selectedPlace || !formData.name || !formData.address || !formData.category) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const placeData = {
      ...formData,
      lat: formData.latitude || formData.lat ? parseFloat(formData.latitude || formData.lat) : selectedPlace.lat,
      lng: formData.longitude || formData.lng ? parseFloat(formData.longitude || formData.lng) : selectedPlace.lng,
      rating: formData.rating || 0,
      featured_until: formData.featured_until ? new Date(formData.featured_until).toISOString() : selectedPlace.featured_until,
    };

    // Clean up form fields
    delete placeData.latitude;
    delete placeData.longitude;

    updateMutation.mutate({
      id: selectedPlace.id,
      ...placeData,
    });
  };

  const handleDeletePlace = () => {
    if (!selectedPlace) return;

    if (confirm('¿Estás seguro de que quieres eliminar este lugar? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate(selectedPlace.id);
    }
  };

  const handleToggleSuspended = (place: any) => {
    toggleSuspendedMutation.mutate({
      id: place.id,
      suspended: !place.suspended,
    });
  };

  const handleToggleFeatured = (place: any) => {
    if (place.featured) {
      // Si ya está destacado, abrir diálogo para gestionar la fecha
      setSelectedPlace(place);
      setFeaturedDate(place.featured_until ? place.featured_until.split('T')[0] : '');
      setIsFeaturedDialogOpen(true);
    } else {
      // Si no está destacado, activarlo con fecha por defecto
      const featuredUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      toggleFeaturedMutation.mutate({
        id: place.id,
        featured: true,
        featured_until: featuredUntil,
      });
    }
  };

  const handleFeaturedSubmit = () => {
    if (!selectedPlace) return;

    toggleFeaturedMutation.mutate({
      id: selectedPlace.id,
      featured: true,
      featured_until: featuredDate ? new Date(featuredDate).toISOString() : null,
    });

    setIsFeaturedDialogOpen(false);
    setSelectedPlace(null);
    setFeaturedDate('');
  };

  const handleRemoveFeatured = () => {
    if (!selectedPlace) return;

    toggleFeaturedMutation.mutate({
      id: selectedPlace.id,
      featured: false,
      featured_until: null,
    });

    setIsFeaturedDialogOpen(false);
    setSelectedPlace(null);
    setFeaturedDate('');
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, photo_url: url });
    setPreviewImage(url);
  };

  const handleHoursChange = (day: string, field: 'open' | 'close', value: string) => {
    setFormData({
      ...formData,
      hours: {
        ...formData.hours,
        [day]: {
          ...formData.hours[day as keyof typeof formData.hours],
          [field]: value,
        },
      },
    });
  };

  const filteredPlaces = places?.filter(place => {
    const matchesSearch =
      place.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || place.category === categoryFilter;
    const matchesType = typeFilter === 'all' || place.type === typeFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && !place.suspended) ||
      (statusFilter === 'suspended' && place.suspended);

    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  }) || [];

  // Estadísticas
  const stats = {
    total: places?.length || 0,
    active: places?.filter(p => !p.suspended).length || 0,
    suspended: places?.filter(p => p.suspended).length || 0,
    featured: places?.filter(p => p.featured === true).length || 0,
    veterinaria: places?.filter(p => p.category === 'veterinaria').length || 0,
    tienda: places?.filter(p => p.category === 'tienda').length || 0,
  };

  // Check if featured is expired
  const isFeaturedExpired = (place: any) => {
    return place.featured_until && new Date(place.featured_until) < new Date();
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
            Gestión de Lugares
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra los lugares y negocios aliados
          </p>
        </div>
        <Button onClick={handleCreatePlace} className="mt-4 sm:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Lugar
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
            <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Suspendidos</p>
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
            <p className="text-2xl font-bold text-blue-600">{stats.veterinaria}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Veterinarias</p>
          </div>
        </div>
        <div className="admin-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.tienda}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tiendas</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar lugares..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {placeCategories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {placeTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="suspended">Suspendidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Places Table */}
      <div className="admin-card">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lugar</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlaces.map((place) => (
                <TableRow key={place.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      {place.photo_url && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={place.photo_url}
                            alt={place.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{place.name}</p>
                        {place.type && (
                          <p className="text-sm text-gray-500">
                            {placeTypes.find(t => t.value === place.type)?.label}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                      {placeCategories.find(c => c.value === place.category)?.label || place.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {place.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{place.phone}</span>
                        </div>
                      )}
                      {place.whatsapp && (
                        <div className="flex items-center space-x-1">
                          <Globe className="w-3 h-3 text-green-500" />
                          <span className="text-sm text-green-600">{place.whatsapp}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm truncate max-w-32">
                        {place.address}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {place.featured && !isFeaturedExpired(place) && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                      <button
                        onClick={() => handleToggleSuspended(place)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {place.suspended ? (
                          <ToggleLeft className="w-5 h-5 text-red-500" />
                        ) : (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        )}
                      </button>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        place.suspended
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {place.suspended ? 'Suspendido' : 'Activo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">
                        {place.rating?.toFixed(1) || 'N/A'}
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
                        <DropdownMenuItem onClick={() => handleViewPlace(place)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditPlace(place)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleFeatured(place)}>
                          {place.featured ? (
                            <>
                              <Crown className="mr-2 h-4 w-4 text-yellow-500" />
                              Gestionar Destacado
                            </>
                          ) : (
                            <>
                              <Crown className="mr-2 h-4 w-4" />
                              Hacer Destacado
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeletePlace()} className="text-red-600">
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
          {filteredPlaces.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'No se encontraron lugares que coincidan con los filtros'
                : 'No hay lugares registrados'}
            </div>
          )}
        </div>
      </div>

      {/* Place Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Lugar</DialogTitle>
            <DialogDescription>
              Información completa del lugar
            </DialogDescription>
          </DialogHeader>
          {selectedPlace && (
            <div className="space-y-6">
              {/* Place Image */}
              {selectedPlace.photo_url && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Foto del Lugar</h3>
                  <img
                    src={selectedPlace.photo_url}
                    alt={selectedPlace.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Place Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Información del Lugar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-medium">{selectedPlace.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Categoría</p>
                    <p className="font-medium">
                      {placeCategories.find(c => c.value === selectedPlace.category)?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="font-medium">
                      {placeTypes.find(t => t.value === selectedPlace.type)?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedPlace.suspended
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {selectedPlace.suspended ? 'Suspendido' : 'Activo'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rating</p>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">
                        {selectedPlace.rating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </div>
                  {selectedPlace.featured && (
                    <div>
                      <p className="text-sm text-gray-500">Destacado hasta</p>
                      <p className="font-medium">
                        {selectedPlace.featured_until
                          ? formatDate(selectedPlace.featured_until)
                          : 'Indefinido'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedPlace.description && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Descripción</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedPlace.description}
                  </p>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Información de Contacto</h3>
                <div className="space-y-2">
                  {selectedPlace.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedPlace.phone}</span>
                    </div>
                  )}
                  {selectedPlace.whatsapp && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">{selectedPlace.whatsapp}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Ubicación</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{selectedPlace.address}</span>
                  </div>
                  {(selectedPlace.lat || selectedPlace.latitude) && (
                    <div className="text-sm text-gray-500">
                      Coordenadas: {selectedPlace.lat || selectedPlace.latitude}, {selectedPlace.lng || selectedPlace.longitude}
                    </div>
                  )}
                </div>
              </div>

              {/* Hours */}
              {selectedPlace.hours && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Horarios</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedPlace.hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="text-sm font-medium capitalize">
                          {day === 'monday' && 'Lunes'}
                          {day === 'tuesday' && 'Martes'}
                          {day === 'wednesday' && 'Miércoles'}
                          {day === 'thursday' && 'Jueves'}
                          {day === 'friday' && 'Viernes'}
                          {day === 'saturday' && 'Sábado'}
                          {day === 'sunday' && 'Domingo'}
                        </span>
                        <span className="text-sm">
                          {hours?.open && hours?.close
                            ? `${hours.open} - ${hours.close}`
                            : 'Cerrado'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={() => handleEditPlace(selectedPlace)}>
              Editar Lugar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Place Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Lugar</DialogTitle>
            <DialogDescription>
              Completa la información para crear un nuevo lugar
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Nombre del Lugar *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Veterinaria Central"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe los servicios que ofrece..."
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Dirección *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ej: Av. Siempre Viva 1234"
              />
            </div>
            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {placeCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {placeTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+54 11 1234-5678"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+54 9 1234-5678"
              />
            </div>
            <div>
              <Label htmlFor="latitude">Latitud</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="-34.6037"
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitud</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="-58.3816"
              />
            </div>
            <div>
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                placeholder="4.5"
              />
            </div>
            <div>
              <Label htmlFor="featured_until">Destacado hasta</Label>
              <Input
                id="featured_until"
                type="date"
                value={formData.featured_until}
                onChange={(e) => setFormData({ ...formData, featured_until: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label htmlFor="featured">Lugar Destacado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="suspended"
                checked={formData.suspended}
                onCheckedChange={(checked) => setFormData({ ...formData, suspended: checked })}
              />
              <Label htmlFor="suspended">Lugar Suspendido</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="dashboard_access"
                checked={formData.dashboard_access}
                onCheckedChange={(checked) => setFormData({ ...formData, dashboard_access: checked })}
              />
              <Label htmlFor="dashboard_access">Acceso al Dashboard</Label>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="photo_url">URL de la Foto</Label>
              <Input
                id="photo_url"
                value={formData.photo_url}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://ejemplo.com/foto.jpg"
              />
              {previewImage && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Vista previa:</p>
                  <img
                    src={previewImage}
                    alt="Vista previa"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <Label>Horarios de Atención</Label>
              <div className="space-y-2">
                {Object.entries(formData.hours).map(([day, hours]) => (
                  <div key={day} className="flex items-center space-x-2">
                    <span className="w-20 text-sm font-medium capitalize">
                      {day === 'monday' && 'Lunes'}
                      {day === 'tuesday' && 'Martes'}
                      {day === 'wednesday' && 'Miércoles'}
                      {day === 'thursday' && 'Jueves'}
                      {day === 'friday' && 'Viernes'}
                      {day === 'saturday' && 'Sábado'}
                      {day === 'sunday' && 'Domingo'}
                    </span>
                    <Input
                      placeholder="Apertura"
                      value={hours.open}
                      onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                      className="w-24"
                    />
                    <Input
                      placeholder="Cierre"
                      value={hours.close}
                      onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                      className="w-24"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creando...' : 'Crear Lugar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Place Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Lugar</DialogTitle>
            <DialogDescription>
              Modifica la información del lugar
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2">
              <Label htmlFor="edit_name">Nombre del Lugar *</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Veterinaria Central"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="edit_description">Descripción</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe los servicios que ofrece..."
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="edit_address">Dirección *</Label>
              <Input
                id="edit_address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ej: Av. Siempre Viva 1234"
              />
            </div>
            <div>
              <Label htmlFor="edit_category">Categoría *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {placeCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {placeTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_phone">Teléfono</Label>
              <Input
                id="edit_phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+54 11 1234-5678"
              />
            </div>
            <div>
              <Label htmlFor="edit_whatsapp">WhatsApp</Label>
              <Input
                id="edit_whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+54 9 1234-5678"
              />
            </div>
            <div>
              <Label htmlFor="edit_latitude">Latitud</Label>
              <Input
                id="edit_latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="-34.6037"
              />
            </div>
            <div>
              <Label htmlFor="edit_longitude">Longitud</Label>
              <Input
                id="edit_longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="-58.3816"
              />
            </div>
            <div>
              <Label htmlFor="edit_rating">Rating</Label>
              <Input
                id="edit_rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                placeholder="4.5"
              />
            </div>
            <div>
              <Label htmlFor="edit_featured_until">Destacado hasta</Label>
              <Input
                id="edit_featured_until"
                type="date"
                value={formData.featured_until}
                onChange={(e) => setFormData({ ...formData, featured_until: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label htmlFor="edit_featured">Lugar Destacado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_suspended"
                checked={formData.suspended}
                onCheckedChange={(checked) => setFormData({ ...formData, suspended: checked })}
              />
              <Label htmlFor="edit_suspended">Lugar Suspendido</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_dashboard_access"
                checked={formData.dashboard_access}
                onCheckedChange={(checked) => setFormData({ ...formData, dashboard_access: checked })}
              />
              <Label htmlFor="edit_dashboard_access">Acceso al Dashboard</Label>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="edit_photo_url">URL de la Foto</Label>
              <Input
                id="edit_photo_url"
                value={formData.photo_url}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://ejemplo.com/foto.jpg"
              />
              {previewImage && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Vista previa:</p>
                  <img
                    src={previewImage}
                    alt="Vista previa"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <Label>Horarios de Atención</Label>
              <div className="space-y-2">
                {Object.entries(formData.hours).map(([day, hours]) => (
                  <div key={day} className="flex items-center space-x-2">
                    <span className="w-20 text-sm font-medium capitalize">
                      {day === 'monday' && 'Lunes'}
                      {day === 'tuesday' && 'Martes'}
                      {day === 'wednesday' && 'Miércoles'}
                      {day === 'thursday' && 'Jueves'}
                      {day === 'friday' && 'Viernes'}
                      {day === 'saturday' && 'Sábado'}
                      {day === 'sunday' && 'Domingo'}
                    </span>
                    <Input
                      placeholder="Apertura"
                      value={hours.open}
                      onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                      className="w-24"
                    />
                    <Input
                      placeholder="Cierre"
                      value={hours.close}
                      onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                      className="w-24"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubmit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Lugar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Gestión de Destacado */}
      <Dialog open={isFeaturedDialogOpen} onOpenChange={setIsFeaturedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Gestionar Destacado
            </DialogTitle>
            <DialogDescription>
              {selectedPlace?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-sm">Estado actual:</span>
              </div>
              {selectedPlace?.featured_until ? (
                <div className="text-sm">
                  <p className="text-green-600 font-medium">
                    ✓ Destacado activo
                  </p>
                  <p className="text-gray-600">
                    Vence el: <span className="font-medium">{formatDate(selectedPlace.featured_until)}</span>
                  </p>
                  {selectedPlace.featured_until && new Date(selectedPlace.featured_until) < new Date() && (
                    <p className="text-red-600 text-xs mt-1">
                      ⚠️ El destacado ha expirado
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No hay fecha de vencimiento configurada</p>
              )}
            </div>

            <div>
              <Label htmlFor="featured_date">Nueva fecha de vencimiento</Label>
              <Input
                id="featured_date"
                type="date"
                value={featuredDate}
                onChange={(e) => setFeaturedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deja la fecha vacía para destacar sin vencimiento
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <span className="font-medium">Fecha actual:</span>
                <p>{new Date().toLocaleDateString('es-AR')}</p>
              </div>
              <div>
                <span className="font-medium">Días restantes:</span>
                <p>
                  {featuredDate ?
                    Math.ceil((new Date(featuredDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) :
                    'Sin fecha'
                  }
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsFeaturedDialogOpen(false)}
            >
              Cancelar
            </Button>
            {selectedPlace?.featured && (
              <Button
                variant="destructive"
                onClick={handleRemoveFeatured}
                disabled={toggleFeaturedMutation.isPending}
              >
                {toggleFeaturedMutation.isPending ? 'Eliminando...' : 'Quitar Destacado'}
              </Button>
            )}
            <Button
              onClick={handleFeaturedSubmit}
              disabled={toggleFeaturedMutation.isPending}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {toggleFeaturedMutation.isPending ? 'Actualizando...' : 'Actualizar Fecha'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}