import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Phone, Mail, Globe, Star, Users, Edit2, Trash2, Eye, Building2, DollarSign, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import { refugiosService, Refugio } from '@/services/supabase';

interface RefugioFormData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  website: string;
  facebook: string;
  instagram: string;
  bank_account: string;
  bank_cbu: string;
  bank_alias: string;
  bank_account_holder: string;
  bank_account_type: string;
  bank_name: string;
  image: string;
  rating: number;
}

const RefugiosPage: React.FC = () => {
  const [refugios, setRefugios] = useState<Refugio[]>([]);
  const [filteredRefugios, setFilteredRefugios] = useState<Refugio[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRefugio, setSelectedRefugio] = useState<Refugio | null>(null);

  // Estados para modales adicionales (como en admin-v2)
  const [showPetsModal, setShowPetsModal] = useState(false);
  const [showCausesModal, setShowCausesModal] = useState(false);
  const [showDonationsModal, setShowDonationsModal] = useState(false);
  const [showAddCauseModal, setShowAddCauseModal] = useState(false);
  const [showAddDonationModal, setShowAddDonationModal] = useState(false);
  const [selectedCause, setSelectedCause] = useState<any>(null);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [formData, setFormData] = useState<RefugioFormData>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    whatsapp: '',
    website: '',
    facebook: '',
    instagram: '',
    bank_account: '',
    bank_cbu: '',
    bank_alias: '',
    bank_account_holder: '',
    bank_account_type: '',
    bank_name: '',
    image: '',
    rating: 0,
  });

  // Función principal para cargar refugios (como en admin-v2)
  const loadRefugios = async () => {
    try {
      setLoading(true);
      const data = await refugiosService.getRefugios();
      setRefugios(data);
      setFilteredRefugios(data);
    } catch (error) {
      console.error('Error loading refugios:', error);
      toast.error('Error al cargar los refugios');
    } finally {
      setLoading(false);
    }
  };

  // Alias para compatibilidad con admin-v2
  const loadShelters = loadRefugios;

  useEffect(() => {
    loadRefugios();
  }, []);

  // Filtrar refugios
  useEffect(() => {
    const filtered = refugios.filter(refugio =>
      refugio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refugio.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refugio.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refugio.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRefugios(filtered);
  }, [searchTerm, refugios]);

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      whatsapp: '',
      website: '',
      facebook: '',
      instagram: '',
      bank_account: '',
      bank_cbu: '',
      bank_alias: '',
      bank_account_holder: '',
      bank_account_type: '',
      bank_name: '',
      image: '',
      rating: 0,
    });
  };

  // Create refugio
  const handleCreateRefugio = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre del refugio es requerido');
      return;
    }

    try {
      await refugiosService.createRefugio(formData);
      toast.success('Refugio creado exitosamente');
      setShowCreateDialog(false);
      resetFormData();
      loadRefugios();
    } catch (error: any) {
      console.error('Error creating refugio:', error);
      toast.error(error.message || 'Error al crear el refugio');
    }
  };

  // Update refugio
  const handleUpdateRefugio = async () => {
    if (!selectedRefugio || !formData.name.trim()) {
      toast.error('El nombre del refugio es requerido');
      return;
    }

    try {
      await refugiosService.updateRefugio(selectedRefugio.id, formData);
      toast.success('Refugio actualizado exitosamente');
      setShowEditDialog(false);
      setSelectedRefugio(null);
      resetFormData();
      loadRefugios();
    } catch (error: any) {
      console.error('Error updating refugio:', error);
      toast.error(error.message || 'Error al actualizar el refugio');
    }
  };

  // Delete refugio
  const handleDeleteRefugio = async () => {
    if (!selectedRefugio) return;

    try {
      await refugiosService.deleteRefugio(selectedRefugio.id);
      toast.success('Refugio eliminado exitosamente');
      setShowDeleteDialog(false);
      setSelectedRefugio(null);
      loadRefugios();
    } catch (error: any) {
      console.error('Error deleting refugio:', error);
      toast.error(error.message || 'Error al eliminar el refugio');
    }
  };

  // View refugio
  const handleViewRefugio = (refugio: Refugio) => {
    setSelectedRefugio(refugio);
    setShowViewDialog(true);
  };

  // Edit refugio
  const handleEditRefugio = (refugio: Refugio) => {
    setSelectedRefugio(refugio);
    setFormData({
      name: refugio.name,
      description: refugio.description || '',
      address: refugio.address || '',
      phone: refugio.phone || '',
      email: refugio.email || '',
      whatsapp: refugio.whatsapp || '',
      website: refugio.website || '',
      facebook: refugio.facebook || '',
      instagram: refugio.instagram || '',
      bank_account: refugio.bank_account || '',
      bank_cbu: refugio.bank_cbu || '',
      bank_alias: refugio.bank_alias || '',
      bank_account_holder: refugio.bank_account_holder || '',
      bank_account_type: refugio.bank_account_type || '',
      bank_name: refugio.bank_name || '',
      image: refugio.image || '',
      rating: refugio.rating || 0,
    });
    setShowEditDialog(true);
  };

  // Delete refugio dialog
  const handleDeleteClick = (refugio: Refugio) => {
    setSelectedRefugio(refugio);
    setShowDeleteDialog(true);
  };

  // Funciones para formato y cálculos (como en admin-v2)
  const formatCurrency = (amount: number | string | null | undefined): string => {
    if (!amount) return '$0';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(num);
  };

  const calculateDonationTotal = (donations: any[] | null | undefined): number => {
    if (!donations || !Array.isArray(donations)) return 0;
    return donations.reduce((total, payment) => {
      const amount = parseFloat(payment.amount) || 0;
      return total + amount;
    }, 0);
  };

  // Función para actualizar refugio (como en admin-v2)
  const handleUpdateShelter = async (updatedShelter: Partial<Refugio>) => {
    if (!selectedRefugio) return;

    try {
      const updated = await refugiosService.updateRefugio(selectedRefugio.id, updatedShelter);
      setRefugios(prev => prev.map(r => r.id === updated.id ? updated : r));
      setSelectedRefugio(updated);
      setShowEditDialog(false);
      toast.success('Refugio actualizado exitosamente');
    } catch (error: any) {
      console.error('Error actualizando refugio:', error);
      toast.error(error.message || 'Error al actualizar el refugio');
    }
  };

  // Función para guardar edición (como en admin-v2)
  const handleSaveEdit = () => {
    if (!selectedRefugio || !formData.name || !formData.email) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    handleUpdateShelter({
      name: formData.name,
      description: formData.description,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      whatsapp: formData.whatsapp,
      website: formData.website,
      facebook: formData.facebook,
      instagram: formData.instagram,
      bank_account: formData.bank_account,
      bank_cbu: formData.bank_cbu,
      bank_alias: formData.bank_alias,
      bank_account_holder: formData.bank_account_holder,
      bank_account_type: formData.bank_account_type,
      bank_name: formData.bank_name,
      rating: formData.rating,
      image: formData.image,
    });
  };

  // Función para guardar nuevo refugio (como en admin-v2)
  const handleSaveCreate = () => {
    if (!formData.name || !formData.email) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    handleCreateRefugio({
      name: formData.name,
      description: formData.description,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      whatsapp: formData.whatsapp,
      website: formData.website,
      facebook: formData.facebook,
      instagram: formData.instagram,
      bank_account: formData.bank_account,
      bank_cbu: formData.bank_cbu,
      bank_alias: formData.bank_alias,
      bank_account_holder: formData.bank_account_holder,
      bank_account_type: formData.bank_account_type,
      bank_name: formData.bank_name,
      rating: formData.rating,
      image: formData.image,
    });
  };

  // Función para confirmar eliminación (como en admin-v2)
  const handleDeleteConfirm = async () => {
    if (!selectedRefugio) return;

    try {
      await refugiosService.deleteRefugio(selectedRefugio.id);
      setRefugios(prev => prev.filter(r => r.id !== selectedRefugio.id));
      setShowDeleteDialog(false);
      setSelectedRefugio(null);
      toast.success('Refugio eliminado exitosamente');
    } catch (error: any) {
      console.error('Error eliminando refugio:', error);
      toast.error(error.message || 'Error al eliminar el refugio');
    }
  };

  // Funciones para búsqueda y filtrado (como en admin-v2)
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    // Implementar según filtros necesarios
    console.log('Filter changed:', filterType, value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    // Limpiar otros filtros si existen
  };

  // Funciones para gestión de mascotas (como en admin-v2)
  const handleViewPets = (refugio: Refugio) => {
    setSelectedRefugio(refugio);
    setShowPetsModal(true);
  };

  const handleUpdatePet = (petId: string, petData: any) => {
    // Implementar actualización de mascota
    console.log('Update pet:', petId, petData);
    toast.success('Mascota actualizada exitosamente');
  };

  const handleAddPet = (petData: any) => {
    // Implementar agregar mascota
    console.log('Add pet:', petData);
    toast.success('Mascota agregada exitosamente');
  };

  // Funciones para gestión de causas urgentes (como en admin-v2)
  const handleViewCauses = (refugio: Refugio) => {
    setSelectedRefugio(refugio);
    setShowCausesModal(true);
  };

  const handleAddCause = () => {
    setShowAddCauseModal(true);
  };

  const handleSaveCause = (causeData: any) => {
    // Implementar guardar causa
    console.log('Save cause:', causeData);
    toast.success('Causa agregada exitosamente');
    setShowAddCauseModal(false);
  };

  const handleUpdateCause = (causeId: string, causeData: any) => {
    // Implementar actualizar causa
    console.log('Update cause:', causeId, causeData);
    toast.success('Causa actualizada exitosamente');
  };

  // Funciones para gestión de donaciones (como en admin-v2)
  const handleViewDonations = (refugio: Refugio) => {
    setSelectedRefugio(refugio);
    setShowDonationsModal(true);
  };

  const handleAddDonation = () => {
    setShowAddDonationModal(true);
  };

  const handleSaveDonation = (donationData: any) => {
    // Implementar guardar donación
    console.log('Save donation:', donationData);
    toast.success('Donación registrada exitosamente');
    setShowAddDonationModal(false);
  };

  // Funciones de exportación/importación (como en admin-v2)
  const handleExportData = () => {
    try {
      const exportData = {
        refugios: refugios.map(refugio => ({
          id: refugio.id,
          name: refugio.name,
          description: refugio.description,
          address: refugio.address,
          phone: refugio.phone,
          email: refugio.email,
          whatsapp: refugio.whatsapp,
          website: refugio.website,
          facebook: refugio.facebook,
          instagram: refugio.instagram,
          bank_name: refugio.bank_name,
          bank_account: refugio.bank_account,
          bank_cbu: refugio.bank_cbu,
          bank_alias: refugio.bank_alias,
          bank_account_holder: refugio.bank_account_holder,
          bank_account_type: refugio.bank_account_type,
          rating: refugio.rating,
          dashboard_access: refugio.dashboard_access,
          created_at: refugio.created_at,
          mascotas_count: countMascotas(refugio.mascotas),
          causas_count: countCausasUrgentes(refugio.causas_urgentes),
          total_donations: calculateTotalDonations(refugio.donation_payments)
        })),
        stats: {
          total: stats.total,
          conImagen: stats.conImagen,
          conTelefono: stats.conTelefono,
          conEmail: stats.conEmail,
          totalMascotas: stats.totalMascotas,
          totalMascotasDisponibles: stats.totalMascotasDisponibles,
          totalCausas: stats.totalCausas,
          totalDonaciones: stats.totalDonaciones,
          export_date: new Date().toISOString()
        }
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      const exportFileDefaultName = `refugios_export_${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast.success('Datos exportados exitosamente');
    } catch (error: any) {
      console.error('Error exportando datos:', error);
      toast.error('Error al exportar los datos');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedData = JSON.parse(content);

          if (importedData.refugios && Array.isArray(importedData.refugios)) {
            // Validar y procesar datos importados
            const validRefugios = importedData.refugios.filter((ref: any) =>
              ref.name && ref.email
            );

            if (validRefugios.length === 0) {
              toast.error('No hay refugios válidos en el archivo importado');
              return;
            }

            // Aquí se implementaría la lógica para guardar los refugios importados
            console.log('Refugios para importar:', validRefugios);
            toast.success(`${validRefugios.length} refugios listos para importar`);
          } else {
            toast.error('Formato de archivo inválido');
          }
        } catch (parseError: any) {
          console.error('Error parseando archivo:', parseError);
          toast.error('Error al leer el archivo importado');
        }
      };
      reader.readAsText(file);
    } catch (error: any) {
      console.error('Error importando datos:', error);
      toast.error('Error al importar los datos');
    }
  };

  // Render stars for rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  // Funciones utilitarias para contar mascotas y causas
  const countMascotas = (mascotas: any[] | object | null | undefined): number => {
    if (!mascotas) return 0;
    if (Array.isArray(mascotas)) return mascotas.length;
    if (typeof mascotas === 'object') return Object.keys(mascotas).length;
    return 0;
  };

  const countMascotasDisponibles = (mascotas: any[] | object | null | undefined): number => {
    if (!mascotas) return 0;

    const mascotasArray = Array.isArray(mascotas) ? mascotas : Object.values(mascotas);

    return mascotasArray.filter((mascota: any) => {
      return mascota && (mascota.adopted === false || mascota.adopted === undefined);
    }).length;
  };

  const countMascotasAdoptadas = (mascotas: any[] | object | null | undefined): number => {
    if (!mascotas) return 0;

    const mascotasArray = Array.isArray(mascotas) ? mascotas : Object.values(mascotas);

    return mascotasArray.filter((mascota: any) => {
      return mascota && mascota.adopted === true;
    }).length;
  };

  const countMascotasUrgentes = (mascotas: any[] | object | null | undefined): number => {
    if (!mascotas) return 0;

    const mascotasArray = Array.isArray(mascotas) ? mascotas : Object.values(mascotas);

    return mascotasArray.filter((mascota: any) => {
      return mascota && mascota.urgent === true;
    }).length;
  };

  const countCausasUrgentes = (causas: object | null | undefined): number => {
    if (!causas || typeof causas !== 'object') return 0;
    return Object.keys(causas).length;
  };

  const countCausasActivas = (causas: object | null | undefined): number => {
    if (!causas || typeof causas !== 'object') return 0;

    return Object.values(causas).filter((causa: any) => {
      return causa && (causa.is_active !== false && causa.resolved !== true);
    }).length;
  };

  const countCausasResueltas = (causas: object | null | undefined): number => {
    if (!causas || typeof causas !== 'object') return 0;

    return Object.values(causas).filter((causa: any) => {
      return causa && causa.resolved === true;
    }).length;
  };

  const calculateTotalDonations = (causas: object | null | undefined): number => {
    if (!causas || typeof causas !== 'object') return 0;

    let total = 0;
    Object.values(causas).forEach((causa: any) => {
      if (causa && causa.current_amount) {
        total += Number(causa.current_amount) || 0;
      }
    });

    return total;
  };

  const calculateDonationGoal = (causas: object | null | undefined): number => {
    if (!causas || typeof causas !== 'object') return 0;

    let total = 0;
    Object.values(causas).forEach((causa: any) => {
      if (causa && causa.goal_amount) {
        total += Number(causa.goal_amount) || 0;
      }
    });

    return total;
  };

  // Estadísticas
  const stats = {
    total: refugios.length,
    conImagen: refugios.filter(r => r.image).length,
    conTelefono: refugios.filter(r => r.phone).length,
    conEmail: refugios.filter(r => r.email).length,
    totalMascotas: refugios.reduce((total, r) => total + countMascotas(r.mascotas), 0),
    totalMascotasDisponibles: refugios.reduce((total, r) => total + countMascotasDisponibles(r.mascotas), 0),
    totalMascotasUrgentes: refugios.reduce((total, r) => total + countMascotasUrgentes(r.mascotas), 0),
    totalCausas: refugios.reduce((total, r) => total + countCausasUrgentes(r.causas_urgentes), 0),
    totalCausasActivas: refugios.reduce((total, r) => total + countCausasActivas(r.causas_urgentes), 0),
    totalDonaciones: refugios.reduce((total, r) => total + calculateTotalDonations(r.causas_urgentes), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Refugios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestión de refugios de animales
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleExportData}
            className="mt-4 sm:mt-0"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button
              variant="outline"
              className="mt-4 sm:mt-0"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="mt-4 sm:mt-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Refugio
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Refugios</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Mascotas</p>
                <p className="text-2xl font-bold">{stats.totalMascotas}</p>
                {stats.totalMascotasDisponibles > 0 && (
                  <p className="text-xs text-green-600">{stats.totalMascotasDisponibles} disponibles</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mascotas Urgentes</p>
                <p className="text-2xl font-bold">{stats.totalMascotasUrgentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Donaciones</p>
                <p className="text-2xl font-bold">${stats.totalDonaciones.toLocaleString()}</p>
                {stats.totalCausas > 0 && (
                  <p className="text-xs text-gray-600">{stats.totalCausasActivas} causas activas</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar refugios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Refugios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRefugios.map((refugio) => {
          return (
            <Card key={refugio.id}>
              <CardContent className="p-6">
                <div className="flex gap-4 items-start">
                  {/* Logo/Image */}
                  <div className="flex-shrink-0">
                    {refugio.image ? (
                      <img
                        src={refugio.image}
                        alt={`Logo de ${refugio.name}`}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '';
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{refugio.name}</h3>
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-2">{refugio.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      {refugio.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {refugio.address}
                        </div>
                      )}

                      {refugio.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {refugio.phone}
                        </div>
                      )}

                      {refugio.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {refugio.email}
                        </div>
                      )}

                      {refugio.website && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Globe className="w-4 h-4" />
                          <a href={refugio.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Sitio web
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-gray-600">Calificación:</span>
                      <div className="flex items-center gap-1">
                        {renderStars(refugio.rating)}
                        <span className="text-sm text-gray-600 ml-1">({refugio.rating})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-gray-600">Acceso Dashboard:</span>
                      <Badge variant={refugio.dashboard_access ? "default" : "secondary"}>
                        {refugio.dashboard_access ? "Sí" : "No"}
                      </Badge>
                    </div>

                    {/* Estadísticas de Mascotas */}
                    {countMascotas(refugio.mascotas) > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-600">
                          {countMascotas(refugio.mascotas)} mascotas
                          {countMascotasDisponibles(refugio.mascotas) > 0 && (
                            <span className="text-green-600">
                              ({countMascotasDisponibles(refugio.mascotas)} disponibles)
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {countMascotasUrgentes(refugio.mascotas) > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-orange-600">
                          {countMascotasUrgentes(refugio.mascotas)} urgentes
                        </span>
                      </div>
                    )}

                    {/* Estadísticas de Causas */}
                    {countCausasUrgentes(refugio.causas_urgentes) > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-gray-600">
                          {countCausasUrgentes(refugio.causas_urgentes)} causas
                          {countCausasActivas(refugio.causas_urgentes) > 0 && (
                            <span className="text-green-600">
                              ({countCausasActivas(refugio.causas_urgentes)} activas)
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {calculateTotalDonations(refugio.causas_urgentes) > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-600">
                          ${calculateTotalDonations(refugio.causas_urgentes).toLocaleString()} recaudado
                        </span>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewRefugio(refugio)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRefugio(refugio)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(refugio)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredRefugios.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron refugios</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'No hay refugios que coincidan con tu búsqueda.' : 'Comienza creando un nuevo refugio.'}
          </p>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Refugio</DialogTitle>
          </DialogHeader>
          {selectedRefugio && (
            <div className="space-y-6">
              {/* Header with image */}
              <div className="flex items-start gap-6">
                {selectedRefugio.image ? (
                  <img
                    src={selectedRefugio.image}
                    alt={`Logo de ${selectedRefugio.name}`}
                    className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{selectedRefugio.name}</h2>
                  {selectedRefugio.description && (
                    <p className="text-gray-600 mb-4">{selectedRefugio.description}</p>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {renderStars(selectedRefugio.rating)}
                      <span className="ml-1 text-sm text-gray-600">({selectedRefugio.rating})</span>
                    </div>
                    <Badge variant={selectedRefugio.dashboard_access ? "default" : "secondary"}>
                      Dashboard: {selectedRefugio.dashboard_access ? "Sí" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Información de Contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRefugio.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Dirección</p>
                        <p className="text-sm text-gray-600">{selectedRefugio.address}</p>
                      </div>
                    </div>
                  )}

                  {selectedRefugio.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Teléfono</p>
                        <p className="text-sm text-gray-600">{selectedRefugio.phone}</p>
                      </div>
                    </div>
                  )}

                  {selectedRefugio.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{selectedRefugio.email}</p>
                      </div>
                    </div>
                  )}

                  {selectedRefugio.whatsapp && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">WhatsApp</p>
                        <p className="text-sm text-gray-600">{selectedRefugio.whatsapp}</p>
                      </div>
                    </div>
                  )}

                  {selectedRefugio.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Sitio Web</p>
                        <a href={selectedRefugio.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          {selectedRefugio.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedRefugio.facebook && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Facebook</p>
                        <a href={selectedRefugio.facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          {selectedRefugio.facebook}
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedRefugio.instagram && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Instagram</p>
                        <a href={selectedRefugio.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          {selectedRefugio.instagram}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bank Information */}
              {(selectedRefugio.bank_name || selectedRefugio.bank_account || selectedRefugio.bank_cbu || selectedRefugio.bank_alias) && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Información Bancaria</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRefugio.bank_name && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Banco</p>
                        <p className="text-sm text-gray-600">{selectedRefugio.bank_name}</p>
                      </div>
                    )}

                    {selectedRefugio.bank_account_type && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Tipo de Cuenta</p>
                        <p className="text-sm text-gray-600">{selectedRefugio.bank_account_type}</p>
                      </div>
                    )}

                    {selectedRefugio.bank_account && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Número de Cuenta</p>
                        <p className="text-sm text-gray-600">{selectedRefugio.bank_account}</p>
                      </div>
                    )}

                    {selectedRefugio.bank_cbu && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">CBU/CVU</p>
                        <p className="text-sm text-gray-600">{selectedRefugio.bank_cbu}</p>
                      </div>
                    )}

                    {selectedRefugio.bank_alias && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Alias</p>
                        <p className="text-sm text-gray-600">{selectedRefugio.bank_alias}</p>
                      </div>
                    )}

                    {selectedRefugio.bank_account_holder && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Titular</p>
                        <p className="text-sm text-gray-600">{selectedRefugio.bank_account_holder}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Statistics */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Estadísticas del Refugio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Estadísticas de Mascotas */}
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold">{countMascotas(selectedRefugio.mascotas)}</p>
                    <p className="text-sm text-gray-600">Total Mascotas</p>
                    {countMascotasDisponibles(selectedRefugio.mascotas) > 0 && (
                      <p className="text-xs text-green-600">{countMascotasDisponibles(selectedRefugio.mascotas)} disponibles</p>
                    )}
                    {countMascotasAdoptadas(selectedRefugio.mascotas) > 0 && (
                      <p className="text-xs text-gray-500">{countMascotasAdoptadas(selectedRefugio.mascotas)} adoptadas</p>
                    )}
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Star className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                    <p className="text-2xl font-bold">{countMascotasUrgentes(selectedRefugio.mascotas)}</p>
                    <p className="text-sm text-gray-600">Mascotas Urgentes</p>
                  </div>

                  {/* Estadísticas de Causas */}
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <Star className="w-8 h-8 mx-auto mb-2 text-red-600" />
                    <p className="text-2xl font-bold">{countCausasUrgentes(selectedRefugio.causas_urgentes)}</p>
                    <p className="text-sm text-gray-600">Total Causas</p>
                    {countCausasActivas(selectedRefugio.causas_urgentes) > 0 && (
                      <p className="text-xs text-green-600">{countCausasActivas(selectedRefugio.causas_urgentes)} activas</p>
                    )}
                    {countCausasResueltas(selectedRefugio.causas_urgentes) > 0 && (
                      <p className="text-xs text-gray-500">{countCausasResueltas(selectedRefugio.causas_urgentes)} resueltas</p>
                    )}
                  </div>

                  {/* Estadísticas de Donaciones */}
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold">${calculateTotalDonations(selectedRefugio.causas_urgentes).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Recaudado</p>
                    {calculateDonationGoal(selectedRefugio.causas_urgentes) > 0 && (
                      <p className="text-xs text-gray-500">Meta: ${calculateDonationGoal(selectedRefugio.causas_urgentes).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                {/* Barra de progreso de donaciones */}
                {calculateDonationGoal(selectedRefugio.causas_urgentes) > 0 && (
                  <div className="mt-4">
                    {(() => {
                      const progress = Math.round((calculateTotalDonations(selectedRefugio.causas_urgentes) / calculateDonationGoal(selectedRefugio.causas_urgentes)) * 100);
                      return (
                        <>
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Progreso de recaudación</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, progress)}%` }}
                            ></div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Cerrar
            </Button>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => handleViewPets(selectedRefugio!)}
              >
                <Users className="w-4 h-4 mr-2" />
                Mascotas
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleViewCauses(selectedRefugio!)}
              >
                <Star className="w-4 h-4 mr-2" />
                Causas
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleViewDonations(selectedRefugio!)}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Donaciones
              </Button>
              <Button onClick={() => {
                setShowViewDialog(false);
                handleEditRefugio(selectedRefugio!);
              }}>
                Editar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          setSelectedRefugio(null);
          resetFormData();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showCreateDialog ? 'Nuevo Refugio' : 'Editar Refugio'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="font-semibold mb-3">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre del Refugio *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre del refugio"
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@refugio.com"
                  />
                </div>

                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>

                <div>
                  <Label>WhatsApp</Label>
                  <Input
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>

                <div>
                  <Label>Sitio Web</Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://refugio.com"
                  />
                </div>

                <div>
                  <Label>Facebook</Label>
                  <Input
                    value={formData.facebook}
                    onChange={(e) => setFormData(prev => ({ ...prev, facebook: e.target.value }))}
                    placeholder="https://facebook.com/refugio"
                  />
                </div>

                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={formData.instagram}
                    onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="https://instagram.com/refugio"
                  />
                </div>

                <div>
                  <Label>Calificación (0-5)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Descripción</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe el refugio, su misión y características principales..."
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Dirección</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Calle 123, Ciudad"
                  />
                </div>
              </div>
            </div>

            {/* Información Bancaria */}
            <div>
              <h3 className="font-semibold mb-3">Información Bancaria</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Banco</Label>
                  <Input
                    value={formData.bank_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                    placeholder="Nombre del banco"
                  />
                </div>

                <div>
                  <Label>Tipo de Cuenta</Label>
                  <select
                    value={formData.bank_account_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_account_type: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Caja de Ahorro">Caja de Ahorro</option>
                    <option value="Cuenta Corriente">Cuenta Corriente</option>
                  </select>
                </div>

                <div>
                  <Label>Número de Cuenta</Label>
                  <Input
                    value={formData.bank_account}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_account: e.target.value }))}
                    placeholder="Número de cuenta completo"
                  />
                </div>

                <div>
                  <Label>CBU/CVU</Label>
                  <Input
                    value={formData.bank_cbu}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_cbu: e.target.value }))}
                    placeholder="CBU o CVU de 22 dígitos"
                  />
                </div>

                <div>
                  <Label>Alias</Label>
                  <Input
                    value={formData.bank_alias}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_alias: e.target.value }))}
                    placeholder="Alias de transferencia"
                  />
                </div>

                <div>
                  <Label>Titular de la Cuenta</Label>
                  <Input
                    value={formData.bank_account_holder}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_account_holder: e.target.value }))}
                    placeholder="Nombre completo del titular"
                  />
                </div>
              </div>
            </div>

            {/* Imagen */}
            <div>
              <h3 className="font-semibold mb-3">Imagen del Refugio</h3>
              <div>
                <Label>URL de la Imagen</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="Vista previa"
                      className="h-32 w-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = '';
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setShowEditDialog(false);
              setSelectedRefugio(null);
              resetFormData();
            }}>
              Cancelar
            </Button>
            <Button
              onClick={showCreateDialog ? handleSaveCreate : handleSaveEdit}
              disabled={!formData.name.trim()}
            >
              {showCreateDialog ? 'Crear Refugio' : 'Actualizar Refugio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar Refugio?</DialogTitle>
          </DialogHeader>

          <p>
            ¿Estás seguro que deseas eliminar el refugio "{selectedRefugio?.name}"? Esta acción no se puede deshacer.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Mascotas */}
      <Dialog open={showPetsModal} onOpenChange={setShowPetsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mascotas del Refugio</DialogTitle>
          </DialogHeader>
          {selectedRefugio && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Refugio: <strong>{selectedRefugio.name}</strong>
                </p>
                <Button
                  onClick={() => handleAddPet({})}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Mascota
                </Button>
              </div>

              {selectedRefugio.mascotas && countMascotas(selectedRefugio.mascotas) > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Aquí se mostrarían las mascotas */}
                  <p className="col-span-2 text-center text-gray-500 py-8">
                    Gestión de mascotas próximamente...
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No hay mascotas registradas</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPetsModal(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Causas Urgentes */}
      <Dialog open={showCausesModal} onOpenChange={setShowCausesModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Causas Urgentes del Refugio</DialogTitle>
          </DialogHeader>
          {selectedRefugio && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Refugio: <strong>{selectedRefugio.name}</strong>
                </p>
                <Button
                  onClick={handleAddCause}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Causa
                </Button>
              </div>

              {selectedRefugio.causas_urgentes && countCausasUrgentes(selectedRefugio.causas_urgentes) > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Aquí se mostrarían las causas */}
                  <p className="col-span-2 text-center text-gray-500 py-8">
                    Gestión de causas urgentes próximamente...
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No hay causas urgentes registradas</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCausesModal(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Donaciones */}
      <Dialog open={showDonationsModal} onOpenChange={setShowDonationsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Donaciones del Refugio</DialogTitle>
          </DialogHeader>
          {selectedRefugio && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Refugio: <strong>{selectedRefugio.name}</strong>
                </p>
                <Button
                  onClick={handleAddDonation}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Donación
                </Button>
              </div>

              {selectedRefugio.donation_payments && selectedRefugio.donation_payments.length > 0 ? (
                <div className="space-y-4">
                  {/* Aquí se mostrarían las donaciones */}
                  <p className="text-center text-gray-500 py-8">
                    Gestión de donaciones próximamente...
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No hay donaciones registradas</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDonationsModal(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Agregar Causa */}
      <Dialog open={showAddCauseModal} onOpenChange={setShowAddCauseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar Causa Urgente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre de la Causa</Label>
              <Input placeholder="Ej: Operación de emergencia" />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea placeholder="Describe la causa urgentemente..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Monto Requerido</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div>
                <Label>Fecha Límite</Label>
                <Input type="date" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCauseModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => handleSaveCause({})}>
              Guardar Causa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Agregar Donación */}
      <Dialog open={showAddDonationModal} onOpenChange={setShowAddDonationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Donación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Donante</Label>
              <Input placeholder="Nombre del donante" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Monto</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div>
                <Label>Método de Pago</Label>
                <select className="w-full px-3 py-2 border rounded-lg bg-white">
                  <option value="">Seleccionar método</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="mercado_pago">MercadoPago</option>
                  <option value="efectivo">Efectivo</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea placeholder="Notas adicionales sobre la donación..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDonationModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => handleSaveDonation({})}>
              Registrar Donación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RefugiosPage;