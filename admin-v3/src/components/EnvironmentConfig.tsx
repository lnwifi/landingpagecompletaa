import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Box,
  Alert,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Science as TestIcon,
  Business as ProductionIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { supabase } from '../services/supabase';
import { createClient } from '@supabase/supabase-js';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

const EnvironmentChip = styled(Chip)<{ environment: 'production' | 'test' }>(({ theme, environment }) => ({
  fontWeight: 'bold',
  backgroundColor: environment === 'production'
    ? theme.palette.success.main
    : theme.palette.warning.main,
  color: 'white'
}));

interface EnvironmentConfig {
  id: string;
  environment: 'production' | 'test';
  supabase_url: string;
  supabase_anon_key: string;
  mercadopago_public_key: string;
  mercadopago_access_token: string;
  mercadopago_environment: 'production' | 'sandbox';
  cloudinary_cloud_name: string;
  cloudinary_upload_preset: string;
  cloudinary_api_key: string;
  firebase_api_key: string;
  firebase_project_id: string;
  google_client_id: string;
  updated_at: string;
}

interface EnvironmentConfigProps {
  onEnvironmentChange?: (environment: 'production' | 'test') => void;
}

const EnvironmentConfig: React.FC<EnvironmentConfigProps> = ({ onEnvironmentChange }) => {
  const [currentEnvironment, setCurrentEnvironment] = useState<'production' | 'test'>('production');
  const [configs, setConfigs] = useState<Record<'production' | 'test', Partial<EnvironmentConfig>>>({
    production: {},
    test: {}
  });
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState<'production' | 'test' | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testingConnection, setTestingConnection] = useState<Record<string, boolean>>({});
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'success' | 'error' | null>>({});

  // Cargar configuración actual
  useEffect(() => {
    loadEnvironmentConfig();
  }, []);

  const loadEnvironmentConfig = async () => {
    setLoading(true);
    try {
      // Obtener el ambiente activo primero
      const { data: activeEnv, error: envError } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'environment')
        .single();

      if (envError) {
        console.error('Error loading active environment:', envError);
      } else if (activeEnv?.value) {
        console.log('Ambiente activo cargado:', activeEnv.value);
        setCurrentEnvironment(activeEnv.value as 'production' | 'test');
      }

      const { data, error } = await supabase
        .from('environment_configs')
        .select('*')
        .in('environment', ['production', 'test']);

      if (error) throw error;

      const configsMap: Record<'production' | 'test', Partial<EnvironmentConfig>> = {
        production: {},
        test: {}
      };

      data?.forEach(config => {
        configsMap[config.environment as 'production' | 'test'] = config;
      });

      setConfigs(configsMap);

    } catch (error) {
      console.error('Error loading environment config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnvironmentToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEnvironment = event.target.checked ? 'production' : 'test';

    try {
      console.log('Cambiando ambiente a:', newEnvironment);

      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key: 'environment',
          value: newEnvironment,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      console.log('Ambiente cambiado exitosamente a:', newEnvironment);
      setCurrentEnvironment(newEnvironment);
      onEnvironmentChange?.(newEnvironment);

      // Recargar configuración para asegurar sincronización
      await loadEnvironmentConfig();

    } catch (error) {
      console.error('Error changing environment:', error);
    }
  };

  const handleEditConfig = (environment: 'production' | 'test') => {
    setEditingEnv(environment);
    setDialogOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!editingEnv) return;

    setLoading(true);
    try {
      const configToSave = {
        ...configs[editingEnv],
        environment: editingEnv,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('environment_configs')
        .upsert(configToSave);

      if (error) throw error;

      setDialogOpen(false);
      setEditingEnv(null);
      await loadEnvironmentConfig();

    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (service: string, environment: 'production' | 'test') => {
    const testKey = `${service}_${environment}`;
    setTestingConnection({ ...testingConnection, [testKey]: true });
    setConnectionStatus({ ...connectionStatus, [testKey]: null });

    try {
      const config = configs[environment];
      let isValid = false;

      switch (service) {
        case 'supabase':
          // Test conexión a Supabase
          if (config.supabase_url && config.supabase_anon_key) {
            const testClient = createClient(config.supabase_url, config.supabase_anon_key);
            const { error } = await testClient.from('profiles').select('id').limit(1);
            isValid = !error;
          }
          break;

        case 'mercadopago':
          // Test conexión a MercadoPago
          if (config.mercadopago_access_token) {
            const response = await fetch('https://api.mercadopago.com/users/me', {
              headers: {
                'Authorization': `Bearer ${config.mercadopago_access_token}`
              }
            });
            isValid = response.ok;
          }
          break;

        case 'cloudinary':
          // Test Cloudinary API key
          isValid = !!(config.cloudinary_cloud_name && config.cloudinary_api_key);
          break;
      }

      setConnectionStatus({ ...connectionStatus, [testKey]: isValid ? 'success' : 'error' });

    } catch (error) {
      setConnectionStatus({ ...connectionStatus, [testKey]: 'error' });
    } finally {
      setTestingConnection({ ...testingConnection, [testKey]: false });
    }
  };

  const renderConfigField = (
    label: string,
    key: keyof EnvironmentConfig,
    isSecret: boolean = false
  ) => (
    <Grid item xs={12}>
      <TextField
        fullWidth
        label={label}
        value={editingEnv ? (configs[editingEnv]?.[key] || '') : ''}
        onChange={(e) => setConfigs({
          ...configs,
          [editingEnv!]: {
            ...configs[editingEnv!],
            [key]: e.target.value
          }
        })}
        type={isSecret && !showSecrets[key] ? 'password' : 'text'}
        InputProps={{
          endAdornment: isSecret && (
            <IconButton
              onClick={() => setShowSecrets({
                ...showSecrets,
                [key]: !showSecrets[key]
              })}
            >
              {showSecrets[key] ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
          )
        }}
        margin="normal"
      />
    </Grid>
  );

  const renderEnvironmentCard = (environment: 'production' | 'test') => {
    const config = configs[environment];
    const isActive = currentEnvironment === environment;
    const hasConfig = Object.keys(config).length > 0;

    return (
      <StyledCard>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              {environment === 'production' ? <ProductionIcon /> : <TestIcon />}
              <Typography variant="h6">
                Ambiente {environment === 'production' ? 'Producción' : 'Prueba'}
              </Typography>
              <EnvironmentChip
                environment={environment}
                label={isActive ? 'Activo' : 'Inactivo'}
                size="small"
              />
            </Box>

            <Box display="flex" gap={1}>
              <Tooltip title="Probar conexiones">
                <IconButton
                  onClick={() => {
                    testConnection('supabase', environment);
                    testConnection('mercadopago', environment);
                    testConnection('cloudinary', environment);
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Editar configuración">
                <IconButton onClick={() => handleEditConfig(environment)}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {!hasConfig ? (
            <Alert severity="warning">
              No hay configuración guardada para este ambiente.
            </Alert>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Última actualización: {new Date(config.updated_at || '').toLocaleString()}
              </Typography>

              {/* Estado de conexiones */}
              <Box display="flex" gap={1} mb={2}>
                {['supabase', 'mercadopago', 'cloudinary'].map(service => {
                  const testKey = `${service}_${environment}`;
                  const isTesting = testingConnection[testKey];
                  const status = connectionStatus[testKey];

                  return (
                    <Chip
                      key={service}
                      label={service.charAt(0).toUpperCase() + service.slice(1)}
                      size="small"
                      icon={isTesting ? (
                        <LinearProgress style={{ width: 16, height: 16 }} />
                      ) : status === 'success' ? (
                        <CheckIcon />
                      ) : status === 'error' ? (
                        <ErrorIcon />
                      ) : null}
                      color={status === 'success' ? 'success' : status === 'error' ? 'error' : 'default'}
                      variant={status ? 'filled' : 'outlined'}
                    />
                  );
                })}
              </Box>

              {/* Información básica */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Supabase:</strong> {config.supabase_url ? 'Configurado' : 'No configurado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>MP Ambiente:</strong> {config.mercadopago_environment || 'No configurado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Cloudinary:</strong> {config.cloudinary_cloud_name || 'No configurado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Firebase:</strong> {config.firebase_project_id || 'No configurado'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </StyledCard>
    );
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">Configuración de Ambientes MercadoPago</Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentEnvironment === 'production'}
                    onChange={handleEnvironmentToggle}
                    color="primary"
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography>Producción</Typography>
                    <EnvironmentChip
                      environment={currentEnvironment}
                      label={currentEnvironment === 'production' ? 'PAGOS REALES' : 'PAGOS DE PRUEBA'}
                      size="small"
                    />
                  </Box>
                }
              />
              <Tooltip title="Recargar configuración">
                <IconButton onClick={loadEnvironmentConfig} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>💡 Cómo funciona:</strong><br/>
              • <strong>Producción</strong>: Pagos reales con dinero real (como siempre)<br/>
              • <strong>Prueba</strong>: Pagos de prueba con dinero ficticio (sandbox)<br/>
              • Cambiar el ambiente solo afecta a los NUEVOS pagos<br/>
              • Las credenciales se guardan en EAS Secrets (seguro)
            </Typography>
          </Alert>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Ambientes Configurados
          </Typography>

          {loading ? (
            <LinearProgress />
          ) : (
            <Box>
              {renderEnvironmentCard('production')}
              {renderEnvironmentCard('test')}
            </Box>
          )}

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Nota:</strong> Asegúrate de probar las conexiones después de cambiar
              las credenciales para verificar que todo funciona correctamente.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Diálogo de edición */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Editar Configuración - {editingEnv === 'production' ? 'Producción' : 'Prueba'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {renderConfigField('URL de Supabase', 'supabase_url')}
            {renderConfigField('Clave Anónima de Supabase', 'supabase_anon_key', true)}
            {renderConfigField('Clave Pública de MercadoPago', 'mercadopago_public_key')}
            {renderConfigField('Token de Acceso de MercadoPago', 'mercadopago_access_token', true)}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Ambiente de MercadoPago"
                value={editingEnv ? (configs[editingEnv]?.mercadopago_environment || 'production') : ''}
                onChange={(e) => setConfigs({
                  ...configs,
                  [editingEnv!]: {
                    ...configs[editingEnv!],
                    mercadopago_environment: e.target.value as 'production' | 'sandbox'
                  }
                })}
                margin="normal"
              >
                <option value="production">Producción</option>
                <option value="sandbox">Prueba (Sandbox)</option>
              </TextField>
            </Grid>
            {renderConfigField('Cloud Name de Cloudinary', 'cloudinary_cloud_name')}
            {renderConfigField('Upload Preset de Cloudinary', 'cloudinary_upload_preset')}
            {renderConfigField('API Key de Cloudinary', 'cloudinary_api_key')}
            {renderConfigField('API Key de Firebase', 'firebase_api_key', true)}
            {renderConfigField('Project ID de Firebase', 'firebase_project_id')}
            {renderConfigField('Client ID de Google', 'google_client_id', true)}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveConfig} variant="contained" startIcon={<SaveIcon />}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnvironmentConfig;