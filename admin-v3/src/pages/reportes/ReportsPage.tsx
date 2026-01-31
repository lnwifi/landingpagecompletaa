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
  MoreHorizontal,
  Search,
  Eye,
  Flag,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Ban,
  ExternalLink,
  User,
  Dog,
  MessageCircle,
  Trash2,
  MapPin,
} from 'lucide-react';
import { reportsService } from '@/services/supabase';
import { formatDate } from '@/utils/formatters';
import { Report, ReportStatus, ReportReason, ReportType } from '@/types';
import toast from 'react-hot-toast';

const reportTypeConfig = {
  aviso: { label: 'Aviso', icon: MessageCircle, color: 'text-purple-500' },
  petomatch: { label: 'Mascota', icon: Dog, color: 'text-orange-500' },
  user: { label: 'Usuario', icon: User, color: 'text-blue-500' },
};

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', icon: Clock },
  reviewed: { label: 'Revisado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', icon: Eye },
  resolved: { label: 'Resuelto', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', icon: CheckCircle },
  dismissed: { label: 'Descartado', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300', icon: XCircle },
};

const reasonLabels: Record<ReportReason, string> = {
  spam: 'Spam o contenido repetitivo',
  inappropriate: 'Contenido inapropiado',
  fake: 'Información falsa',
  harassment: 'Acoso o bullying',
  scam: 'Estafa o fraude',
  other: 'Otro motivo',
};

export function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isContentActionDialogOpen, setIsContentActionDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ReportStatus>('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all');

  const queryClient = useQueryClient();

  // Queries
  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: reportsService.getAll,
    retry: 3,
  });

  const { data: stats } = useQuery({
    queryKey: ['reports-stats'],
    queryFn: reportsService.getStats,
    retry: 3,
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: ReportStatus; notes?: string }) =>
      reportsService.updateStatus(id, status, notes, 'admin-user-id'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports-stats'] });
      setIsStatusDialogOpen(false);
      setSelectedReport(null);
      setAdminNotes('');
      toast.success('Estado del reporte actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar estado');
    },
  });

  const disableContentMutation = useMutation({
    mutationFn: ({ reportType, reportedId }: { reportType: ReportType; reportedId: string }) =>
      reportsService.disableReportedContent(reportType, reportedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setIsContentActionDialogOpen(false);
      toast.success('Contenido desactivado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al desactivar contenido');
    },
  });

  const enableContentMutation = useMutation({
    mutationFn: ({ reportType, reportedId }: { reportType: ReportType; reportedId: string }) =>
      reportsService.enableReportedContent(reportType, reportedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setIsContentActionDialogOpen(false);
      toast.success('Contenido activado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al activar contenido');
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: ({ reportType, reportedId }: { reportType: ReportType; reportedId: string }) =>
      reportsService.deleteReportedContent(reportType, reportedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setIsContentActionDialogOpen(false);
      toast.success('Contenido eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar contenido');
    },
  });

  const filteredReports = reports?.filter(report => {
    const matchesSearch =
      report.reporter?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.report_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setIsDetailsDialogOpen(true);
  };

  const handleUpdateStatus = (report: Report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setAdminNotes(report.notes || '');
    setIsStatusDialogOpen(true);
  };

  const handleStatusUpdate = () => {
    if (!selectedReport) return;

    updateStatusMutation.mutate({
      id: selectedReport.id,
      status: newStatus,
      notes: adminNotes,
    });
  };

  const handleDisableContent = () => {
    if (!selectedReport) return;

    disableContentMutation.mutate({
      reportType: selectedReport.report_type,
      reportedId: selectedReport.reported_id,
    });
  };

  const handleEnableContent = () => {
    if (!selectedReport) return;

    enableContentMutation.mutate({
      reportType: selectedReport.report_type,
      reportedId: selectedReport.reported_id,
    });
  };

  const handleDeleteContent = () => {
    if (!selectedReport) return;

    deleteContentMutation.mutate({
      reportType: selectedReport.report_type,
      reportedId: selectedReport.reported_id,
    });
  };

  const handleContentAction = (report: Report) => {
    setSelectedReport(report);
    setIsContentActionDialogOpen(true);
  };

  const getReportTypeIcon = (type: ReportType) => {
    const IconComponent = reportTypeConfig[type]?.icon || Flag;
    return IconComponent;
  };

  const getStatusIcon = (status: ReportStatus) => {
    const IconComponent = statusConfig[status]?.icon || Clock;
    return IconComponent;
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
      <div className="text-center py-12">
        <p className="text-red-500">Error cargando los reportes: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Reportes de Contenido
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra los reportes de contenido inapropiado o violaciones de las normas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total de Reportes
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.total || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500">
              <Flag className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pendientes
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.pending || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Resueltos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.resolved || 0}
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
                Descartados
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.dismissed || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gray-500">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar reportes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'all')}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="reviewed">Revisados</option>
            <option value="resolved">Resueltos</option>
            <option value="dismissed">Descartados</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ReportType | 'all')}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">Todos los tipos</option>
            <option value="aviso">Avisos</option>
            <option value="petomatch">Mascotas</option>
            <option value="user">Usuarios</option>
          </select>
        </div>

        <div className="text-sm text-gray-500">
          Mostrando {filteredReports.length} de {reports?.length || 0} reportes
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Razón</TableHead>
                <TableHead>Reportado por</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No se encontraron reportes
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => {
                  const TypeIcon = getReportTypeIcon(report.report_type);
                  const StatusIcon = getStatusIcon(report.status);
                  const typeConfig = reportTypeConfig[report.report_type];
                  const statusConf = statusConfig[report.status];

                  return (
                    <TableRow
                      key={report.id}
                      className={report.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className={`p-2 rounded-lg ${typeConfig?.color || 'text-gray-500'}`}>
                            <TypeIcon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">
                            {typeConfig?.label}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{reasonLabels[report.reason]}</p>
                          {report.description && (
                            <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                              {report.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{report.reporter?.full_name || 'Usuario'}</p>
                          <p className="text-xs text-gray-500">{report.reporter?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{formatDate(report.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="w-4 h-4 text-gray-500" />
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            statusConf?.color || 'bg-gray-100 text-gray-800'
                          }`}>
                            {statusConf?.label}
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
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(report)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(report)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Actualizar estado
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleContentAction(report)}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Gestionar contenido
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Reporte</DialogTitle>
            <DialogDescription>
              Información completa del reporte de contenido
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              {/* Report Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${
                    reportTypeConfig[selectedReport.report_type]?.color || 'text-gray-500'
                  }`}>
                    {React.createElement(
                      getReportTypeIcon(selectedReport.report_type),
                      { className: "w-6 h-6" }
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Reporte de {reportTypeConfig[selectedReport.report_type]?.label}
                    </h3>
                    <p className="text-sm text-gray-500">ID: {selectedReport.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Razón</h4>
                    <p className="text-sm">{reasonLabels[selectedReport.reason]}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Estado</h4>
                    <div className="flex items-center space-x-2">
                      {React.createElement(getStatusIcon(selectedReport.status), { className: "w-4 h-4" })}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        statusConfig[selectedReport.status]?.color
                      }`}>
                        {statusConfig[selectedReport.status]?.label}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedReport.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Descripción</h4>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      {selectedReport.description}
                    </p>
                  </div>
                )}

                {selectedReport.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Notas del administrador</h4>
                    <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      {selectedReport.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Reporter Info */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Reportado por</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Nombre</h4>
                    <p className="text-sm">{selectedReport.reporter?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                    <p className="text-sm">{selectedReport.reporter?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Reported Content */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Contenido Reportado</h3>
                {selectedReport.reported_content?.aviso && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-5 h-5 text-purple-500" />
                        <span className="font-medium">Aviso de Red de Ayuda</span>
                      </div>
                      <a
                        href={`https://petoclub.com.ar/red-de-ayuda?avisoId=${selectedReport.reported_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Ver en app
                      </a>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Nombre:</span>
                        <p className="font-medium">{selectedReport.reported_content.aviso.nombre || 'Sin nombre'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Tipo:</span>
                        <p className="font-medium capitalize">{selectedReport.reported_content.aviso.tipo_aviso}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Especie:</span>
                        <p className="font-medium">{selectedReport.reported_content.aviso.especie || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Estado:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                          selectedReport.reported_content.aviso.estado === 'activo'
                            ? 'bg-green-100 text-green-800'
                            : selectedReport.reported_content.aviso.estado === 'resuelto'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedReport.reported_content.aviso.estado}
                        </span>
                      </div>
                    </div>
                    {selectedReport.reported_content.aviso.descripcion && (
                      <div>
                        <span className="text-gray-500 text-sm">Descripción:</span>
                        <p className="text-sm mt-1 line-clamp-3">{selectedReport.reported_content.aviso.descripcion}</p>
                      </div>
                    )}
                    {selectedReport.reported_content.aviso.ubicacion && (
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-gray-500">Ubicación:</span>
                        <span className="ml-1">{selectedReport.reported_content.aviso.ubicacion}</span>
                      </div>
                    )}
                    {selectedReport.reported_content.aviso.imagen_url && (
                      <div>
                        <span className="text-gray-500 text-sm">Imagen:</span>
                        <img
                          src={selectedReport.reported_content.aviso.imagen_url}
                          alt={selectedReport.reported_content.aviso.nombre}
                          className="mt-2 w-full max-w-xs rounded-lg object-cover h-40"
                        />
                      </div>
                    )}
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      ID: {selectedReport.reported_id}
                    </div>
                  </div>
                )}
                {selectedReport.reported_content?.pet && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Dog className="w-5 h-5 text-orange-500" />
                        <span className="font-medium">Mascota (PetoMatch)</span>
                      </div>
                      <a
                        href={`https://petoclub.com.ar/match?petId=${selectedReport.reported_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Ver en app
                      </a>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Nombre:</span>
                        <p className="font-medium">{selectedReport.reported_content.pet.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Especie:</span>
                        <p className="font-medium">{selectedReport.reported_content.pet.species}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Raza:</span>
                        <p className="font-medium">{selectedReport.reported_content.pet.breed || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Edad:</span>
                        <p className="font-medium">{selectedReport.reported_content.pet.age || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 text-sm">Estado:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedReport.reported_content.pet.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedReport.reported_content.pet.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                      {selectedReport.reported_content.pet.suspended_by_admin && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Suspendido
                        </span>
                      )}
                    </div>
                    {selectedReport.reported_content.pet.description && (
                      <div>
                        <span className="text-gray-500 text-sm">Descripción:</span>
                        <p className="text-sm mt-1 line-clamp-3">{selectedReport.reported_content.pet.description}</p>
                      </div>
                    )}
                    {(selectedReport.reported_content.pet.image_url || selectedReport.reported_content.pet.images?.length > 0) && (
                      <div>
                        <span className="text-gray-500 text-sm">Imagen:</span>
                        <img
                          src={selectedReport.reported_content.pet.image_url || selectedReport.reported_content.pet.images?.[0]}
                          alt={selectedReport.reported_content.pet.name}
                          className="mt-2 w-full max-w-xs rounded-lg object-cover h-40"
                        />
                      </div>
                    )}
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      ID: {selectedReport.reported_id}
                    </div>
                  </div>
                )}
                {selectedReport.reported_content?.user && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Usuario</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Nombre:</span>
                        <p className="font-medium">{selectedReport.reported_content.user.full_name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <p className="font-medium">{selectedReport.reported_content.user.email || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Admin:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          selectedReport.reported_content.user.is_admin
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedReport.reported_content.user.is_admin ? 'Sí' : 'No'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Estado:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          selectedReport.reported_content.user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedReport.reported_content.user.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                    {selectedReport.reported_content.user.suspended && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-2 text-sm">
                        <span className="font-medium text-orange-800 dark:text-orange-200">Usuario suspendido</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      ID: {selectedReport.reported_id}
                    </div>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Información de tiempo</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Creado:</p>
                    <p>{formatDate(selectedReport.created_at)}</p>
                  </div>
                  {selectedReport.reviewed_at && (
                    <div>
                      <p className="text-gray-500">Revisado:</p>
                      <p>{formatDate(selectedReport.reviewed_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar Estado del Reporte</DialogTitle>
            <DialogDescription>
              Cambia el estado del reporte y agrega notas administrativas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Estado Actual</Label>
              <div className="flex items-center space-x-2">
                {selectedReport && React.createElement(getStatusIcon(selectedReport.status), { className: "w-4 h-4" })}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  selectedReport && statusConfig[selectedReport.status]?.color
                }`}>
                  {selectedReport && statusConfig[selectedReport.status]?.label}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-status">Nuevo Estado</Label>
              <select
                id="new-status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {Object.entries(statusConfig).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-notes">Notas del administrador (opcional)</Label>
              <Textarea
                id="admin-notes"
                placeholder="Agrega notas sobre la resolución de este reporte..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleStatusUpdate} disabled={updateStatusMutation.isPending}>
              {updateStatusMutation.isPending ? 'Actualizando...' : 'Actualizar Estado'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Action Dialog */}
      <Dialog open={isContentActionDialogOpen} onOpenChange={setIsContentActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestionar Contenido Reportado</DialogTitle>
            <DialogDescription>
              {selectedReport && (
                <>Acciones sobre el {reportTypeConfig[selectedReport.report_type]?.label} reportado</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Acción irreversible
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Estas acciones afectarán directamente el contenido reportado. Asegúrate de haber revisado el reporte antes de proceder.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleDisableContent}
                disabled={disableContentMutation.isPending}
                variant="outline"
                className="w-full justify-start"
              >
                <Ban className="mr-2 h-4 w-4" />
                Desactivar contenido
                <span className="ml-auto text-xs text-gray-500">El contenido no será visible</span>
              </Button>

              <Button
                onClick={handleEnableContent}
                disabled={enableContentMutation.isPending}
                variant="outline"
                className="w-full justify-start"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Reactivar contenido
                <span className="ml-auto text-xs text-gray-500">El contenido será visible nuevamente</span>
              </Button>

              <Button
                onClick={handleDeleteContent}
                disabled={deleteContentMutation.isPending}
                variant="destructive"
                className="w-full justify-start"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar contenido
                <span className="ml-auto text-xs">{selectedReport?.report_type === 'user' ? 'Suspender usuario' : 'Eliminar permanentemente'}</span>
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContentActionDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Import Calendar icon that was used
import { Calendar } from 'lucide-react';
