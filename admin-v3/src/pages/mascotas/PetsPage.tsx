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
  Heart,
  ToggleLeft,
  ToggleRight,
  Star,
  StarOff,
  Eye,
  Camera,
  PawPrint,
  Ban,
  CheckCircle,
} from 'lucide-react';
import { petsService, supabaseAdmin } from '@/services/supabase';
import { Pet, CreatePetData, UpdatePetData } from '@/types';
import { formatDate, formatDateTime, formatCurrency } from '@/utils/formatters';
import toast from 'react-hot-toast';

const species = ['perro', 'gato', 'ave', 'roedor', 'reptil', 'otro'];
const petInterests = [
  'Juguetón', 'Tranquilo', 'Energético', 'Sociable', 'Independiente',
  'Amigable con niños', 'Amigable con otros animales', 'Casa con jardín',
  'Paseos largos', 'Cama', 'Cuidado básico', 'Entrenamiento'
];

export function PetsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [ownerSearchTerm, setOwnerSearchTerm] = useState('');
  const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState(false);
  const [isFeaturedDialogOpen, setIsFeaturedDialogOpen] = useState(false);
  const [selectedFeaturedPet, setSelectedFeaturedPet] = useState<Pet | null>(null);
  const [featuredUntilDate, setFeaturedUntilDate] = useState('');
  const [formData, setFormData] = useState<CreatePetData & { owner_id: string }>({
    name: '',
    species: 'perro',
    breed: '',
    age: '',
    description: '',
    owner_id: '',
  });

  const queryClient = useQueryClient();

  const { data: pets, isLoading, error } = useQuery({
    queryKey: ['pets'],
    queryFn: petsService.getAll,
  });

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: petsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Mascota creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear mascota');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdatePetData }) =>
      petsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setIsEditDialogOpen(false);
      setSelectedPet(null);
      toast.success('Mascota actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar mascota');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: petsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Mascota eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar mascota');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      petsService.update(id, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Estado de la mascota actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar estado');
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      petsService.update(id, {
        featured: isFeatured,
        featured_until: isFeatured ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Estado destacado actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar estado destacado');
    },
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, isSuspended }: { id: string; isSuspended: boolean }) =>
      petsService.update(id, {
        is_active: !isSuspended,
        deactivated_by_downgrade: isSuspended,
        show_in_petomatch: !isSuspended
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Estado de suspensión actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar suspensión');
    },
  });

  const updateFeaturedDateMutation = useMutation({
    mutationFn: ({ id, featuredUntil, isFeatured }: { id: string; featuredUntil: string | null; isFeatured: boolean }) =>
      petsService.update(id, {
        featured: isFeatured,
        featured_until: featuredUntil
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Fecha de destacado actualizada');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar fecha de destacado');
    },
  });

  const adminSuspendMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      petsService.update(id, {
        is_active: false,
        suspended_by_admin: true,
        suspension_reason: reason,
        show_in_petomatch: false,
        featured: false
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Mascota suspendida administrativamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al suspender mascota');
    },
  });

  const adminReactivateMutation = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      petsService.update(id, {
        is_active: true,
        suspended_by_admin: false,
        suspension_reason: null,
        show_in_petomatch: true
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Mascota reactivada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al reactivar mascota');
    },
  });

  const filteredPets = pets?.filter(pet =>
    pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.species?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const resetForm = () => {
    setFormData({
      name: '',
      species: 'perro',
      breed: '',
      age: '',
      description: '',
      owner_id: '',
    });
    setOwnerSearchTerm('');
  };

  const filteredProfiles = Array.isArray(profiles) ? profiles.filter(profile =>
    (profile.full_name?.toLowerCase().includes(ownerSearchTerm.toLowerCase()) ||
    profile.email?.toLowerCase().includes(ownerSearchTerm.toLowerCase()))
  ) : [];

  const handleCreatePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.species || !formData.owner_id) {
      toast.error('Por favor completa los campos requeridos (nombre, especie y dueño)');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEditPet = (pet: Pet) => {
    setSelectedPet(pet);
    setFormData({
      name: pet.name || '',
      species: pet.species || '',
      breed: pet.breed || '',
      age: pet.age || '',
      description: pet.description || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet || !formData.name || !formData.species) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }
    updateMutation.mutate({
      id: selectedPet.id,
      updates: formData,
    });
  };

  const handleDeletePet = (petId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta mascota?')) {
      deleteMutation.mutate(petId);
    }
  };

  const handleToggleActive = (pet: Pet) => {
    toggleActiveMutation.mutate({
      id: pet.id,
      isActive: !pet.is_active,
    });
  };

  const handleToggleFeatured = (pet: Pet) => {
    toggleFeaturedMutation.mutate({
      id: pet.id,
      isFeatured: !pet.featured,
    });
  };

  const handleManageFeatured = (pet: Pet) => {
    setSelectedFeaturedPet(pet);
    if (pet.featured_until) {
      // Formatear la fecha para el input datetime-local
      const date = new Date(pet.featured_until);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      setFeaturedUntilDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      // Por defecto, 30 días desde ahora
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const year = futureDate.getFullYear();
      const month = String(futureDate.getMonth() + 1).padStart(2, '0');
      const day = String(futureDate.getDate()).padStart(2, '0');
      const hours = String(futureDate.getHours()).padStart(2, '0');
      const minutes = String(futureDate.getMinutes()).padStart(2, '0');
      setFeaturedUntilDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
    setIsFeaturedDialogOpen(true);
  };

  const handleUpdateFeaturedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeaturedPet) return;

    updateFeaturedDateMutation.mutate({
      id: selectedFeaturedPet.id,
      featuredUntil: featuredUntilDate ? new Date(featuredUntilDate).toISOString() : null,
      isFeatured: true
    });

    setIsFeaturedDialogOpen(false);
    setSelectedFeaturedPet(null);
    setFeaturedUntilDate('');
  };

  const handleSuspendPet = (pet: Pet) => {
    const isSuspended = !pet.is_active || pet.deactivated_by_downgrade;
    const action = isSuspended ? 'reanudar' : 'suspender';

    if (window.confirm(`¿Estás seguro de que quieres ${action} esta mascota?`)) {
      suspendMutation.mutate({
        id: pet.id,
        isSuspended: !isSuspended,
      });
    }
  };

  const handleAdminSuspend = (pet: Pet) => {
    const reason = prompt('¿Cuál es el motivo de la suspensión administrativa? (Ej: Contenido inapropiado, Violación de términos, etc.)');

    if (reason && reason.trim()) {
      adminSuspendMutation.mutate({
        id: pet.id,
        reason: reason.trim()
      });
    } else if (reason !== null) {
      toast.error('Debes proporcionar una razón para la suspensión administrativa');
    }
  };

  const handleAdminReactivate = (pet: Pet) => {
    if (window.confirm(`¿Estás seguro de que quieres reactivar ${pet.name}? Esta acción eliminará la suspensión administrativa.`)) {
      adminReactivateMutation.mutate({
        id: pet.id
      });
    }
  };

  const handleViewImages = (pet: Pet) => {
    const images = [];

    // Imagen principal
    if (pet.image_url) {
      images.push({ url: pet.image_url, name: `${pet.name} - Principal` });
    }

    // Imágenes adicionales del array
    if (pet.images && Array.isArray(pet.images)) {
      pet.images.forEach((img, index) => {
        if (img && img !== pet.image_url) {
          images.push({ url: img, name: `${pet.name} - ${index + 1}` });
        }
      });
    }

    if (images.length > 0) {
      setSelectedImage(images[0]);
      setCurrentImageIndex(0);
      setIsImageViewerOpen(true);
    } else {
      toast.error('Esta mascota no tiene imágenes');
    }
  };

  const handleNextImage = () => {
    const images = [];
    if (selectedPet?.image_url) images.push(selectedPet.image_url);
    if (selectedPet?.images && Array.isArray(selectedPet.images)) {
      selectedPet.images.forEach(img => {
        if (img && img !== selectedPet.image_url) images.push(img);
      });
    }

    if (images.length > 0) {
      const nextIndex = (currentImageIndex + 1) % images.length;
      setCurrentImageIndex(nextIndex);
      setSelectedImage({
        url: images[nextIndex],
        name: `${selectedPet?.name} - ${nextIndex + 1}`
      });
    }
  };

  const handlePreviousImage = () => {
    const images = [];
    if (selectedPet?.image_url) images.push(selectedPet.image_url);
    if (selectedPet?.images && Array.isArray(selectedPet.images)) {
      selectedPet.images.forEach(img => {
        if (img && img !== selectedPet.image_url) images.push(img);
      });
    }

    if (images.length > 0) {
      const prevIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
      setCurrentImageIndex(prevIndex);
      setSelectedImage({
        url: images[prevIndex],
        name: `${selectedPet?.name} - ${prevIndex + 1}`
      });
    }
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
          <span>Error al cargar las mascotas</span>
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
            Gestión de Mascotas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra las mascotas registradas en la plataforma
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <div>
              <Button
                className="mt-4 sm:mt-0"
                disabled={profilesLoading || !Array.isArray(profiles) || profiles.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Mascota
              </Button>
              {(!Array.isArray(profiles) || profiles.length === 0) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  No hay usuarios disponibles para asignar mascotas
                </p>
              )}
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Mascota</DialogTitle>
              <DialogDescription>
                Registra una nueva mascota asignándola a un usuario existente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePet}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="owner_id" className="text-right pt-2">
                    Dueño
                  </Label>
                  <div className="col-span-3 relative">
                    <Input
                      id="owner_id"
                      type="text"
                      placeholder="Buscar dueño por nombre o email..."
                      value={ownerSearchTerm}
                      onChange={(e) => {
                        setOwnerSearchTerm(e.target.value);
                        setIsOwnerDropdownOpen(true);
                        // Si seleccionamos un perfil y luego cambiamos la búsqueda, limpiar la selección
                        if (formData.owner_id && !filteredProfiles.some(p => p.id === formData.owner_id)) {
                          setFormData({ ...formData, owner_id: '' });
                        }
                      }}
                      onFocus={() => setIsOwnerDropdownOpen(true)}
                      onBlur={() => {
                        // Cerrar el dropdown después de un pequeño delay para permitir clics
                        setTimeout(() => setIsOwnerDropdownOpen(false), 200);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsOwnerDropdownOpen(false);
                        }
                      }}
                      className="w-full"
                      required
                    />
                    {filteredProfiles.length > 0 && ownerSearchTerm && isOwnerDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredProfiles.map((profile) => (
                          <div
                            key={profile.id}
                            onClick={() => {
                              setFormData({ ...formData, owner_id: profile.id });
                              setOwnerSearchTerm(profile.full_name || profile.email);
                              setIsOwnerDropdownOpen(false);
                            }}
                            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              formData.owner_id === profile.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="font-medium text-sm">
                              {profile.full_name || 'Sin nombre'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {profile.email}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {ownerSearchTerm && filteredProfiles.length === 0 && isOwnerDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          No se encontraron usuarios con "{ownerSearchTerm}"
                        </div>
                      </div>
                    )}
                    {!ownerSearchTerm && formData.owner_id && (
                      <div className="mt-1 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">
                              {profiles?.find(p => p.id === formData.owner_id)?.full_name || 'Usuario seleccionado'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {profiles?.find(p => p.id === formData.owner_id)?.email}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, owner_id: '' });
                              setOwnerSearchTerm('');
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="species" className="text-right">
                    Especie
                  </Label>
                  <select
                    id="species"
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    {species.map(species => (
                      <option key={species} value={species}>
                        {species.charAt(0).toUpperCase() + species.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="breed" className="text-right">
                    Raza
                  </Label>
                  <Input
                    id="breed"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="age" className="text-right">
                    Edad
                  </Label>
                  <Input
                    id="age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="col-span-3"
                    placeholder="Ej: 2 años, 6 meses"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right pt-2">
                    Descripción
                  </Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Describe el carácter, preferencias y cuidados especiales de la mascota..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creando...' : 'Registrar Mascota'}
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
            placeholder="Buscar mascotas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Pets Table */}
      <div className="admin-card">
        <div className="rounded-md border overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">Mascota</TableHead>
                  <TableHead className="min-w-[200px] hidden sm:table-cell">Propietario</TableHead>
                  <TableHead className="min-w-[100px]">Especie</TableHead>
                  <TableHead className="min-w-[150px]">Estado</TableHead>
                  <TableHead className="min-w-[100px]">Destacado</TableHead>
                  <TableHead className="min-w-[120px] hidden md:table-cell">Registrado</TableHead>
                  <TableHead className="text-right min-w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {filteredPets.map((pet) => (
                <TableRow key={pet.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                        onClick={() => handleViewImages(pet)}
                      >
                        {pet.image_url ? (
                          <img
                            src={pet.image_url}
                            alt={pet.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full flex items-center justify-center hidden">
                          <PawPrint className="w-6 h-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {pet.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {pet.breed || 'Sin raza'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate sm:hidden">
                          {pet.profiles?.full_name || 'Usuario no encontrado'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                      {pet.profiles?.full_name || 'Usuario no encontrado'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {pet.profiles?.email || pet.owner_id}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {pet.species}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        !pet.is_active
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {!pet.is_active ? 'Suspendida' : 'Activa'}
                      </span>
                      {pet.suspended_by_admin && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 whitespace-nowrap">
                          Suspensión
                        </span>
                      )}
                      {pet.deactivated_by_downgrade && !pet.suspended_by_admin && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 whitespace-nowrap">
                          Downgrade
                        </span>
                      )}
                      {pet.suspension_reason && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          Motivo: {pet.suspension_reason}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => pet.featured && handleManageFeatured(pet)}
                    >
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        pet.featured
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {pet.featured ? 'Destacada' : 'Normal'}
                      </span>
                      {pet.featured && pet.featured_until && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                          Hasta: {formatDate(pet.featured_until)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm whitespace-nowrap">{formatDate(pet.created_at)}</span>
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
                          onClick={() => handleViewImages(pet)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver imágenes
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditPet(pet)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(pet)}
                        >
                          {pet.is_active ? (
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
                          onClick={() => handleToggleFeatured(pet)}
                        >
                          {pet.featured ? (
                            <>
                              <StarOff className="mr-2 h-4 w-4" />
                              Quitar destacado
                            </>
                          ) : (
                            <>
                              <Star className="mr-2 h-4 w-4" />
                              Destacar
                            </>
                          )}
                        </DropdownMenuItem>
                        {pet.featured && (
                          <DropdownMenuItem
                            onClick={() => handleManageFeatured(pet)}
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Editar fecha de destacado
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleSuspendPet(pet)}
                        >
                          {!pet.is_active || pet.deactivated_by_downgrade ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Reanudar
                            </>
                          ) : (
                            <>
                              <Ban className="mr-2 h-4 w-4" />
                              Suspender
                            </>
                          )}
                        </DropdownMenuItem>
                        {pet.suspended_by_admin ? (
                          <DropdownMenuItem
                            onClick={() => handleAdminReactivate(pet)}
                            className="text-purple-600 dark:text-purple-400"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Reactivar (Admin)
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleAdminSuspend(pet)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Suspender Administrativamente
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeletePet(pet.id)}
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
          {filteredPets.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No se encontraron mascotas que coincidan con la búsqueda' : 'No hay mascotas registradas'}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Mascota</DialogTitle>
            <DialogDescription>
              Modifica la información de la mascota seleccionada.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePet}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_species" className="text-right">
                  Especie
                </Label>
                <select
                  id="edit_species"
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  {species.map(species => (
                    <option key={species} value={species}>
                      {species.charAt(0).toUpperCase() + species.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_breed" className="text-right">
                  Raza
                </Label>
                <Input
                  id="edit_breed"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_age" className="text-right">
                  Edad
                </Label>
                <Input
                  id="edit_age"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="col-span-3"
                  placeholder="Ej: 2 años, 6 meses"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit_description" className="text-right pt-2">
                  Descripción
                </Label>
                <textarea
                  id="edit_description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Describe el carácter, preferencias y cuidados especiales de la mascota..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Mascota'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.name}</DialogTitle>
          </DialogHeader>
          <div className="relative">
            {selectedImage && (
              <div className="flex flex-col items-center">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  className="max-w-full max-h-96 rounded-lg object-contain"
                />
                <div className="flex items-center justify-between w-full mt-4">
                  <Button
                    variant="outline"
                    onClick={handlePreviousImage}
                    className="flex items-center space-x-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Anterior</span>
                  </Button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Imagen {currentImageIndex + 1} de {
                      (() => {
                        const images = [];
                        if (selectedPet?.image_url) images.push(selectedPet.image_url);
                        if (selectedPet?.images && Array.isArray(selectedPet.images)) {
                          selectedPet.images.forEach(img => {
                            if (img && img !== selectedPet.image_url) images.push(img);
                          });
                        }
                        return images.length;
                      })()
                    }
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleNextImage}
                    className="flex items-center space-x-2"
                  >
                    <span>Siguiente</span>
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Featured Date Dialog */}
      <Dialog open={isFeaturedDialogOpen} onOpenChange={setIsFeaturedDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Gestionar Destacado</DialogTitle>
            <DialogDescription>
              {selectedFeaturedPet?.name} - {selectedFeaturedPet?.species}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateFeaturedDate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="featured_until" className="text-right">
                  Fecha y hora
                </Label>
                <Input
                  id="featured_until"
                  type="datetime-local"
                  value={featuredUntilDate}
                  onChange={(e) => setFeaturedUntilDate(e.target.value)}
                  className="col-span-3"
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
              {selectedFeaturedPet?.featured_until && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400 col-span-1">
                    Fecha actual:
                  </div>
                  <div className="col-span-3 text-sm">
                    {formatDateTime(selectedFeaturedPet.featured_until)}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right text-sm text-gray-500 dark:text-gray-400 col-span-1">
                  Estado:
                </div>
                <div className="col-span-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedFeaturedPet?.featured
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {selectedFeaturedPet?.featured ? 'Destacada' : 'Normal'}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFeaturedDialogOpen(false);
                  setSelectedFeaturedPet(null);
                  setFeaturedUntilDate('');
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateFeaturedDateMutation.isPending}
              >
                {updateFeaturedDateMutation.isPending ? 'Actualizando...' : 'Actualizar fecha'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  </div>
  );
}