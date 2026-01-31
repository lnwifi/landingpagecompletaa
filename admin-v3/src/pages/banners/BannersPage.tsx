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
  Image,
  Calendar,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { bannersService } from '@/services/supabase';
import { formatDate, formatDateTime } from '@/utils/formatters';
import toast from 'react-hot-toast';

const targetSections = [
  { value: 'home', label: 'Home' },
  { value: 'tienda', label: 'Tienda' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'red_de_ayuda', label: 'Red de Ayuda' },
  { value: 'refugios', label: 'Refugios' },
  { value: 'perfil', label: 'Perfil' },
];

export function BannersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBanner, setSelectedBanner] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [sectionFilter, setSectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [previewImage, setPreviewImage] = useState<string>('');

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    target_section: 'home',
    start_date: '',
    end_date: '',
    is_active: true,
    priority: 0,
  });

  const queryClient = useQueryClient();

  // Queries
  const { data: banners, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: bannersService.getAll,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: bannersService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setIsCreateDialogOpen(false);
      resetForm();
      setPreviewImage('');
      toast.success('Banner creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear banner');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => bannersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setIsEditDialogOpen(false);
      setSelectedBanner(null);
      resetForm();
      setPreviewImage('');
      toast.success('Banner actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar banner');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: bannersService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setIsDetailDialogOpen(false);
      setSelectedBanner(null);
      toast.success('Banner eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar banner');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      bannersService.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Estado del banner actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar estado');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      target_section: 'home',
      start_date: '',
      end_date: '',
      is_active: true,
      priority: 0,
    });
  };

  const handleViewBanner = (banner: any) => {
    setSelectedBanner(banner);
    setIsDetailDialogOpen(true);
  };

  const handleEditBanner = (banner: any) => {
    setSelectedBanner(banner);
    setFormData({
      title: banner.title || '',
      description: banner.description || '',
      image_url: banner.image_url || '',
      link_url: banner.link_url || '',
      target_section: banner.target_section || 'home',
      start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
      end_date: banner.end_date ? banner.end_date.split('T')[0] : '',
      is_active: banner.is_active !== false,
      priority: banner.priority || 0,
    });
    setPreviewImage(banner.image_url || '');
    setIsEditDialogOpen(true);
    setIsDetailDialogOpen(false);
  };

  const handleCreateBanner = () => {
    resetForm();
    setPreviewImage('');
    setIsCreateDialogOpen(true);
  };

  const handleCreateSubmit = () => {
    if (!formData.title || !formData.image_url || !formData.target_section) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const bannerData = {
      ...formData,
      priority: formData.priority || 0,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : new Date().toISOString(),
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días por defecto
    };

    createMutation.mutate(bannerData);
  };

  const handleEditSubmit = () => {
    if (!selectedBanner || !formData.title || !formData.image_url || !formData.target_section) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const bannerData = {
      ...formData,
      priority: formData.priority || 0,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : selectedBanner.start_date,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : selectedBanner.end_date,
    };

    updateMutation.mutate({
      id: selectedBanner.id,
      ...bannerData,
    });
  };

  const handleDeleteBanner = () => {
    if (!selectedBanner) return;

    if (confirm('¿Estás seguro de que quieres eliminar este banner? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate(selectedBanner.id);
    }
  };

  const handleToggleActive = (banner: any) => {
    toggleActiveMutation.mutate({
      id: banner.id,
      is_active: !banner.is_active,
    });
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image_url: url });
    setPreviewImage(url);
  };

  const filteredBanners = banners?.filter(banner => {
    const matchesSearch =
      banner.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      banner.target_section?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSection = sectionFilter === 'all' || banner.target_section === sectionFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && banner.is_active !== false) ||
      (statusFilter === 'inactive' && banner.is_active === false);

    return matchesSearch && matchesSection && matchesStatus;
  }) || [];

  // Estadísticas
  const stats = {
    total: banners?.length || 0,
    active: banners?.filter(b => b.is_active !== false).length || 0,
    inactive: banners?.filter(b => b.is_active === false).length || 0,
    home: banners?.filter(b => b.target_section === 'home').length || 0,
    tienda: banners?.filter(b => b.target_section === 'tienda').length || 0,
    eventos: banners?.filter(b => b.target_section === 'eventos').length || 0,
  };

  // Sort by priority
  const sortedBanners = [...filteredBanners].sort((a, b) => (b.priority || 0) - (a.priority || 0));

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
            Gestión de Banners
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra los banners promocionales de la plataforma
          </p>
        </div>
        <Button onClick={handleCreateBanner} className="mt-4 sm:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Banner
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
            <p className="text-2xl font-bold text-blue-600">{stats.home}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Home</p>
          </div>
        </div>
        <div className="admin-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.tienda}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tienda</p>
          </div>
        </div>
        <div className="admin-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.eventos}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Eventos</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar banners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={sectionFilter} onValueChange={setSectionFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por sección" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las secciones</SelectItem>
            {targetSections.map(section => (
              <SelectItem key={section.value} value={section.value}>
                {section.label}
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
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Banners Table */}
      <div className="admin-card">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner</TableHead>
                <TableHead>Sección</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBanners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      {banner.image_url && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={banner.image_url}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{banner.title}</p>
                        {banner.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {banner.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                      {targetSections.find(s => s.value === banner.target_section)?.label || banner.target_section}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(banner)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {banner.is_active !== false ? (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        banner.is_active !== false
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {banner.is_active !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>Desde: {formatDate(banner.start_date)}</p>
                      <p>Hasta: {formatDate(banner.end_date)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">#{banner.priority || 0}</span>
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
                        <DropdownMenuItem onClick={() => handleViewBanner(banner)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditBanner(banner)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        {banner.link_url && (
                          <DropdownMenuItem asChild>
                            <a
                              href={banner.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Visitar Link
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteBanner()} className="text-red-600">
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
          {sortedBanners.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm || sectionFilter !== 'all' || statusFilter !== 'all'
                ? 'No se encontraron banners que coincidan con los filtros'
                : 'No hay banners registrados'}
            </div>
          )}
        </div>
      </div>

      {/* Banner Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Banner</DialogTitle>
            <DialogDescription>
              Información completa del banner
            </DialogDescription>
          </DialogHeader>
          {selectedBanner && (
            <div className="space-y-6">
              {/* Banner Image */}
              {selectedBanner.image_url && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Imagen del Banner</h3>
                  <img
                    src={selectedBanner.image_url}
                    alt={selectedBanner.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Banner Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Información del Banner</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Título</p>
                    <p className="font-medium">{selectedBanner.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sección Destino</p>
                    <p className="font-medium">
                      {targetSections.find(s => s.value === selectedBanner.target_section)?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedBanner.is_active !== false
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {selectedBanner.is_active !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Prioridad</p>
                    <p className="font-medium">#{selectedBanner.priority || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Inicio</p>
                    <p className="font-medium">{formatDate(selectedBanner.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Fin</p>
                    <p className="font-medium">{formatDate(selectedBanner.end_date)}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedBanner.description && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Descripción</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedBanner.description}
                  </p>
                </div>
              )}

              {/* Link Info */}
              {selectedBanner.link_url && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Información del Link</h3>
                  <a
                    href={selectedBanner.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm break-all"
                  >
                    {selectedBanner.link_url}
                  </a>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={() => handleEditBanner(selectedBanner)}>
              Editar Banner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Banner Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Banner</DialogTitle>
            <DialogDescription>
              Completa la información para crear un nuevo banner
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Título del Banner *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Gran Venta de Verano"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el banner..."
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="target_section">Sección Destino *</Label>
              <Select value={formData.target_section} onValueChange={(value) => setFormData({ ...formData, target_section: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {targetSections.map(section => (
                    <SelectItem key={section.value} value={section.value}>
                      {section.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                placeholder="0 (más alto = más prioridad)"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Banner Activo</Label>
            </div>
            <div>
              <Label htmlFor="start_date">Fecha de Inicio</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Fecha de Fin</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="image_url">URL de la Imagen *</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
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
              <Label htmlFor="link_url">URL del Link (opcional)</Label>
              <Input
                id="link_url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="https://ejemplo.com/pagina"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creando...' : 'Crear Banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Banner Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Banner</DialogTitle>
            <DialogDescription>
              Modifica la información del banner
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2">
              <Label htmlFor="edit_title">Título del Banner *</Label>
              <Input
                id="edit_title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Gran Venta de Verano"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="edit_description">Descripción</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el banner..."
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="edit_target_section">Sección Destino *</Label>
              <Select value={formData.target_section} onValueChange={(value) => setFormData({ ...formData, target_section: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {targetSections.map(section => (
                    <SelectItem key={section.value} value={section.value}>
                      {section.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_priority">Prioridad</Label>
              <Input
                id="edit_priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                placeholder="0 (más alto = más prioridad)"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit_is_active">Banner Activo</Label>
            </div>
            <div>
              <Label htmlFor="edit_start_date">Fecha de Inicio</Label>
              <Input
                id="edit_start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_end_date">Fecha de Fin</Label>
              <Input
                id="edit_end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="edit_image_url">URL de la Imagen *</Label>
              <Input
                id="edit_image_url"
                value={formData.image_url}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
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
              <Label htmlFor="edit_link_url">URL del Link (opcional)</Label>
              <Input
                id="edit_link_url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="https://ejemplo.com/pagina"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubmit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}