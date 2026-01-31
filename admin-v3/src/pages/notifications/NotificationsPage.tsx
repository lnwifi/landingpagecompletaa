import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Mail,
  Smartphone,
  Globe,
  Target,
  Megaphone,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import toast from 'react-hot-toast';
import { notificationsService } from '@/services/supabase';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotional';
  channel: 'email' | 'push' | 'sms' | 'in_app';
  target_audience: 'all' | 'users' | 'premium_users' | 'specific';
  scheduled_for?: string;
  sent_at?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  recipient_count?: number;
  open_count?: number;
  click_count?: number;
  created_at: string;
  updated_at: string;
  specific_users?: string[];
}

interface NotificationFormData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotional';
  channel: 'email' | 'push' | 'sms' | 'in_app';
  target_audience: 'all' | 'users' | 'premium_users' | 'specific';
  scheduled_for?: string;
  specific_users?: string[];
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    message: '',
    type: 'info',
    channel: 'in_app',
    target_audience: 'all',
    scheduled_for: '',
    specific_users: []
  });

  const statusOptions = [
    { value: 'all', label: 'Todos', color: 'bg-gray-100 text-gray-800' },
    { value: 'draft', label: 'Borrador', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'scheduled', label: 'Programada', color: 'bg-blue-100 text-blue-800' },
    { value: 'sending', label: 'Enviando', color: 'bg-orange-100 text-orange-800' },
    { value: 'sent', label: 'Enviada', color: 'bg-green-100 text-green-800' },
    { value: 'failed', label: 'Fallida', color: 'bg-red-100 text-red-800' }
  ];

  const typeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'info', label: 'Informativa', color: 'bg-blue-100 text-blue-800' },
    { value: 'success', label: 'Éxito', color: 'bg-green-100 text-green-800' },
    { value: 'warning', label: 'Advertencia', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'error', label: 'Error', color: 'bg-red-100 text-red-800' },
    { value: 'promotional', label: 'Promocional', color: 'bg-purple-100 text-purple-800' }
  ];

  const channelOptions = [
    { value: 'all', label: 'Todos los canales' },
    { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { value: 'push', label: 'Push', icon: <Smartphone className="w-4 h-4" /> },
    { value: 'sms', label: 'SMS', icon: <Globe className="w-4 h-4" /> },
    { value: 'in_app', label: 'En App', icon: <Bell className="w-4 h-4" /> }
  ];

  const audienceOptions = [
    { value: 'all', label: 'Todos los usuarios' },
    { value: 'users', label: 'Usuarios registrados' },
    { value: 'premium_users', label: 'Usuarios premium' },
    { value: 'specific', label: 'Usuarios específicos' }
  ];

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [notifications, searchTerm, statusFilter, typeFilter, channelFilter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsService.getNotifications();
      setNotifications(data);
      setFilteredNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Error al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = notifications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(notification => notification.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    // Channel filter
    if (channelFilter !== 'all') {
      filtered = filtered.filter(notification => notification.channel === channelFilter);
    }

    setFilteredNotifications(filtered);
  };

  const handleCreateNotification = async () => {
    try {
      const newNotification = await notificationsService.createNotification({
        title: formData.title,
        content: formData.message,
        type: formData.type,
        channel: formData.channel,
        target_audience: formData.target_audience,
        scheduled_for: formData.scheduled_for || null,
        specific_users: formData.specific_users || []
      });

      setNotifications(prev => [newNotification, ...prev]);
      toast.success('Notificación creada exitosamente');
      setShowCreateDialog(false);
      resetFormData();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Error al crear la notificación');
    }
  };

  const handleSendNotification = async () => {
    if (!selectedNotification) return;

    try {
      toast.loading('Enviando notificación...');

      const sendResult = await notificationsService.sendNotification(selectedNotification.id);

      if (sendResult.success) {
        // Reload notifications to get updated data
        await loadNotifications();
        toast.dismiss();
        toast.success(`Notificación enviada exitosamente a ${sendResult.recipientCount} destinatarios`);
      } else {
        toast.dismiss();
        toast.error(`Error al enviar la notificación: ${sendResult.message}`);
      }

      setShowSendDialog(false);
      setSelectedNotification(null);
    } catch (error) {
      toast.dismiss();
      console.error('Error sending notification:', error);
      toast.error('Error al enviar la notificación');
    }
  };

  const handleUpdateNotification = async () => {
    if (!selectedNotification) return;

    try {
      const updatedNotification = await notificationsService.updateNotification(selectedNotification.id, {
        title: formData.title,
        content: formData.message,
        type: formData.type,
        channel: formData.channel,
        target_audience: formData.target_audience,
        scheduled_for: formData.scheduled_for || null,
        updated_at: new Date().toISOString()
      });

      setNotifications(prev => prev.map(notification =>
        notification.id === selectedNotification.id ? updatedNotification : notification
      ));

      toast.success('Notificación actualizada exitosamente');
      setShowEditDialog(false);
      setSelectedNotification(null);
      resetFormData();
    } catch (error) {
      console.error('Error updating notification:', error);
      toast.error('Error al actualizar la notificación');
    }
  };

  const handleDeleteNotification = async () => {
    if (!selectedNotification) return;

    try {
      await notificationsService.deleteNotification(selectedNotification.id);
      setNotifications(prev => prev.filter(notification => notification.id !== selectedNotification.id));
      toast.success('Notificación eliminada exitosamente');
      setShowDeleteDialog(false);
      setSelectedNotification(null);
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Error al eliminar la notificación');
    }
  };

  const resetFormData = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      channel: 'in_app',
      target_audience: 'all',
      scheduled_for: '',
      specific_users: []
    });
  };

  const openEditDialog = (notification: Notification) => {
    setSelectedNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.content,
      type: notification.type,
      channel: notification.channel,
      target_audience: notification.target_audience,
      scheduled_for: notification.scheduled_for || '',
      specific_users: []
    });
    setShowEditDialog(true);
  };

  const openViewDialog = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowViewDialog(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'promotional': return <Megaphone className="w-4 h-4 text-purple-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4 text-gray-500" />;
      case 'push': return <Smartphone className="w-4 h-4 text-gray-500" />;
      case 'sms': return <Globe className="w-4 h-4 text-gray-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sending': return 'bg-orange-100 text-orange-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'promotional': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateOpenRate = (notification: Notification) => {
    if (!notification.recipient_count || !notification.open_count) return 0;
    return Math.round((notification.open_count / notification.recipient_count) * 100);
  };

  const calculateClickRate = (notification: Notification) => {
    if (!notification.open_count || !notification.click_count) return 0;
    return Math.round((notification.click_count / notification.open_count) * 100);
  };

  const getStats = () => {
    const total = notifications.length;
    const sent = notifications.filter(n => n.status === 'sent').length;
    const scheduled = notifications.filter(n => n.status === 'scheduled').length;
    const draft = notifications.filter(n => n.status === 'draft').length;
    const failed = notifications.filter(n => n.status === 'failed').length;

    return { total, sent, scheduled, draft, failed };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-600 mt-2">Gestiona las notificaciones del sistema</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Notificación
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Enviadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Programadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Borradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Fallidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Buscar notificaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-white"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-white"
        >
          {typeOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-white"
        >
          {channelOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Notifications List */}
      <div className="grid gap-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron notificaciones</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(notification.type)}
                      <h3 className="text-xl font-semibold">{notification.title}</h3>
                      <Badge className={getStatusColor(notification.status)}>
                        {statusOptions.find(s => s.value === notification.status)?.label}
                      </Badge>
                      <Badge className={getTypeColor(notification.type)}>
                        {typeOptions.find(t => t.value === notification.type)?.label}
                      </Badge>
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-2">{notification.content}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {getChannelIcon(notification.channel)}
                        <span>
                          Canal: {channelOptions.find(c => c.value === notification.channel)?.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Target className="w-4 h-4" />
                        <span>
                          Audiencia: {audienceOptions.find(a => a.value === notification.target_audience)?.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{notification.recipient_count || 0} destinatarios</span>
                      </div>
                    </div>

                    {notification.status === 'sent' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-lg font-semibold text-blue-600">
                            {calculateOpenRate(notification)}%
                          </div>
                          <div className="text-xs text-gray-600">Tasa Apertura</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-lg font-semibold text-green-600">
                            {calculateClickRate(notification)}%
                          </div>
                          <div className="text-xs text-gray-600">Tasa Clic</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-lg font-semibold text-purple-600">
                            {notification.open_count || 0}
                          </div>
                          <div className="text-xs text-gray-600">Aperturas</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-lg font-semibold text-orange-600">
                            {notification.click_count || 0}
                          </div>
                          <div className="text-xs text-gray-600">Clics</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Creada: {formatDateTime(notification.created_at)}
                      </div>
                      {notification.scheduled_for && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Programada: {formatDateTime(notification.scheduled_for)}
                        </div>
                      )}
                      {notification.sent_at && (
                        <div className="flex items-center gap-1">
                          <Send className="w-3 h-3" />
                          Enviada: {formatDateTime(notification.sent_at)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openViewDialog(notification)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(notification)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    {notification.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedNotification(notification);
                          setShowSendDialog(true);
                        }}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedNotification(notification);
                        setShowDeleteDialog(true);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          setSelectedNotification(null);
          resetFormData();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {showCreateDialog ? 'Nueva Notificación' : 'Editar Notificación'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Título *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título de la notificación"
                />
              </div>

              <div>
                <Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Informativa</SelectItem>
                    <SelectItem value="success">Éxito</SelectItem>
                    <SelectItem value="warning">Advertencia</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="promotional">Promocional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Mensaje *</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Contenido de la notificación"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Canal</Label>
                <Select value={formData.channel} onValueChange={(value: any) => setFormData(prev => ({ ...prev, channel: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="in_app">En App</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Audiencia</Label>
                <Select value={formData.target_audience} onValueChange={(value: any) => setFormData(prev => ({ ...prev, target_audience: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los usuarios</SelectItem>
                    <SelectItem value="users">Usuarios registrados</SelectItem>
                    <SelectItem value="premium_users">Usuarios premium</SelectItem>
                    <SelectItem value="specific">Usuarios específicos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Programar para (opcional)</Label>
              <Input
                type="datetime-local"
                value={formData.scheduled_for?.slice(0, 16)}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_for: e.target.value ? e.target.value + ':00Z' : '' }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Deja vacío para enviar inmediatamente
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setShowEditDialog(false);
                setSelectedNotification(null);
                resetFormData();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={showCreateDialog ? handleCreateNotification : handleUpdateNotification}
              disabled={!formData.title || !formData.message}
            >
              {showCreateDialog ? 'Crear Notificación' : 'Actualizar Notificación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Detalles de la Notificación
            </DialogTitle>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <p className="text-sm text-gray-600 mt-1">{selectedNotification.title}</p>
              </div>

              <div>
                <Label>Mensaje</Label>
                <p className="text-sm text-gray-600 mt-1">{selectedNotification.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Badge className={getTypeColor(selectedNotification.type)}>
                    {typeOptions.find(t => t.value === selectedNotification.type)?.label}
                  </Badge>
                </div>

                <div>
                  <Label>Estado</Label>
                  <Badge className={getStatusColor(selectedNotification.status)}>
                    {statusOptions.find(s => s.value === selectedNotification.status)?.label}
                  </Badge>
                </div>

                <div>
                  <Label>Canal</Label>
                  <p className="text-sm text-gray-600">
                    {channelOptions.find(c => c.value === selectedNotification.channel)?.label}
                  </p>
                </div>

                <div>
                  <Label>Audiencia</Label>
                  <p className="text-sm text-gray-600">
                    {audienceOptions.find(a => a.value === selectedNotification.target_audience)?.label}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Destinatarios</Label>
                  <p className="text-sm text-gray-600">{selectedNotification.recipient_count || 0}</p>
                </div>

                {selectedNotification.open_count && (
                  <div>
                    <Label>Aperturas</Label>
                    <p className="text-sm text-gray-600">{selectedNotification.open_count}</p>
                  </div>
                )}

                {selectedNotification.click_count && (
                  <div>
                    <Label>Clics</Label>
                    <p className="text-sm text-gray-600">{selectedNotification.click_count}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha de Creación</Label>
                  <p className="text-sm text-gray-600">{formatDateTime(selectedNotification.created_at)}</p>
                </div>

                {selectedNotification.scheduled_for && (
                  <div>
                    <Label>Programada para</Label>
                    <p className="text-sm text-gray-600">{formatDateTime(selectedNotification.scheduled_for)}</p>
                  </div>
                )}

                {selectedNotification.sent_at && (
                  <div>
                    <Label>Enviada el</Label>
                    <p className="text-sm text-gray-600">{formatDateTime(selectedNotification.sent_at)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Notificación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas enviar esta notificación?
            </DialogDescription>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium">{selectedNotification.title}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedNotification.content}</p>
              </div>
              <div className="text-sm text-gray-600">
                <p>Destinatarios: <strong>{selectedNotification.recipient_count}</strong></p>
                <p>Canal: <strong>{channelOptions.find(c => c.value === selectedNotification.channel)?.label}</strong></p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendNotification} className="bg-green-600 hover:bg-green-700">
              Enviar Notificación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar Notificación?</DialogTitle>
          </DialogHeader>

          <p>
            ¿Estás seguro que deseas eliminar la notificación "{selectedNotification?.title}"? Esta acción no se puede deshacer.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteNotification}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationsPage;