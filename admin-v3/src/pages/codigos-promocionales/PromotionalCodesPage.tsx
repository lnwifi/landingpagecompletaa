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
  MoreHorizontal,
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Gift,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { promotionalCodesService } from '@/services/supabase';
import { formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

interface PromotionalCode {
  id: string;
  code: string;
  description: string;
  benefit_type: 'membership_premium' | 'discount_coupon' | 'store_credit' | 'points';
  benefit_value: number | null;
  benefit_days: number;
  max_uses: number;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface PromotionalCodeStats {
  total_codes: number;
  active_codes: number;
  used_codes: number;
  total_uses: number;
  recent_uses: number;
}

interface CodeFormData {
  description: string;
  benefit_type: 'membership_premium' | 'discount_coupon' | 'store_credit' | 'points';
  benefit_value: number;
  benefit_days: number;
  max_uses: number;
  valid_until: string;
}

export function PromotionalCodesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<PromotionalCode | null>(null);

  const [createForm, setCreateForm] = useState<CodeFormData>({
    description: '',
    benefit_type: 'membership_premium',
    benefit_value: 0,
    benefit_days: 30,
    max_uses: 1,
    valid_until: '',
  });

  const [editForm, setEditForm] = useState<CodeFormData>({
    description: '',
    benefit_type: 'membership_premium',
    benefit_value: 0,
    benefit_days: 30,
    max_uses: 1,
    valid_until: '',
  });

  const queryClient = useQueryClient();

  // Queries
  const { data: codes, isLoading } = useQuery({
    queryKey: ['promotional-codes'],
    queryFn: promotionalCodesService.getAll,
  });

  const { data: stats } = useQuery({
    queryKey: ['promotional-codes-stats'],
    queryFn: promotionalCodesService.getStats,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: promotionalCodesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-codes'] });
      queryClient.invalidateQueries({ queryKey: ['promotional-codes-stats'] });
      setIsCreateDialogOpen(false);
      resetCreateForm();
      toast.success('Código promocional creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear código promocional');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      promotionalCodesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-codes'] });
      queryClient.invalidateQueries({ queryKey: ['promotional-codes-stats'] });
      setIsEditDialogOpen(false);
      setSelectedCode(null);
      toast.success('Código promocional actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar código promocional');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: promotionalCodesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-codes'] });
      queryClient.invalidateQueries({ queryKey: ['promotional-codes-stats'] });
      setIsDeleteDialogOpen(false);
      setSelectedCode(null);
      toast.success('Código promocional eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar código promocional');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      promotionalCodesService.toggleActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotional-codes'] });
      queryClient.invalidateQueries({ queryKey: ['promotional-codes-stats'] });
      toast.success('Estado del código actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar estado del código');
    },
  });

  const resetCreateForm = () => {
    setCreateForm({
      description: '',
      benefit_type: 'membership_premium',
      benefit_value: 0,
      benefit_days: 30,
      max_uses: 1,
      valid_until: '',
    });
  };

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.description) {
      toast.error('Por favor ingresa una descripción');
      return;
    }
    createMutation.mutate(createForm);
  };

  const handleEditCode = (code: PromotionalCode) => {
    setSelectedCode(code);
    setEditForm({
      description: code.description,
      benefit_type: code.benefit_type,
      benefit_value: code.benefit_value || 0,
      benefit_days: code.benefit_days,
      max_uses: code.max_uses,
      valid_until: code.valid_until ? code.valid_until.split('T')[0] : '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCode || !editForm.description) {
      toast.error('Por favor ingresa una descripción');
      return;
    }
    updateMutation.mutate({
      id: selectedCode.id,
      updates: editForm,
    });
  };

  const handleDeleteCode = () => {
    if (!selectedCode) return;
    deleteMutation.mutate(selectedCode.id);
  };

  const getBenefitDescription = (code: PromotionalCode) => {
    switch (code.benefit_type) {
      case 'membership_premium':
        return `${code.benefit_days} días de membresía premium`;
      case 'discount_coupon':
        return `${code.benefit_value}% de descuento`;
      case 'store_credit':
        return `$${code.benefit_value} de crédito`;
      case 'points':
        return `${code.benefit_value} puntos`;
      default:
        return 'Beneficio personalizado';
    }
  };

  const getBenefitColor = (type: string) => {
    switch (type) {
      case 'membership_premium':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'discount_coupon':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'store_credit':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'points':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getBenefitTypeLabel = (type: string) => {
    switch (type) {
      case 'membership_premium':
        return 'Membresía Premium';
      case 'discount_coupon':
        return 'Cupón de Descuento';
      case 'store_credit':
        return 'Crédito en Tienda';
      case 'points':
        return 'Puntos';
      default:
        return type.replace('_', ' ').toUpperCase();
    }
  };

  const filteredCodes = codes?.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Códigos Promocionales
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestión de códigos para campañas de marketing y sorteos
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="admin-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Códigos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.total_codes}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500">
                <Gift className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Activos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.active_codes}
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
                  Usados
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.used_codes}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Usos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.total_uses}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500">
                <Gift className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Usos Recientes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.recent_uses}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="admin-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar códigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Código
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Código Promocional</DialogTitle>
                  <DialogDescription>
                    Genera un nuevo código promocional para campañas de marketing y sorteos.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCode}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Descripción *
                      </Label>
                      <Input
                        id="description"
                        value={createForm.description}
                        onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                        placeholder="Ej: Campaña de Navidad 2024"
                        className="col-span-3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="benefit_type" className="text-right">
                        Tipo de Beneficio *
                      </Label>
                      <select
                        id="benefit_type"
                        value={createForm.benefit_type}
                        onChange={(e) => setCreateForm({ ...createForm, benefit_type: e.target.value as any })}
                        className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        required
                      >
                        <option value="membership_premium">Membresía Premium</option>
                        <option value="discount_coupon">Cupón de Descuento</option>
                        <option value="store_credit">Crédito en Tienda</option>
                        <option value="points">Puntos</option>
                      </select>
                    </div>

                    {createForm.benefit_type === 'membership_premium' ? (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="benefit_days" className="text-right">
                          Días de Membresía *
                        </Label>
                        <Input
                          id="benefit_days"
                          type="number"
                          min="1"
                          value={createForm.benefit_days}
                          onChange={(e) => setCreateForm({ ...createForm, benefit_days: parseInt(e.target.value) || 30 })}
                          className="col-span-3"
                          required
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="benefit_value" className="text-right">
                          {createForm.benefit_type === 'discount_coupon' ? 'Porcentaje de Descuento' : createForm.benefit_type === 'points' ? 'Cantidad de Puntos' : 'Valor'} *
                        </Label>
                        <Input
                          id="benefit_value"
                          type="number"
                          min="0"
                          step="0.01"
                          value={createForm.benefit_value}
                          onChange={(e) => setCreateForm({ ...createForm, benefit_value: parseFloat(e.target.value) || 0 })}
                          className="col-span-3"
                          required
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="max_uses" className="text-right">
                        Máximo de Usos *
                      </Label>
                      <Input
                        id="max_uses"
                        type="number"
                        min="1"
                        value={createForm.max_uses}
                        onChange={(e) => setCreateForm({ ...createForm, max_uses: parseInt(e.target.value) || 1 })}
                        className="col-span-3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="valid_until" className="text-right">
                        Válido Hasta
                      </Label>
                      <Input
                        id="valid_until"
                        type="date"
                        value={createForm.valid_until}
                        onChange={(e) => setCreateForm({ ...createForm, valid_until: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Creando...' : 'Crear Código'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['promotional-codes'] })}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        <div className="rounded-md border overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Código</TableHead>
                  <TableHead className="min-w-[200px]">Descripción</TableHead>
                  <TableHead className="min-w-[150px]">Tipo de Beneficio</TableHead>
                  <TableHead className="min-w-[150px]">Valor</TableHead>
                  <TableHead className="min-w-[100px]">Usos</TableHead>
                  <TableHead className="min-w-[120px]">Válido Hasta</TableHead>
                  <TableHead className="min-w-[100px]">Estado</TableHead>
                  <TableHead className="text-right min-w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                        Cargando...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'No se encontraron códigos promocionales que coincidan con la búsqueda' : 'No hay códigos promocionales registrados'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-medium">
                        <span className="font-mono text-sm">{code.code}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{code.description}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBenefitColor(code.benefit_type)}`}>
                          {getBenefitTypeLabel(code.benefit_type)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{getBenefitDescription(code)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{code.current_uses} / {code.max_uses}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {code.valid_until ? formatDate(code.valid_until) : 'Sin límite'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={code.is_active}
                            onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: code.id, isActive: checked })}
                            disabled={toggleActiveMutation.isPending}
                          />
                          <span className="text-sm">{code.is_active ? 'Activo' : 'Inactivo'}</span>
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
                              onClick={() => handleEditCode(code)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCode(code);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Código Promocional</DialogTitle>
            <DialogDescription>
              Modifica los detalles del código promocional.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCode}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_description" className="text-right">
                  Descripción *
                </Label>
                <Input
                  id="edit_description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_benefit_type" className="text-right">
                  Tipo de Beneficio *
                </Label>
                <select
                  id="edit_benefit_type"
                  value={editForm.benefit_type}
                  onChange={(e) => setEditForm({ ...editForm, benefit_type: e.target.value as any })}
                  className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                >
                  <option value="membership_premium">Membresía Premium</option>
                  <option value="discount_coupon">Cupón de Descuento</option>
                  <option value="store_credit">Crédito en Tienda</option>
                  <option value="points">Puntos</option>
                </select>
              </div>

              {editForm.benefit_type === 'membership_premium' ? (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_benefit_days" className="text-right">
                    Días de Membresía *
                  </Label>
                  <Input
                    id="edit_benefit_days"
                    type="number"
                    min="1"
                    value={editForm.benefit_days}
                    onChange={(e) => setEditForm({ ...editForm, benefit_days: parseInt(e.target.value) || 30 })}
                    className="col-span-3"
                    required
                  />
                </div>
              ) : (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_benefit_value" className="text-right">
                    {editForm.benefit_type === 'discount_coupon' ? 'Porcentaje de Descuento' : editForm.benefit_type === 'points' ? 'Cantidad de Puntos' : 'Valor'} *
                  </Label>
                  <Input
                    id="edit_benefit_value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.benefit_value}
                    onChange={(e) => setEditForm({ ...editForm, benefit_value: parseFloat(e.target.value) || 0 })}
                    className="col-span-3"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_max_uses" className="text-right">
                  Máximo de Usos *
                </Label>
                <Input
                  id="edit_max_uses"
                  type="number"
                  min="1"
                  value={editForm.max_uses}
                  onChange={(e) => setEditForm({ ...editForm, max_uses: parseInt(e.target.value) || 1 })}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_valid_until" className="text-right">
                  Válido Hasta
                </Label>
                <Input
                  id="edit_valid_until"
                  type="date"
                  value={editForm.valid_until}
                  onChange={(e) => setEditForm({ ...editForm, valid_until: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Actualizando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Código Permanentemente</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar permanentemente el código "{selectedCode?.code}"?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCode}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar Permanentemente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
