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
  Eye,
  Package,
  ShoppingCart,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { ordersService } from '@/services/supabase';
import { formatDate, formatCurrency, getStatusColor } from '@/utils/formatters';
import toast from 'react-hot-toast';

const orderStatuses = [
  { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { value: 'pagado', label: 'Pagado', color: 'blue' },
  { value: 'enviado', label: 'Enviado', color: 'purple' },
  { value: 'entregado', label: 'Entregado', color: 'green' },
  { value: 'cancelado', label: 'Cancelado', color: 'red' },
];

export function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const queryClient = useQueryClient();

  // Queries
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersService.getAll,
  });

  // Mutation para actualizar estado
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setStatusUpdateDialogOpen(false);
      setNewStatus('');
      toast.success('Estado del pedido actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar estado del pedido');
    },
  });

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  const handleUpdateStatus = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusUpdateDialogOpen(true);
  };

  const handleStatusUpdate = () => {
    if (!selectedOrder || !newStatus) {
      toast.error('Por favor selecciona un estado');
      return;
    }
    updateStatusMutation.mutate({
      id: selectedOrder.id,
      status: newStatus,
    });
  };

  const filteredOrders = orders?.filter(order =>
    order.clientes_tienda?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${order.clientes_tienda?.nombre} ${order.clientes_tienda?.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Estadísticas por estado
  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.estado === 'pendiente').length || 0,
    paid: orders?.filter(o => o.estado_pago === 'pagado').length || 0,
    shipped: orders?.filter(o => o.estado === 'enviado').length || 0,
    delivered: orders?.filter(o => o.estado === 'entregado').length || 0,
    cancelled: orders?.filter(o => o.estado === 'cancelado').length || 0,
  };

  const totalRevenue = orders
    ?.filter(o => o.estado === 'entregado')
    .reduce((sum, order) => sum + (order.total || 0), 0) || 0;

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
            Gestión de Pedidos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra los pedidos de la tienda online
          </p>
        </div>
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
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
          </div>
        </div>
        <div className="admin-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.paid}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pagados</p>
          </div>
        </div>
        <div className="admin-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Enviados</p>
          </div>
        </div>
        <div className="admin-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Entregados</p>
          </div>
        </div>
        <div className="admin-card">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cancelados</p>
          </div>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="admin-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Ingresos Totales (Entregados)
            </p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-green-500">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pedidos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-64"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card">
        <div className="rounded-md border overflow-x-auto">
          <div className="min-w-[700px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Pedido</TableHead>
                  <TableHead className="min-w-[200px]">Cliente</TableHead>
                  <TableHead className="min-w-[100px]">Total</TableHead>
                  <TableHead className="min-w-[120px]">Estado</TableHead>
                  <TableHead className="min-w-[120px] hidden sm:table-cell">Fecha</TableHead>
                  <TableHead className="text-right min-w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm">#{order.id.slice(-8)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {`${order.clientes_tienda?.nombre || ''} ${order.clientes_tienda?.apellido || ''}`.trim() || 'Cliente'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {order.clientes_tienda?.email || 'Email no disponible'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate sm:hidden">
                          {formatCurrency(order.total)} • {order.estado_pedido}
                        </p>
                      </div>
                    </TableCell>
                  <TableCell>
                    <span className="font-semibold">{formatCurrency(order.total)}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.estado)}`}>
                      {order.estado === 'pendiente' && <Clock className="w-3 h-3 mr-1" />}
                      {order.estado === 'pagado' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {order.estado === 'enviado' && <Truck className="w-3 h-3 mr-1" />}
                      {order.estado === 'entregado' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {order.estado === 'cancelado' && <XCircle className="w-3 h-3 mr-1" />}
                      {orderStatuses.find(s => s.value === order.estado)?.label || order.estado}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(order.fecha_pedido)}</TableCell>
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
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(order)}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Actualizar Estado
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No se encontraron pedidos que coincidan con la búsqueda' : 'No hay pedidos registrados'}
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido</DialogTitle>
            <DialogDescription>
              Información completa del pedido #{selectedOrder?.id?.slice(-8)}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Información del Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{`${selectedOrder.clientes_tienda?.nombre || ''} ${selectedOrder.clientes_tienda?.apellido || ''}`.trim() || 'Cliente'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedOrder.clientes_tienda?.email}</span>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Información del Pedido</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Fecha del Pedido</p>
                    <p className="font-medium">{formatDate(selectedOrder.fecha_pedido)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.estado)}`}>
                      {orderStatuses.find(s => s.value === selectedOrder.estado)?.label}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-semibold">{formatCurrency(selectedOrder.total)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dirección de Envío</p>
                    <p className="font-medium">{selectedOrder.direccion_envio ? JSON.stringify(selectedOrder.direccion_envio) : 'No disponible'}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Productos del Pedido</h3>
                <div className="border rounded-lg p-4">
                  {/* Aquí se mostrarían los items del pedido si los tuviéramos */}
                  <p className="text-gray-500 text-center">Los detalles de los productos se cargarán aquí...</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={() => {
              setIsDetailDialogOpen(false);
              handleUpdateStatus(selectedOrder);
            }}>
              Actualizar Estado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateDialogOpen} onOpenChange={setStatusUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Actualizar Estado del Pedido</DialogTitle>
            <DialogDescription>
              Cambia el estado del pedido #{selectedOrder?.id?.slice(-8)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Estado Actual</Label>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder?.estado)}`}>
                {orderStatuses.find(s => s.value === selectedOrder?.estado)?.label}
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
                {orderStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusUpdateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleStatusUpdate} disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending ? 'Actualizando...' : 'Actualizar Estado'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
  );
}