import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bell,
  Mail,
  Shield,
  Palette,
  Globe,
  Database,
  CreditCard,
  Users,
  Save,
  RefreshCw,
  Download,
  Upload,
  Key,
  Lock,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Zap,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  Store
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import EnvironmentConfig from '@/components/EnvironmentConfig';

interface ConfigSettings {
  general: {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    supportPhone: string;
    timezone: string;
    language: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    newOrderAlert: boolean;
    newUserAlert: boolean;
    systemAlert: boolean;
    digestFrequency: string;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    logoUrl: string;
    faviconUrl: string;
    customCSS: string;
  };
  integrations: {
    mercadoPagoEnabled: boolean;
    mercadoPagoPublicKey: string;
    firebaseEnabled: boolean;
    firebaseConfig: string;
    cloudinaryEnabled: boolean;
    cloudinaryCloudName: string;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    twoFactorAuth: boolean;
    ipWhitelist: string;
  };
  backup: {
    autoBackupEnabled: boolean;
    backupFrequency: string;
    maxBackupFiles: number;
    lastBackupDate: string;
  };
}

const ConfiguracionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [settings, setSettings] = useState<ConfigSettings>({
    general: {
      siteName: 'PetoClub Admin',
      siteDescription: 'Panel de administración de PetoClub',
      adminEmail: 'admin@petoclub.com',
      supportPhone: '+54 11 1234-5678',
      timezone: 'America/Argentina/Buenos_Aires',
      language: 'es-AR'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      newOrderAlert: true,
      newUserAlert: true,
      systemAlert: true,
      digestFrequency: 'daily'
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3B82F6',
      logoUrl: '',
      faviconUrl: '',
      customCSS: ''
    },
    integrations: {
      mercadoPagoEnabled: true,
      mercadoPagoPublicKey: '',
      firebaseEnabled: true,
      firebaseConfig: '',
      cloudinaryEnabled: true,
      cloudinaryCloudName: ''
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      twoFactorAuth: false,
      ipWhitelist: ''
    },
    backup: {
      autoBackupEnabled: true,
      backupFrequency: 'daily',
      maxBackupFiles: 30,
      lastBackupDate: new Date().toISOString()
    }
  });

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notificaciones', icon: <Bell className="w-4 h-4" /> },
    { id: 'appearance', label: 'Apariencia', icon: <Palette className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integraciones', icon: <Zap className="w-4 h-4" /> },
    { id: 'ambientes', label: 'Ambientes MercadoPago', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'security', label: 'Seguridad', icon: <Shield className="w-4 h-4" /> },
    { id: 'backup', label: 'Respaldo', icon: <Database className="w-4 h-4" /> }
  ];

  const timezoneOptions = [
    'America/Argentina/Buenos_Aires',
    'America/Mexico_City',
    'America/Santiago',
    'America/Lima',
    'Europe/Madrid',
    'UTC'
  ];

  const languageOptions = [
    { value: 'es-AR', label: 'Español (Argentina)' },
    { value: 'es-ES', label: 'Español (España)' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'pt-BR', label: 'Português (Brasil)' }
  ];

  const digestFrequencyOptions = [
    { value: 'immediate', label: 'Inmediato' },
    { value: 'hourly', label: 'Cada hora' },
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'never', label: 'Nunca' }
  ];

  const backupFrequencyOptions = [
    { value: 'hourly', label: 'Cada hora' },
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Simulación de carga de configuración
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Aquí cargaríamos la configuración desde la base de datos
    } catch (error) {
      toast.error('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Configuración guardada exitosamente');
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    try {
      toast.loading('Creando respaldo...');
      // Simulación de backup
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.dismiss();
      toast.success('Respaldo creado exitosamente');
      setSettings(prev => ({
        ...prev,
        backup: {
          ...prev.backup,
          lastBackupDate: new Date().toISOString()
        }
      }));
      setShowBackupDialog(false);
    } catch (error) {
      toast.dismiss();
      toast.error('Error al crear el respaldo');
    }
  };

  const handleRestore = async () => {
    try {
      toast.loading('Restaurando sistema...');
      // Simulación de restauración
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.dismiss();
      toast.success('Sistema restaurado exitosamente');
      setShowResetDialog(false);
    } catch (error) {
      toast.dismiss();
      toast.error('Error al restaurar el sistema');
    }
  };

  const updateSetting = (category: keyof ConfigSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Sitio</CardTitle>
          <CardDescription>
            Configura la información básica del sitio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nombre del Sitio</Label>
              <Input
                value={settings.general.siteName}
                onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                placeholder="Nombre del sitio"
              />
            </div>
            <div>
              <Label>Email del Administrador</Label>
              <Input
                type="email"
                value={settings.general.adminEmail}
                onChange={(e) => updateSetting('general', 'adminEmail', e.target.value)}
                placeholder="admin@ejemplo.com"
              />
            </div>
            <div>
              <Label>Teléfono de Soporte</Label>
              <Input
                value={settings.general.supportPhone}
                onChange={(e) => updateSetting('general', 'supportPhone', e.target.value)}
                placeholder="+54 11 1234-5678"
              />
            </div>
            <div>
              <Label>Zona Horaria</Label>
              <Select value={settings.general.timezone} onValueChange={(value) => updateSetting('general', 'timezone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezoneOptions.map(tz => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Descripción del Sitio</Label>
            <Textarea
              value={settings.general.siteDescription}
              onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
              placeholder="Descripción breve del sitio"
              rows={3}
            />
          </div>
          <div>
            <Label>Idioma Predeterminado</Label>
            <Select value={settings.general.language} onValueChange={(value) => updateSetting('general', 'language', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Canales de Notificación</CardTitle>
          <CardDescription>
            Configura cómo y cuándo recibir notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Notificaciones por Email</Label>
              <p className="text-sm text-gray-600">Recibir notificaciones importantes por correo</p>
            </div>
            <Switch
              checked={settings.notifications.emailNotifications}
              onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Notificaciones Push</Label>
              <p className="text-sm text-gray-600">Notificaciones en tiempo real en el navegador</p>
            </div>
            <Switch
              checked={settings.notifications.pushNotifications}
              onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Notificaciones SMS</Label>
              <p className="text-sm text-gray-600">Alertas críticas por mensaje de texto</p>
            </div>
            <Switch
              checked={settings.notifications.smsNotifications}
              onCheckedChange={(checked) => updateSetting('notifications', 'smsNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de Alertas</CardTitle>
          <CardDescription>
            Selecciona qué eventos activan notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Nuevos Pedidos</Label>
              <p className="text-sm text-gray-600">Alerta cuando se recibe un nuevo pedido</p>
            </div>
            <Switch
              checked={settings.notifications.newOrderAlert}
              onCheckedChange={(checked) => updateSetting('notifications', 'newOrderAlert', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Nuevos Usuarios</Label>
              <p className="text-sm text-gray-600">Notificación cuando se registra un nuevo usuario</p>
            </div>
            <Switch
              checked={settings.notifications.newUserAlert}
              onCheckedChange={(checked) => updateSetting('notifications', 'newUserAlert', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Alertas del Sistema</Label>
              <p className="text-sm text-gray-600">Notificaciones de errores y mantenimiento</p>
            </div>
            <Switch
              checked={settings.notifications.systemAlert}
              onCheckedChange={(checked) => updateSetting('notifications', 'systemAlert', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frecuencia de Resumen</CardTitle>
          <CardDescription>
            Configura con qué frecuencia recibir resúmenes por email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={settings.notifications.digestFrequency} onValueChange={(value) => updateSetting('notifications', 'digestFrequency', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {digestFrequencyOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tema Visual</CardTitle>
          <CardDescription>
            Personaliza la apariencia del panel de administración
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tema</Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {[
                { value: 'light', label: 'Claro', icon: <Sun className="w-4 h-4" /> },
                { value: 'dark', label: 'Oscuro', icon: <Moon className="w-4 h-4" /> },
                { value: 'auto', label: 'Automático', icon: <Monitor className="w-4 h-4" /> }
              ].map(theme => (
                <Button
                  key={theme.value}
                  variant={settings.appearance.theme === theme.value ? 'default' : 'outline'}
                  onClick={() => updateSetting('appearance', 'theme', theme.value)}
                  className="flex items-center gap-2"
                >
                  {theme.icon}
                  {theme.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label>Color Principal</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                type="color"
                value={settings.appearance.primaryColor}
                onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={settings.appearance.primaryColor}
                onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>
            Configura el logo y favicon del sitio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>URL del Logo</Label>
            <Input
              value={settings.appearance.logoUrl}
              onChange={(e) => updateSetting('appearance', 'logoUrl', e.target.value)}
              placeholder="https://ejemplo.com/logo.png"
            />
          </div>
          <div>
            <Label>URL del Favicon</Label>
            <Input
              value={settings.appearance.faviconUrl}
              onChange={(e) => updateSetting('appearance', 'faviconUrl', e.target.value)}
              placeholder="https://ejemplo.com/favicon.ico"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CSS Personalizado</CardTitle>
          <CardDescription>
            Añade estilos CSS personalizados para el panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={settings.appearance.customCSS}
            onChange={(e) => updateSetting('appearance', 'customCSS', e.target.value)}
            placeholder="/* CSS personalizado aquí */"
            rows={8}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            MercadoPago
          </CardTitle>
          <CardDescription>
            Configura la integración con MercadoPago para procesar pagos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Habilitar MercadoPago</Label>
              <p className="text-sm text-gray-600">Permite procesar pagos mediante MercadoPago</p>
            </div>
            <Switch
              checked={settings.integrations.mercadoPagoEnabled}
              onCheckedChange={(checked) => updateSetting('integrations', 'mercadoPagoEnabled', checked)}
            />
          </div>
          <div>
            <Label>Public Key de MercadoPago</Label>
            <Input
              value={settings.integrations.mercadoPagoPublicKey}
              onChange={(e) => updateSetting('integrations', 'mercadoPagoPublicKey', e.target.value)}
              placeholder="TEST-123456789-abcdef-12345"
              type="password"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Firebase
          </CardTitle>
          <CardDescription>
            Configura Firebase para notificaciones push y autenticación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Habilitar Firebase</Label>
              <p className="text-sm text-gray-600">Activa notificaciones push y otros servicios</p>
            </div>
            <Switch
              checked={settings.integrations.firebaseEnabled}
              onCheckedChange={(checked) => updateSetting('integrations', 'firebaseEnabled', checked)}
            />
          </div>
          <div>
            <Label>Configuración de Firebase</Label>
            <Textarea
              value={settings.integrations.firebaseConfig}
              onChange={(e) => updateSetting('integrations', 'firebaseConfig', e.target.value)}
              placeholder="Pega aquí la configuración JSON de Firebase"
              rows={6}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Cloudinary
          </CardTitle>
          <CardDescription>
            Configura Cloudinary para almacenamiento de imágenes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Habilitar Cloudinary</Label>
              <p className="text-sm text-gray-600">Usa Cloudinary para subir y gestionar imágenes</p>
            </div>
            <Switch
              checked={settings.integrations.cloudinaryEnabled}
              onCheckedChange={(checked) => updateSetting('integrations', 'cloudinaryEnabled', checked)}
            />
          </div>
          <div>
            <Label>Cloud Name</Label>
            <Input
              value={settings.integrations.cloudinaryCloudName}
              onChange={(e) => updateSetting('integrations', 'cloudinaryCloudName', e.target.value)}
              placeholder="your-cloud-name"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Políticas de Contraseña
          </CardTitle>
          <CardDescription>
            Configura los requisitos de seguridad para contraseñas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Longitud Mínima de Contraseña</Label>
            <Input
              type="number"
              value={settings.security.passwordMinLength}
              onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
              min="6"
              max="20"
            />
          </div>
          <div>
            <Label>Intentos Máximos de Inicio de Sesión</Label>
            <Input
              type="number"
              value={settings.security.maxLoginAttempts}
              onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
              min="3"
              max="10"
            />
          </div>
          <div>
            <Label>Tiempo de Espera de Sesión (minutos)</Label>
            <Input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
              min="5"
              max="120"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Autenticación</CardTitle>
          <CardDescription>
            Configura métodos adicionales de autenticación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Autenticación de Dos Factores</Label>
              <p className="text-sm text-gray-600">Requiere código de verificación adicional</p>
            </div>
            <Switch
              checked={settings.security.twoFactorAuth}
              onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Restricciones de Acceso</CardTitle>
          <CardDescription>
            Configura restricciones basadas en dirección IP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Lista Blanca de IPs (una por línea)</Label>
            <Textarea
              value={settings.security.ipWhitelist}
              onChange={(e) => updateSetting('security', 'ipWhitelist', e.target.value)}
              placeholder="192.168.1.1&#10;10.0.0.0/8"
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Deja vacío para permitir acceso desde cualquier dirección IP
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Configuración de Respaldo
          </CardTitle>
          <CardDescription>
            Configura el respaldo automático de la base de datos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Respaldo Automático</Label>
              <p className="text-sm text-gray-600">Crea respaldos automáticamente</p>
            </div>
            <Switch
              checked={settings.backup.autoBackupEnabled}
              onCheckedChange={(checked) => updateSetting('backup', 'autoBackupEnabled', checked)}
            />
          </div>
          <div>
            <Label>Frecuencia de Respaldo</Label>
            <Select value={settings.backup.backupFrequency} onValueChange={(value) => updateSetting('backup', 'backupFrequency', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {backupFrequencyOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cantidad Máxima de Respaldos</Label>
            <Input
              type="number"
              value={settings.backup.maxBackupFiles}
              onChange={(e) => updateSetting('backup', 'maxBackupFiles', parseInt(e.target.value))}
              min="5"
              max="100"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado del Respaldo</CardTitle>
          <CardDescription>
            Información sobre los respaldos existentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Último Respaldo</Label>
              <p className="text-sm text-gray-600">
                {settings.backup.lastBackupDate
                  ? new Date(settings.backup.lastBackupDate).toLocaleString('es-AR')
                  : 'No hay respaldos previos'
                }
              </p>
            </div>
            <Badge variant={settings.backup.autoBackupEnabled ? 'default' : 'secondary'}>
              {settings.backup.autoBackupEnabled ? 'Automático' : 'Manual'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operaciones de Respaldo</CardTitle>
          <CardDescription>
            Crear respaldos manuales o restaurar el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Crear Respaldo Manual
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Respaldo</DialogTitle>
                  <DialogDescription>
                    Se creará un respaldo completo de la base de datos y archivos.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowBackupDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleBackup}>
                    Crear Respaldo
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Restaurar Sistema
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Restaurar Sistema</DialogTitle>
                  <DialogDescription>
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 font-semibold">
                      ¡ADVERTENCIA! Esta acción restaurará el sistema a un estado anterior.
                    </p>
                    <p>
                      Todos los cambios realizados después del respaldo seleccionado se perderán permanentemente.
                      Esta acción no se puede deshacer.
                    </p>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleRestore}>
                    Restaurar Sistema
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'notifications': return renderNotificationSettings();
      case 'appearance': return renderAppearanceSettings();
      case 'integrations': return renderIntegrationSettings();
      case 'ambientes': return <EnvironmentConfig />;
      case 'security': return renderSecuritySettings();
      case 'backup': return renderBackupSettings();
      default: return renderGeneralSettings();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-2">Configura los parámetros del sistema</p>
        </div>
        <Button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 ${
                      activeTab === tab.id ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : ''
                    }`}
                  >
                    {tab.icon}
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionPage;