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
  Tag,
  Calendar,
  Percent,
  DollarSign,
  Copy,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { couponsService } from '@/services/supabase';
import { formatDate, formatDateTime, formatCurrency } from '@/utils/formatters';
import toast from 'react-hot-toast';

const discountTypes = [
  { value: 'percentage', label: 'Porcentaje' },
  { value: 'fixed', label: 'Monto Fijo' },
];

export function CouponsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [membershipFilter, setMembershipFilter] = useState('all');

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    discount_type: 'percentage',
    discount_percentage: 0,
    discount_amount: 0,
    valid_from: '',
    valid_until: '',
    partner_name: '',
    place_id: '',
    is_active: true,
    membership_required: false,
  });

  const queryClient = useQueryClient();

  // Queries
  const { data: coupons, isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: couponsService.getAll,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: couponsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Cupón creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear cupón');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => couponsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setIsEditDialogOpen(false);
      setSelectedCoupon(null);
      resetForm();
      toast.success('Cupón actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar cupón');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: couponsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setIsDetailDialogOpen(false);
      setSelectedCoupon(null);
      toast.success('Cupón eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar cupón');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      couponsService.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Estado del cupón actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar estado');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      code: '',
      discount_type: 'percentage',
      discount_percentage: 0,
      discount_amount: 0,
      valid_from: '',
      valid_until: '',
      partner_name: '',
      place_id: '',
      is_active: true,
      membership_required: false,
    });
  };

  const handleViewCoupon = (coupon: any) => {
    setSelectedCoupon(coupon);
    setIsDetailDialogOpen(true);
  };

  const handleEditCoupon = (coupon: any) => {
    setSelectedCoupon(coupon);
    setFormData({
      title: coupon.title || '',
      description: coupon.description || '',
      code: coupon.code || '',
      discount_type: coupon.discount_percentage ? 'percentage' : 'fixed',
      discount_percentage: coupon.discount_percentage || 0,
      discount_amount: coupon.discount_amount || 0,
      valid_from: coupon.valid_from ? coupon.valid_from.split('T')[0] : '',
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
      partner_name: coupon.partner_name || '',
      place_id: coupon.place_id || '',
      is_active: coupon.is_active !== false,
      membership_required: coupon.membership_required || false,
    });
    setIsEditDialogOpen(true);
    setIsDetailDialogOpen(false);
  };

  const handleCreateCoupon = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleCreateSubmit = () => {
    if (!formData.title || !formData.code || (!formData.discount_percentage && !formData.discount_amount)) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const couponData = {
      ...formData,
      valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : new Date().toISOString(),
      valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Remove unnecessary fields based on discount type
    if (couponData.discount_type === 'percentage') {
      delete couponData.discount_amount;
    } else {
      delete couponData.discount_percentage;
    }
    delete couponData.discount_type;

    createMutation.mutate(couponData);
  };

  const handleEditSubmit = () => {
    if (!selectedCoupon || !formData.title || !formData.code || (!formData.discount_percentage && !formData.discount_amount)) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const couponData = {
      ...formData,
      valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : selectedCoupon.valid_from,
      valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : selectedCoupon.valid_until,
    };

    // Remove unnecessary fields based on discount type
    if (couponData.discount_type === 'percentage') {
      delete couponData.discount_amount;
    } else {
      delete couponData.discount_percentage;
    }
    delete couponData.discount_type;

    updateMutation.mutate({
      id: selectedCoupon.id,
      ...couponData,
    });
  };

  const handleDeleteCoupon = () => {
    if (!selectedCoupon) return;

    if (confirm('¿Estás seguro de que quieres eliminar este cupón? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate(selectedCoupon.id);
    }
  };

  const handleToggleActive = (coupon: any) => {
    toggleActiveMutation.mutate({
      id: coupon.id,
      is_active: !coupon.is_active,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Código copiado al portapapeles');
  };

  const generateRandomCode = () => {
    const code = 'PETO' + Math.random().toString(36).substr(2, 8).toUpperCase();
    setFormData({ ...formData, code });
  };

  const filteredCoupons = coupons?.filter(coupon => {
    const matchesSearch =
      coupon.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.partner_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const hasPercentageDiscount = coupon.discount_percentage && coupon.discount_percentage > 0;
    const matchesType = typeFilter === 'all' ||
      (typeFilter === 'percentage' && hasPercentageDiscount) ||
      (typeFilter === 'fixed' && !hasPercentageDiscount);

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && coupon.is_active !== false) ||
      (statusFilter === 'inactive' && coupon.is_active === false);

    const matchesMembership = membershipFilter === 'all' ||
      (membershipFilter === 'required' && coupon.membership_required === true) ||
      (membershipFilter === 'not_required' && coupon.membership_required !== true);

    return matchesSearch && matchesType && matchesStatus && matchesMembership;
  }) || [];

  // Estadísticas
  const stats = {
    total: coupons?.length || 0,
    active: coupons?.filter(c => c.is_active !== false).length || 0,
    inactive: coupons?.filter(c => c.is_active === false).length || 0,
    percentage: coupons?.filter(c => c.discount_percentage && c.discount_percentage > 0).length || 0,
    fixed: coupons?.filter(c => c.discount_amount && c.discount_amount > 0).length || 0,
    membershipRequired: coupons?.filter(c => c.membership_required === true).length || 0,
  };

  // Check if coupon is expired
  const isCouponExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
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
            Gestión de Cupones
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra los cupones de descuento de la plataforma
          </p>
        </div>
        <Button onClick={handleCreateCoupon} className="mt-4 sm:mt-0">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cupón
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
            <p className="text-2xl font-bold text-blue-600">{stats.percentage}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Porcentaje</p>
          </div>
        </div>
        <div className="admin-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.fixed}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monto Fijo</p>
          </div>
        </div>
        <div className="admin-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.membershipRequired}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Con Membresía</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cupones..."
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
            {discountTypes.map(type => (
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
        <Select value={membershipFilter} onValueChange={setMembershipFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por membresía" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="required">Requiere membresía</SelectItem>
            <SelectItem value="not_required">No requiere membresía</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Coupons Table */}
      <div className="admin-card">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cupón</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Restricciones</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p className="font-semibold">{coupon.title}</p>
                      {coupon.partner_name && (
                        <p className="text-sm text-gray-500">{coupon.partner_name}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {coupon.code}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(coupon.code)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {coupon.discount_percentage ? (
                        <>
                          <Percent className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold text-blue-600">
                            {coupon.discount_percentage}%
                          </span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="font-semibold text-green-600">
                            {formatCurrency(coupon.discount_amount)}
                          </span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>Desde: {formatDate(coupon.valid_from)}</p>
                      <p>Hasta: {formatDate(coupon.valid_until)}</p>
                      {isCouponExpired(coupon.valid_until) && (
                        <span className="text-xs text-red-600">Expirado</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {coupon.is_active !== false ? (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        coupon.is_active !== false && !isCouponExpired(coupon.valid_until)
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {coupon.is_active !== false && !isCouponExpired(coupon.valid_until) ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {coupon.membership_required && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          <Tag className="w-3 h-3 mr-1" />
                          Membresía
                        </span>
                      )}
                      {coupon.place_id && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                          Local específico
                        </span>
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
                        <DropdownMenuItem onClick={() => handleViewCoupon(coupon)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditCoupon(coupon)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteCoupon()} className="text-red-600">
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
          {filteredCoupons.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || membershipFilter !== 'all'
                ? 'No se encontraron cupones que coincidan con los filtros'
                : 'No hay cupones registrados'}
            </div>
          )}
        </div>
      </div>

      {/* Coupon Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Cupón</DialogTitle>
            <DialogDescription>
              Información completa del cupón
            </DialogDescription>
          </DialogHeader>
          {selectedCoupon && (
            <div className="space-y-6">
              {/* Coupon Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Información del Cupón</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Título</p>
                    <p className="font-medium">{selectedCoupon.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Código</p>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {selectedCoupon.code}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(selectedCoupon.code)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Descuento</p>
                    <p className="font-medium">
                      {selectedCoupon.discount_percentage
                        ? `${selectedCoupon.discount_percentage}%`
                        : formatCurrency(selectedCoupon.discount_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedCoupon.is_active !== false && !isCouponExpired(selectedCoupon.valid_until)
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {selectedCoupon.is_active !== false && !isCouponExpired(selectedCoupon.valid_until) ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Inicio</p>
                    <p className="font-medium">{formatDate(selectedCoupon.valid_from)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Fin</p>
                    <p className="font-medium">{formatDate(selectedCoupon.valid_until)}</p>
                  </div>
                  {selectedCoupon.partner_name && (
                    <div>
                      <p className="text-sm text-gray-500">Partner</p>
                      <p className="font-medium">{selectedCoupon.partner_name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedCoupon.description && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Descripción</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedCoupon.description}
                  </p>
                </div>
              )}

              {/* Restrictions */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Restricciones</h3>
                <div className="space-y-2">
                  {selectedCoupon.membership_required && (
                    <p className="text-sm text-purple-600">• Requiere membresía premium</p>
                  )}
                  {selectedCoupon.place_id && (
                    <p className="text-sm text-blue-600">• Válido solo en locales específicos</p>
                  )}
                  {isCouponExpired(selectedCoupon.valid_until) && (
                    <p className="text-sm text-red-600">• Cupón expirado</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={() => handleEditCoupon(selectedCoupon)}>
              Editar Cupón
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Coupon Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Cupón</DialogTitle>
            <DialogDescription>
              Completa la información para crear un nuevo cupón
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Título del Cupón *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: 20% de descuento en productos para mascotas"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe los términos y condiciones del cupón..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="code">Código del Cupón *</Label>
              <div className="flex space-x-2">
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Ej: VERANO20"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRandomCode}
                >
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="discount_type">Tipo de Descuento</Label>
              <Select value={formData.discount_type} onValueChange={(value) => setFormData({ ...formData, discount_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {discountTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.discount_type === 'percentage' ? (
              <div>
                <Label htmlFor="discount_percentage">Porcentaje de Descuento *</Label>
                <Input
                  id="discount_percentage"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
                  placeholder="20"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="discount_amount">Monto de Descuento *</Label>
                <Input
                  id="discount_amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.discount_amount}
                  onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
                  placeholder="100.00"
                />
              </div>
            )}
            <div>
              <Label htmlFor="partner_name">Nombre del Partner</Label>
              <Input
                id="partner_name"
                value={formData.partner_name}
                onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                placeholder="Ej: Tienda Mascotas S.A."
              />
            </div>
            <div>
              <Label htmlFor="valid_from">Fecha de Inicio</Label>
              <Input
                id="valid_from"
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="valid_until">Fecha de Fin</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Cupón Activo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="membership_required"
                checked={formData.membership_required}
                onCheckedChange={(checked) => setFormData({ ...formData, membership_required: checked })}
              />
              <Label htmlFor="membership_required">Requiere Membresía</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creando...' : 'Crear Cupón'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cupón</DialogTitle>
            <DialogDescription>
              Modifica la información del cupón
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="md:col-span-2">
              <Label htmlFor="edit_title">Título del Cupón *</Label>
              <Input
                id="edit_title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: 20% de descuento en productos para mascotas"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="edit_description">Descripción</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe los términos y condiciones del cupón..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit_code">Código del Cupón *</Label>
              <Input
                id="edit_code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ej: VERANO20"
              />
            </div>
            <div>
              <Label htmlFor="edit_discount_type">Tipo de Descuento</Label>
              <Select value={formData.discount_type} onValueChange={(value) => setFormData({ ...formData, discount_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {discountTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.discount_type === 'percentage' ? (
              <div>
                <Label htmlFor="edit_discount_percentage">Porcentaje de Descuento *</Label>
                <Input
                  id="edit_discount_percentage"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
                  placeholder="20"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="edit_discount_amount">Monto de Descuento *</Label>
                <Input
                  id="edit_discount_amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.discount_amount}
                  onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
                  placeholder="100.00"
                />
              </div>
            )}
            <div>
              <Label htmlFor="edit_partner_name">Nombre del Partner</Label>
              <Input
                id="edit_partner_name"
                value={formData.partner_name}
                onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                placeholder="Ej: Tienda Mascotas S.A."
              />
            </div>
            <div>
              <Label htmlFor="edit_valid_from">Fecha de Inicio</Label>
              <Input
                id="edit_valid_from"
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_valid_until">Fecha de Fin</Label>
              <Input
                id="edit_valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit_is_active">Cupón Activo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_membership_required"
                checked={formData.membership_required}
                onCheckedChange={(checked) => setFormData({ ...formData, membership_required: checked })}
              />
              <Label htmlFor="edit_membership_required">Requiere Membresía</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubmit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Cupón'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}