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
  Megaphone,
  Info,
  CheckCircle,
  AlertTriangle,
  Gift,
} from 'lucide-react';
import { popupsService } from '@/services/supabase';
import { formatDate, formatDateTime } from '@/utils/formatters';
import toast from 'react-hot-toast';

const popupTypes = [
  { value: 'info', label: 'Información', icon: Info, color: 'text-blue-600' },
  { value: 'promotion', label: 'Promoción', icon: Gift, color: 'text-purple-600' },
  { value: 'announcement', label: 'Anuncio', icon: Megaphone, color: 'text-amber-600' },
  { value: 'warning', label: 'Advertencia', icon: AlertTriangle, color: 'text-orange-600' },
  { value: 'success', label: 'Éxito', icon: CheckCircle, color: 'text-green-600' },
];

const targetAudiences = [
  { value: 'all', label: 'Todos los usuarios' },
  { value: 'users', label: 'Usuarios registrados' },
  { value: 'premium_users', label: 'Usuarios Premium' },
  { value: 'free_users', label: 'Usuarios Gratuitos' },
];

export function PopupsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPopup, setSelectedPopup] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [previewImage, setPreviewImage] = useState<string>('');

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    image_url: '',
    popup_type: 'info',
    button_text: '',
    button_action: '',
    is_active: true,
    priority: 0,
    start_date: '',
    end_date: '',
    target_audience: 'all',
    show_once_per_user: false,
  });

  const queryClient = useQueryClient();

  // Queries
  const { data: popups, isLoading } = useQuery({
    queryKey: ['popups'],
    queryFn: popupsService.getAll,
  });

  const { data: stats } = useQuery({
    queryKey: ['popups-stats'],
    queryFn: popupsService.getStats,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: popupsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popups'] });
      queryClient.invalidateQueries({ queryKey: ['popups-stats'] });
      setIsCreateDialogOpen(false);
      resetForm();
      setPreviewImage('');
      toast.success('Popup creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear popup');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => popupsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popups'] });
      queryClient.invalidateQueries({ queryKey: ['popups-stats'] });
      setIsEditDialogOpen(false);
      setSelectedPopup(null);
      resetForm();
      setPreviewImage('');
      toast.success('Popup actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar popup');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: popupsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popups'] });
      queryClient.invalidateQueries({ queryKey: ['popups-stats'] });
      setIsDetailDialogOpen(false);
      setSelectedPopup(null);
      toast.success('Popup eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar popup');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      popupsService.toggleActive(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['popups'] });
      queryClient.invalidateQueries({ queryKey: ['popups-stats'] });
      toast.success('Estado del popup actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar estado');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      image_url: '',
      popup_type: 'info',
      button_text: '',
      button_action: '',
      is_active: true,
      priority: 0,
      start_date: '',
      end_date: '',
      target_audience: 'all',
      show_once_per_user: false,
    });
  };

  const handleViewPopup = (popup: any) => {
    setSelectedPopup(popup);
    setIsDetailDialogOpen(true);
  };

  const handleEditPopup = (popup: any) => {
    setSelectedPopup(popup);
    setFormData({
      title: popup.title || '',
      message: popup.message || '',
      image_url: popup.image_url || '',
      popup_type: popup.popup_type || 'info',
      button_text: popup.button_text || '',
      button_action: popup.button_action || '',
      is_active: popup.is_active !== false,
      priority: popup.priority || 0,
      start_date: popup.start_date ? popup.start_date.split('T')[0] : '',
      end_date: popup.end_date ? popup.end_date.split('T')[0] : '',
      target_audience: popup.target_audience || 'all',
      show_once_per_user: popup.show_once_per_user || false,
    });
    setPreviewImage(popup.image_url || '');
    setIsEditDialogOpen(true);
    setIsDetailDialogOpen(false);
  };

  const handleCreatePopup = () => {
    resetForm();
    setPreviewImage('');
    setIsCreateDialogOpen(true);
  };

  const handleCreateSubmit = () => {
    if (!formData.title || !formData.message) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const popupData = {
      title: formData.title,
      message: formData.message,
      image_url: formData.image_url || null,
      popup_type: formData.popup_type,
      button_text: formData.button_text || null,
      button_action: formData.button_action || null,
      is_active: formData.is_active,
      priority: formData.priority || 0,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : new Date().toISOString(),
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      target_audience: formData.target_audience,
      show_once_per_user: formData.show_once_per_user,
    };

    createMutation.mutate(popupData);
  };

  const handleEditSubmit = () => {
    if (!selectedPopup || !formData.title || !formData.message) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const popupData = {
      title: formData.title,
      message: formData.message,
      image_url: formData.image_url || null,
      popup_type: formData.popup_type,
      button_text: formData.button_text || null,
      button_action: formData.button_action || null,
      is_active: formData.is_active,
      priority: formData.priority || 0,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : selectedPopup.start_date,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : selectedPopup.end_date,
      target_audience: formData.target_audience,
      show_once_per_user: formData.show_once_per_user,
    };

    updateMutation.mutate({
      id: selectedPopup.id,
      ...popupData,
    });
  };

  const handleDeletePopup = () => {
    if (!selectedPopup) return;

    if (confirm('¿Estás seguro de que quieres eliminar este popup? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate(selectedPopup.id);
    }
  };

  const handleToggleActive = (popup: any) => {
    toggleActiveMutation.mutate({
      id: popup.id,
      is_active: !popup.is_active,
    });
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image_url: url });
    setPreviewImage(url);
  };

  const filteredPopups = popups?.filter(popup => {
    const matchesSearch =
      popup.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      popup.message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || popup.popup_type === typeFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && popup.is_active !== false) ||
      (statusFilter === 'inactive' && popup.is_active === false);

    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  // Sort by priority
  const sortedPopups = [...filteredPopups].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // Get popup type icon and color
  const getPopupTypeDisplay = (type: string) => {
    const found = popupTypes.find(t => t.value === type);
    return found || { icon: Info, color: 'text-gray-600', label: type };
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
            Gestión de Popups
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra los mensajes emergentes de la app móvil
          </p>
        </div>
        <Button onClick={handleCreatePopup} className="mt-4 sm:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Popup
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="admin-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.total || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          </div>
        </div>
        <div className="admin-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Activos</p>
          </div>
        </div>
        <div className="admin-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{stats?.inactive || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Inactivos</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar popups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {popupTypes.map(type => (
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
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Popups Table */}
      <div className="admin-card">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Popup</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Audiencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPopups.map((popup) => {
                const typeDisplay = getPopupTypeDisplay(popup.popup_type);
                const TypeIcon = typeDisplay.icon;
                return (
                  <TableRow key={popup.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        {popup.image_url && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={popup.image_url}
                              alt={popup.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{popup.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {popup.message}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <TypeIcon className={`w-4 h-4 ${typeDisplay.color}`} />
                        <span className="text-sm">{typeDisplay.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        {targetAudiences.find(a => a.value === popup.target_audience)?.label || popup.target_audience}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(popup)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {popup.is_active !== false ? (
                            <ToggleRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          popup.is_active !== false
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {popup.is_active !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>Desde: {formatDate(popup.start_date)}</p>
                        <p>Hasta: {popup.end_date ? formatDate(popup.end_date) : 'Sin límite'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">#{popup.priority || 0}</span>
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
                          <DropdownMenuItem onClick={() => handleViewPopup(popup)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditPopup(popup)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeletePopup()} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {sortedPopups.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'No se encontraron popups que coincidan con los filtros'
                : 'No hay popups registrados'}
            </div>
          )}
        </div>
      </div>

      {/* Popup Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Popup</DialogTitle>
            <DialogDescription>
              Información completa del popup
            </DialogDescription>
          </DialogHeader>
          {selectedPopup && (
            <div className="space-y-6">
              {/* Popup Image */}
              {selectedPopup.image_url && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Imagen del Popup</h3>
                  <img
                    src={selectedPopup.image_url}
                    alt={selectedPopup.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Popup Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Información del Popup</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Título</p>
                    <p className="font-medium">{selectedPopup.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const typeDisplay = getPopupTypeDisplay(selectedPopup.popup_type);
                        const TypeIcon = typeDisplay.icon;
                        return (
                          <>
                            <TypeIcon className={`w-4 h-4 ${typeDisplay.color}`} />
                            <span className="font-medium">{typeDisplay.label}</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Audiencia</p>
                    <p className="font-medium">
                      {targetAudiences.find(a => a.value === selectedPopup.target_audience)?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedPopup.is_active !== false
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {selectedPopup.is_active !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Prioridad</p>
                    <p className="font-medium">#{selectedPopup.priority || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mostrar una vez</p>
                    <p className="font-medium">{selectedPopup.show_once_per_user ? 'Sí' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Inicio</p>
                    <p className="font-medium">{formatDateTime(selectedPopup.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Fin</p>
                    <p className="font-medium">{selectedPopup.end_date ? formatDateTime(selectedPopup.end_date) : 'Sin límite'}</p>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Mensaje</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedPopup.message}
                </p>
              </div>

              {/* Button Info */}
              {selectedPopup.button_text && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Información del Botón</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Texto del Botón</p>
                      <p className="font-medium">{selectedPopup.button_text}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Acción</p>
                      <p className="font-medium break-all">{selectedPopup.button_action || 'Ninguna'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={() => handleEditPopup(selectedPopup)}>
              Editar Popup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Popup Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Popup</DialogTitle>
            <DialogDescription>
              Completa la información para crear un nuevo popup
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Título del Popup *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: ¡Gran Promoción de Verano!"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="message">Mensaje *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe el mensaje del popup..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="popup_type">Tipo de Popup</Label>
              <Select value={formData.popup_type} onValueChange={(value) => setFormData({ ...formData, popup_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {popupTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="target_audience">Audiencia Objetivo</Label>
              <Select value={formData.target_audience} onValueChange={(value) => setFormData({ ...formData, target_audience: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {targetAudiences.map(audience => (
                    <SelectItem key={audience.value} value={audience.value}>
                      {audience.label}
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
                id="show_once_per_user"
                checked={formData.show_once_per_user}
                onCheckedChange={(checked) => setFormData({ ...formData, show_once_per_user: checked })}
              />
              <Label htmlFor="show_once_per_user">Mostrar solo una vez por usuario</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Popup Activo</Label>
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
              <Label htmlFor="image_url">URL de la Imagen</Label>
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
            <div>
              <Label htmlFor="button_text">Texto del Botón</Label>
              <Input
                id="button_text"
                value={formData.button_text}
                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                placeholder="Ej: Ver más"
              />
            </div>
            <div>
              <Label htmlFor="button_action">Acción del Botón</Label>
              <Input
                id="button_action"
                value={formData.button_action}
                onChange={(e) => setFormData({ ...formData, button_action: e.target.value })}
                placeholder="/ruta o https://url.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creando...' : 'Crear Popup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Popup Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Popup</DialogTitle>
            <DialogDescription>
              Modifica la información del popup
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2">
              <Label htmlFor="edit_title">Título del Popup *</Label>
              <Input
                id="edit_title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: ¡Gran Promoción de Verano!"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="edit_message">Mensaje *</Label>
              <Textarea
                id="edit_message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe el mensaje del popup..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit_popup_type">Tipo de Popup</Label>
              <Select value={formData.popup_type} onValueChange={(value) => setFormData({ ...formData, popup_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {popupTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_target_audience">Audiencia Objetivo</Label>
              <Select value={formData.target_audience} onValueChange={(value) => setFormData({ ...formData, target_audience: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {targetAudiences.map(audience => (
                    <SelectItem key={audience.value} value={audience.value}>
                      {audience.label}
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
                id="edit_show_once_per_user"
                checked={formData.show_once_per_user}
                onCheckedChange={(checked) => setFormData({ ...formData, show_once_per_user: checked })}
              />
              <Label htmlFor="edit_show_once_per_user">Mostrar solo una vez por usuario</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit_is_active">Popup Activo</Label>
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
              <Label htmlFor="edit_image_url">URL de la Imagen</Label>
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
            <div>
              <Label htmlFor="edit_button_text">Texto del Botón</Label>
              <Input
                id="edit_button_text"
                value={formData.button_text}
                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                placeholder="Ej: Ver más"
              />
            </div>
            <div>
              <Label htmlFor="edit_button_action">Acción del Botón</Label>
              <Input
                id="edit_button_action"
                value={formData.button_action}
                onChange={(e) => setFormData({ ...formData, button_action: e.target.value })}
                placeholder="/ruta o https://url.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubmit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Popup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
