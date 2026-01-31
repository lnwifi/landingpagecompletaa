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
  DialogTrigger,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  MoreHorizontal,
  Search,
  Plus,
  Edit,
  Trash2,
  Crown,
  Users,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { membershipTypesService, userMembershipsService } from '@/services/supabase';
import { formatDate, formatCurrency } from '@/utils/formatters';
import toast from 'react-hot-toast';

interface MembershipTypeFormData {
  name: string;
  description: string;
  max_pets: number;
  max_photos_per_pet: number;
  max_interests_per_pet: number;
  has_ads: boolean;
  has_coupons: boolean;
  has_store_discount: boolean;
  price: number;
}

export function MembershipsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateTypeDialogOpen, setIsCreateTypeDialogOpen] = useState(false);
  const [isEditTypeDialogOpen, setIsEditTypeDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [typeFormData, setTypeFormData] = useState<MembershipTypeFormData>({
    name: '',
    description: '',
    max_pets: 1,
    max_photos_per_pet: 3,
    max_interests_per_pet: 5,
    has_ads: false,
    has_coupons: false,
    has_store_discount: false,
    price: 0,
  });

  const queryClient = useQueryClient();

  // Queries para tipos de membresía
  const { data: membershipTypes, isLoading: loadingTypes } = useQuery({
    queryKey: ['membership-types'],
    queryFn: membershipTypesService.getAll,
  });

  // Queries para membresías de usuarios
  const { data: userMemberships, isLoading: loadingUserMemberships } = useQuery({
    queryKey: ['user-memberships'],
    queryFn: userMembershipsService.getAll,
  });

  // Mutations para tipos de membresía
  const createTypeMutation = useMutation({
    mutationFn: membershipTypesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-types'] });
      setIsCreateTypeDialogOpen(false);
      resetTypeForm();
      toast.success('Tipo de membresía creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear tipo de membresía');
    },
  });

  const updateTypeMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      membershipTypesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-types'] });
      setIsEditTypeDialogOpen(false);
      setSelectedType(null);
      toast.success('Tipo de membresía actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar tipo de membresía');
    },
  });

  const deleteTypeMutation = useMutation({
    mutationFn: membershipTypesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-types'] });
      toast.success('Tipo de membresía eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar tipo de membresía');
    },
  });

  // Mutation para cancelar membresía de usuario
  const cancelMembershipMutation = useMutation({
    mutationFn: userMembershipsService.cancelMembership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-memberships'] });
      toast.success('Membresía cancelada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al cancelar membresía');
    },
  });

  const resetTypeForm = () => {
    setTypeFormData({
      name: '',
      description: '',
      max_pets: 1,
      max_photos_per_pet: 3,
      max_interests_per_pet: 5,
      has_ads: false,
      has_coupons: false,
      has_store_discount: false,
      price: 0,
    });
  };

  const handleCreateMembershipType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeFormData.name) {
      toast.error('Por favor completa el nombre del tipo de membresía');
      return;
    }
    createTypeMutation.mutate(typeFormData);
  };

  const handleEditMembershipType = (type: any) => {
    setSelectedType(type);
    setTypeFormData({
      name: type.name,
      description: type.description || '',
      max_pets: type.max_pets,
      max_photos_per_pet: type.max_photos_per_pet,
      max_interests_per_pet: type.max_interests_per_pet,
      has_ads: type.has_ads,
      has_coupons: type.has_coupons,
      has_store_discount: type.has_store_discount,
      price: type.price || 0,
    });
    setIsEditTypeDialogOpen(true);
  };

  const handleUpdateMembershipType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !typeFormData.name) {
      toast.error('Por favor completa el nombre del tipo de membresía');
      return;
    }
    updateTypeMutation.mutate({
      id: selectedType.id,
      updates: typeFormData,
    });
  };

  const handleDeleteMembershipType = (typeId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tipo de membresía?')) {
      deleteTypeMutation.mutate(typeId);
    }
  };

  const handleCancelMembership = (membershipId: string) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta membresía?')) {
      cancelMembershipMutation.mutate(membershipId);
    }
  };

  // Filtrado de datos
  const filteredTypes = membershipTypes?.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredUserMemberships = userMemberships?.filter(membership =>
    membership.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    membership.membership_types?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Estadísticas
  const activeMemberships = userMemberships?.filter(m => m.is_active).length || 0;
  const totalRevenue = userMemberships?.reduce((sum, m) => sum + (m.membership_types?.price || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Gestión de Membresías
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra los tipos de membresía y suscripciones de usuarios
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tipos de Membresía
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {membershipTypes?.length || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500">
              <Crown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Membresías Activas
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {activeMemberships}
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
                Ingresos Totales
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="types" className="space-y-6">
        <TabsList>
          <TabsTrigger value="types">Tipos de Membresía</TabsTrigger>
          <TabsTrigger value="user-memberships">Membresías de Usuarios</TabsTrigger>
        </TabsList>

        {/* Tab de Tipos de Membresía */}
        <TabsContent value="types" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tipos de membresía..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
            <Dialog open={isCreateTypeDialogOpen} onOpenChange={setIsCreateTypeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 sm:mt-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Tipo de Membresía
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Tipo de Membresía</DialogTitle>
                  <DialogDescription>
                    Define las características y beneficios de un nuevo tipo de membresía.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateMembershipType}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nombre *
                      </Label>
                      <Input
                        id="name"
                        value={typeFormData.name}
                        onChange={(e) => setTypeFormData({ ...typeFormData, name: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Descripción
                      </Label>
                      <Input
                        id="description"
                        value={typeFormData.description}
                        onChange={(e) => setTypeFormData({ ...typeFormData, description: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        Precio (ARS)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={typeFormData.price}
                        onChange={(e) => setTypeFormData({ ...typeFormData, price: parseFloat(e.target.value) || 0 })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="max_pets" className="text-right">
                        Max. Mascotas
                      </Label>
                      <Input
                        id="max_pets"
                        type="number"
                        min="1"
                        value={typeFormData.max_pets}
                        onChange={(e) => setTypeFormData({ ...typeFormData, max_pets: parseInt(e.target.value) || 1 })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="max_photos_per_pet" className="text-right">
                        Max. Fotos por Mascota
                      </Label>
                      <Input
                        id="max_photos_per_pet"
                        type="number"
                        min="1"
                        value={typeFormData.max_photos_per_pet}
                        onChange={(e) => setTypeFormData({ ...typeFormData, max_photos_per_pet: parseInt(e.target.value) || 1 })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="max_interests_per_pet" className="text-right">
                        Max. Intereses por Mascota
                      </Label>
                      <Input
                        id="max_interests_per_pet"
                        type="number"
                        min="1"
                        value={typeFormData.max_interests_per_pet}
                        onChange={(e) => setTypeFormData({ ...typeFormData, max_interests_per_pet: parseInt(e.target.value) || 1 })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="has_ads"
                          checked={typeFormData.has_ads}
                          onCheckedChange={(checked) => setTypeFormData({ ...typeFormData, has_ads: checked })}
                        />
                        <Label htmlFor="has_ads">Sin Anuncios</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="has_coupons"
                          checked={typeFormData.has_coupons}
                          onCheckedChange={(checked) => setTypeFormData({ ...typeFormData, has_coupons: checked })}
                        />
                        <Label htmlFor="has_coupons">Cupones Exclusivos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="has_store_discount"
                          checked={typeFormData.has_store_discount}
                          onCheckedChange={(checked) => setTypeFormData({ ...typeFormData, has_store_discount: checked })}
                        />
                        <Label htmlFor="has_store_discount">Descuentos en Tienda</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createTypeMutation.isPending}>
                      {createTypeMutation.isPending ? 'Creando...' : 'Crear Tipo de Membresía'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabla de Tipos de Membresía */}
          <div className="admin-card">
            <div className="rounded-md border overflow-x-auto">
              <div className="min-w-[700px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Nombre</TableHead>
                      <TableHead className="min-w-[100px]">Precio</TableHead>
                      <TableHead className="min-w-[120px]">Max. Mascotas</TableHead>
                      <TableHead className="min-w-[200px]">Beneficios</TableHead>
                      <TableHead className="min-w-[120px] hidden sm:table-cell">Fecha Creación</TableHead>
                      <TableHead className="text-right min-w-[80px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-medium text-sm truncate">{type.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate sm:hidden">
                              {formatCurrency(type.price || 0)} • {type.max_pets} mascotas
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm font-medium">{formatCurrency(type.price || 0)}</span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm">{type.max_pets}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {type.has_ads && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 whitespace-nowrap">
                                Sin Ads
                              </span>
                            )}
                            {type.has_coupons && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 whitespace-nowrap">
                                Cupones
                              </span>
                            )}
                            {type.has_store_discount && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 whitespace-nowrap">
                                Descuentos
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm">{formatDate(type.created_at)}</span>
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
                              onClick={() => handleEditMembershipType(type)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteMembershipType(type.id)}
                              className="text-red-600"
                            >
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
              {filteredTypes.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No se encontraron tipos de membresía que coincidan con la búsqueda' : 'No hay tipos de membresía registrados'}
                </div>
              )}
            </div>
          </div>
        </div>
        </TabsContent>

        {/* Tab de Membresías de Usuarios */}
        <TabsContent value="user-memberships" className="space-y-6">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar membresías de usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>

          {/* Tabla de Membresías de Usuarios */}
          <div className="admin-card">
            <div className="rounded-md border overflow-x-auto">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Usuario</TableHead>
                      <TableHead className="min-w-[150px]">Tipo de Membresía</TableHead>
                      <TableHead className="min-w-[100px]">Estado</TableHead>
                      <TableHead className="min-w-[100px] hidden sm:table-cell">Inicio</TableHead>
                      <TableHead className="min-w-[100px] hidden md:table-cell">Fin</TableHead>
                      <TableHead className="min-w-[100px] hidden lg:table-cell">Precio</TableHead>
                      <TableHead className="text-right min-w-[80px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUserMemberships.map((membership) => (
                      <TableRow key={membership.id}>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {membership.profiles?.full_name || 'Usuario'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {membership.profiles?.email}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate sm:hidden">
                              {membership.membership_types?.name} • {formatCurrency(membership.membership_types?.price || 0)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{membership.membership_types?.name}</p>
                            <p className="text-xs text-gray-500 whitespace-nowrap">
                              {membership.type === 'subscription' ? 'Suscripción' : 'Pago único'}
                            </p>
                          </div>
                        </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            membership.status === 'active' && membership.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : membership.status === 'cancelled'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {membership.status === 'active' && membership.is_active ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Activa
                              </>
                            ) : membership.status === 'cancelled' ? (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Cancelada
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Vencida
                              </>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm whitespace-nowrap">{formatDate(membership.start_date)}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm whitespace-nowrap">
                          {membership.end_date ? formatDate(membership.end_date) : 'Ilimitada'}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm font-medium">{formatCurrency(membership.membership_types?.price || 0)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        {membership.status === 'active' && membership.is_active && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelMembership(membership.id)}
                            disabled={cancelMembershipMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredUserMemberships.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No se encontraron membresías que coincidan con la búsqueda' : 'No hay membresías registradas'}
                </div>
              )}
            </div>
          </div>
        </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog for Membership Types */}
      <Dialog open={isEditTypeDialogOpen} onOpenChange={setIsEditTypeDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Tipo de Membresía</DialogTitle>
            <DialogDescription>
              Modifica las características y beneficios del tipo de membresía.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateMembershipType}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_name" className="text-right">
                  Nombre *
                </Label>
                <Input
                  id="edit_name"
                  value={typeFormData.name}
                  onChange={(e) => setTypeFormData({ ...typeFormData, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_description" className="text-right">
                  Descripción
                </Label>
                <Input
                  id="edit_description"
                  value={typeFormData.description}
                  onChange={(e) => setTypeFormData({ ...typeFormData, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_price" className="text-right">
                  Precio (ARS)
                </Label>
                <Input
                  id="edit_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={typeFormData.price}
                  onChange={(e) => setTypeFormData({ ...typeFormData, price: parseFloat(e.target.value) || 0 })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_max_pets" className="text-right">
                  Max. Mascotas
                </Label>
                <Input
                  id="edit_max_pets"
                  type="number"
                  min="1"
                  value={typeFormData.max_pets}
                  onChange={(e) => setTypeFormData({ ...typeFormData, max_pets: parseInt(e.target.value) || 1 })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_max_photos_per_pet" className="text-right">
                  Max. Fotos por Mascota
                </Label>
                <Input
                  id="edit_max_photos_per_pet"
                  type="number"
                  min="1"
                  value={typeFormData.max_photos_per_pet}
                  onChange={(e) => setTypeFormData({ ...typeFormData, max_photos_per_pet: parseInt(e.target.value) || 1 })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_max_interests_per_pet" className="text-right">
                  Max. Intereses por Mascota
                </Label>
                <Input
                  id="edit_max_interests_per_pet"
                  type="number"
                  min="1"
                  value={typeFormData.max_interests_per_pet}
                  onChange={(e) => setTypeFormData({ ...typeFormData, max_interests_per_pet: parseInt(e.target.value) || 1 })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit_has_ads"
                    checked={typeFormData.has_ads}
                    onCheckedChange={(checked) => setTypeFormData({ ...typeFormData, has_ads: checked })}
                  />
                  <Label htmlFor="edit_has_ads">Sin Anuncios</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit_has_coupons"
                    checked={typeFormData.has_coupons}
                    onCheckedChange={(checked) => setTypeFormData({ ...typeFormData, has_coupons: checked })}
                  />
                  <Label htmlFor="edit_has_coupons">Cupones Exclusivos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit_has_store_discount"
                    checked={typeFormData.has_store_discount}
                    onCheckedChange={(checked) => setTypeFormData({ ...typeFormData, has_store_discount: checked })}
                  />
                  <Label htmlFor="edit_has_store_discount">Descuentos en Tienda</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateTypeMutation.isPending}>
                {updateTypeMutation.isPending ? 'Actualizando...' : 'Actualizar Tipo de Membresía'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}