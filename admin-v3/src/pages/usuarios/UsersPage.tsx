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
  Shield,
  ShieldOff,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { profilesService } from '@/services/supabase';
import { Profile, CreateUserData, UpdateUserData } from '@/types';
import { formatDate, getStatusColor, getStatusText } from '@/utils/formatters';
import toast from 'react-hot-toast';

export function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    full_name: '',
    is_admin: false,
  });

  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: profilesService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: profilesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Usuario creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear usuario');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateUserData }) =>
      profilesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast.success('Usuario actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar usuario');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: profilesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar usuario');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      profilesService.update(id, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Estado del usuario actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar estado');
    },
  });

  const toggleAdminMutation = useMutation({
    mutationFn: ({ id, isAdmin }: { id: string; isAdmin: boolean }) =>
      profilesService.update(id, { is_admin: isAdmin }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Permisos de administrador actualizados');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar permisos');
    },
  });

  const filteredUsers = users?.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      is_admin: false,
    });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.full_name) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEditUser = (user: Profile) => {
    setSelectedUser(user);
    setFormData({
      email: user.email || '',
      full_name: user.full_name || '',
      is_admin: user.is_admin || false,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !formData.email || !formData.full_name) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }
    updateMutation.mutate({
      id: selectedUser.id,
      updates: formData,
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      deleteMutation.mutate(userId);
    }
  };

  const handleToggleActive = (user: Profile) => {
    toggleActiveMutation.mutate({
      id: user.id,
      isActive: !user.is_active,
    });
  };

  const handleToggleAdmin = (user: Profile) => {
    toggleAdminMutation.mutate({
      id: user.id,
      isAdmin: !user.is_admin,
    });
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
      <div className="admin-card">
        <div className="flex items-center text-red-600">
          <span>Error al cargar los usuarios</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra los usuarios registrados en la plataforma
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] max-w-[95vw]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Crea un nuevo usuario en el sistema. El usuario recibirá un correo para establecer su contraseña.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="full_name">
                    Nombre
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_admin"
                      checked={formData.is_admin}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_admin: checked })}
                    />
                    <Label htmlFor="is_admin" className="text-sm font-medium">
                      Tiene permisos de administrador
                    </Label>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto">
                  {createMutation.isPending ? 'Creando...' : 'Crear Usuario'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card">
        <div className="rounded-md border overflow-x-auto">
          <div className="min-w-[640px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Usuario</TableHead>
                  <TableHead className="min-w-[200px] hidden sm:table-cell">Email</TableHead>
                  <TableHead className="min-w-[120px]">Rol</TableHead>
                  <TableHead className="min-w-[100px]">Estado</TableHead>
                  <TableHead className="min-w-[120px] hidden md:table-cell">Fecha Registro</TableHead>
                  <TableHead className="min-w-[120px] hidden lg:table-cell">Última Actividad</TableHead>
                  <TableHead className="text-right min-w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-sm font-medium">
                            {user.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{user.full_name || 'Sin nombre'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate sm:hidden">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="truncate block">{user.email}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        user.is_admin
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {user.is_admin ? 'Admin' : 'Usuario'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        user.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm">{formatDate(user.created_at)}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm">{user.last_seen ? formatDate(user.last_seen) : 'Nunca'}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(user)}
                          >
                            {user.is_active ? (
                              <>
                                <ToggleLeft className="mr-2 h-4 w-4" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <ToggleRight className="mr-2 h-4 w-4" />
                                Activar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleAdmin(user)}
                          >
                            {user.is_admin ? (
                              <>
                                <ShieldOff className="mr-2 h-4 w-4" />
                                Quitar Admin
                              </>
                            ) : (
                              <>
                                <Shield className="mr-2 h-4 w-4" />
                                Hacer Admin
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user.id)}
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
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 px-4">
              {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios registrados'}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario seleccionado.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_email">
                  Email
                </Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_full_name">
                  Nombre
                </Label>
                <Input
                  id="edit_full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit_is_admin"
                    checked={formData.is_admin}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_admin: checked })}
                  />
                  <Label htmlFor="edit_is_admin" className="text-sm font-medium">
                    Tiene permisos de administrador
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="w-full sm:w-auto">
                {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Usuario'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}