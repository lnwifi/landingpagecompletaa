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
  Package,
  DollarSign,
  Eye,
  EyeOff,
} from 'lucide-react';
import { productsService, categoriesService } from '@/services/supabase';
import { formatDate, formatCurrency } from '@/utils/formatters';
import toast from 'react-hot-toast';

interface ProductFormData {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria_id: string;
  stock: number;
  activo: boolean;
  image_url: string;
}

export function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    nombre: '',
    descripcion: '',
    precio: 0,
    categoria_id: '',
    stock: 0,
    activo: true,
    image_url: '',
  });

  const queryClient = useQueryClient();

  // Queries
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: productsService.getAll,
    retry: 3,
  });

  // Log error if exists
  if (error) {
    console.error('Error in products query:', error);
  }

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: productsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Producto creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear producto');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      productsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      toast.success('Producto actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar producto');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar producto');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      productsService.update(id, { activo: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Estado del producto actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar estado');
    },
  });

  
  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria_id: '',
      stock: 0,
      activo: true,
      image_url: '',
    });
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.categoria_id) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      precio: parseFloat(product.precio),
      categoria_id: product.categoria_id,
      stock: product.stock || 0,
      activo: product.activo,
      image_url: product.image_url || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !formData.nombre || !formData.categoria_id) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }
    updateMutation.mutate({
      id: selectedProduct.id,
      updates: formData,
    });
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      deleteMutation.mutate(productId);
    }
  };

  const handleToggleActive = (product: any) => {
    toggleActiveMutation.mutate({
      id: product.id,
      isActive: !product.activo,
    });
  };

  
  const filteredProducts = products?.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.categoria_nombre && product.categoria_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  // Estadísticas
  const activeProducts = products?.filter(p => p.activo).length || 0;
  const totalValue = products?.reduce((sum, p) => sum + (parseFloat(p.precio) * (p.stock || 0)), 0) || 0;

  // Debug: log info
  console.log('ProductsPage - products:', products);
  console.log('ProductsPage - isLoading:', isLoading);
  console.log('ProductsPage - categories:', categories);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <div className="admin-card">
          <p className="text-sm text-gray-600">Cargando productos...</p>
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
            Gestión de Productos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra el catálogo de productos de la tienda
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Productos Activos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {activeProducts}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Valor del Inventario
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total de Productos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {products?.length || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Producto</DialogTitle>
              <DialogDescription>
                Agrega un nuevo producto al catálogo de la tienda.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProduct}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre *
                  </Label>
                  <Input
                    id="name"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
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
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
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
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="categoria_id" className="text-right">
                    Categoría *
                  </Label>
                  <select
                    id="categoria_id"
                    value={formData.categoria_id}
                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image_url" className="text-right">
                    URL Imagen
                  </Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="col-span-3"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.activo}
                    onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                  />
                  <Label htmlFor="is_active">Activo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creando...' : 'Crear Producto'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Table */}
      <div className="admin-card">
        <div className="rounded-md border overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">Producto</TableHead>
                  <TableHead className="min-w-[120px] hidden sm:table-cell">Categoría</TableHead>
                  <TableHead className="min-w-[100px]">Precio</TableHead>
                  <TableHead className="min-w-[80px]">Stock</TableHead>
                  <TableHead className="min-w-[100px]">Estado</TableHead>
                  <TableHead className="min-w-[120px] hidden md:table-cell">Fecha Creación</TableHead>
                  <TableHead className="text-right min-w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.nombre}
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = '';
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {product.nombre}
                          </p>
                          {product.descripcion && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 truncate">
                              {product.descripcion}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate sm:hidden">
                            {formatCurrency(parseFloat(product.precio))} • Stock: {product.stock}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 whitespace-nowrap">
                        {product.categoria_nombre || 'Sin categoría'}
                      </span>
                    </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium whitespace-nowrap">{formatCurrency(parseFloat(product.precio))}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      (product.stock || 0) > 10
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : (product.stock || 0) > 0
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {product.stock || 0} unidades
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        product.activo
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {product.activo ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inactivo
                          </>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm whitespace-nowrap">{formatDate(product.fecha_creacion)}</span>
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
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(product)}
                        >
                          {product.activo ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteProduct(product.id)}
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
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No se encontraron productos que coincidan con la búsqueda' : 'No hay productos registrados'}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>
              Modifica la información del producto seleccionado.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProduct}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_name" className="text-right">
                  Nombre *
                </Label>
                <Input
                  id="edit_name"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
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
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
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
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_categoria_id" className="text-right">
                  Categoría *
                </Label>
                <select
                  id="edit_categoria_id"
                  value={formData.categoria_id}
                  onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="edit_stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_image_url" className="text-right">
                  URL Imagen
                </Label>
                <Input
                  id="edit_image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="col-span-3"
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_active"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                />
                <Label htmlFor="edit_is_active">Activo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Producto'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  </div>
  );
}