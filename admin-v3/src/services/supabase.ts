import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { Profile, MembershipType, UserMembership, Product, Category, Order, Coupon, Banner, Event, Place, RedDeAyuda, Refugio } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'tu-anon-key';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Cliente para autenticación de usuarios (usa anon key)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Cliente para operaciones administrativas (usa service role key)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`
    }
  }
});

// Servicios específicos para cada tabla
export const profilesService = {
  async getAll() {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(profile: Partial<Database['public']['Tables']['profiles']['Insert']>) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const petsService = {
  async getAll() {
    const { data, error } = await supabaseAdmin
      .from('pets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Obtener información de perfiles por separado
    const petsWithProfiles = await Promise.all(
      data.map(async (pet) => {
        try {
          const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('full_name, email')
            .eq('id', pet.owner_id)
            .single();

          if (profileError) {
            console.warn(`No se encontró perfil para la mascota ${pet.id}:`, profileError);
            return {
              ...pet,
              profiles: { full_name: 'Usuario no encontrado', email: pet.owner_id }
            };
          }

          return {
            ...pet,
            profiles: profile
          };
        } catch (error) {
          console.warn(`Error obteniendo perfil para mascota ${pet.id}:`, error);
          return {
            ...pet,
            profiles: { full_name: 'Error al cargar', email: pet.owner_id }
          };
        }
      })
    );

    return petsWithProfiles;
  },

  async getById(id: string) {
    const { data: pet, error } = await supabaseAdmin
      .from('pets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Obtener información del perfil
    try {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('full_name, email')
        .eq('id', pet.owner_id)
        .single();

      if (profileError) {
        console.warn(`No se encontró perfil para la mascota ${pet.id}:`, profileError);
        return {
          ...pet,
          profiles: { full_name: 'Usuario no encontrado', email: pet.owner_id }
        };
      }

      return {
        ...pet,
        profiles: profile
      };
    } catch (error) {
      console.warn(`Error obteniendo perfil para mascota ${pet.id}:`, error);
      return {
        ...pet,
        profiles: { full_name: 'Error al cargar', email: pet.owner_id }
      };
    }
  },

  async create(pet: any) {
    const { data, error } = await supabaseAdmin
      .from('pets')
      .insert(pet)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from('pets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabaseAdmin
      .from('pets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const membershipTypesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('membership_types')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('membership_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(membershipType: any) {
    const { data, error } = await supabase
      .from('membership_types')
      .insert(membershipType)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('membership_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('membership_types')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const userMembershipsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('user_memberships')
      .select(`
        *,
        profiles!user_memberships_user_id_fkey (
          full_name,
          email
        ),
        membership_types!user_memberships_membership_type_id_fkey (
          name,
          price
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('user_memberships')
      .select(`
        *,
        profiles!user_memberships_user_id_fkey (
          full_name,
          email
        ),
        membership_types!user_memberships_membership_type_id_fkey (
          name,
          price
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async cancelMembership(id: string) {
    const { data, error } = await supabase
      .from('user_memberships')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        is_active: false
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const productsService = {
  async getAll() {
    // Usamos consulta simple para obtener productos con categorías
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categorias_productos (
          id,
          nombre
        )
      `)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error fetching products with categories:', error);
      throw error;
    }

    // Transformamos los datos para compatibilidad
    return data?.map(product => ({
      ...product,
      image_url: product.imagenes && product.imagenes.length > 0 ? product.imagenes[0] : null,
      categoria_nombre: product.categorias_productos?.nombre
    })) || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categorias_productos (
          id,
          nombre
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Transformamos los datos para compatibilidad
    return {
      ...data,
      image_url: data.imagenes && data.imagenes.length > 0 ? data.imagenes[0] : null,
      categoria_nombre: data.categorias_productos?.nombre
    };
  },

  async create(product: any) {
    // Transformamos image_url a imagenes array si es necesario
    const productData = {
      ...product,
      imagenes: product.image_url ? [product.image_url] : []
    };

    // Eliminamos image_url del objeto final
    delete productData.image_url;

    const { data, error } = await supabase
      .from('productos')
      .insert(productData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    // Transformamos image_url a imagenes array si es necesario
    const updateData = { ...updates };

    if (updates.image_url !== undefined) {
      updateData.imagenes = updates.image_url ? [updates.image_url] : [];
      delete updateData.image_url;
    }

    const { data, error } = await supabase
      .from('productos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const categoriesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('categorias_productos')
      .select('*')
      .order('nombre');

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('categorias_productos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(category: any) {
    const { data, error } = await supabase
      .from('categorias_productos')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('categorias_productos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('categorias_productos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const ordersService = {
  async getAll() {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        clientes_tienda (
          nombre,
          apellido,
          email
        )
      `)
      .order('fecha_pedido', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        profiles!pedidos_user_id_fkey (
          full_name,
          email
        ),
        pedidos_items!pedidos_items_pedido_id_fkey (
          *,
          productos!pedidos_items_producto_id_fkey (
            name,
            price
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, estado: string) {
    const { data, error } = await supabase
      .from('pedidos')
      .update({ estado })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const couponsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('coupons')
      .select(`
        *,
        places!coupons_place_id_fkey (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('coupons')
      .select(`
        *,
        places!coupons_place_id_fkey (
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(coupon: any) {
    const { data, error } = await supabase
      .from('coupons')
      .insert(coupon)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const bannersService = {
  async getAll() {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('priority', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(banner: any) {
    const { data, error } = await supabase
      .from('banners')
      .insert(banner)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('banners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const eventsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(event: any) {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const placesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(place: any) {
    const { data, error } = await supabase
      .from('places')
      .insert(place)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('places')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('places')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const redDeAyudaService = {
  async getAll() {
    const { data, error } = await supabase
      .from('red_de_ayuda')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Obtener información de perfiles por separado con múltiples intentos
    const avisosWithProfiles = await Promise.all(
      data.map(async (aviso) => {
        let profile = null;
        let profileError = null;

        // Intento 1: Buscar en profiles por user_id
        try {
          const result = await supabase
            .from('profiles')
            .select('full_name, email, id')
            .eq('id', aviso.user_id)
            .single();
          profile = result.data;
          profileError = result.error;
        } catch (error) {
          profileError = error;
        }

        // Intento 2: Si no encuentra, buscar por auth.users usando RPC (si existe)
        if (!profile || profileError) {
          try {
            const { data: authUser } = await supabase
              .rpc('get_user_by_id', { user_id: aviso.user_id });

            if (authUser) {
              profile = {
                full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuario',
                email: authUser.email || 'N/A'
              };
            }
          } catch (error) {
            console.warn(`Intento 2 fallido para aviso ${aviso.id}:`, error);
          }
        }

        // Intento 3: Extraer nombre de metadatos del aviso si existe
        if (!profile && aviso.contacto) {
          const nombreFromContact = aviso.contacto.split(' ')[0];
          profile = {
            full_name: nombreFromContact || 'Usuario desconocido',
            email: aviso.contacto || 'N/A'
          };
        }

        // Si todo falla, usar valores por defecto pero más útiles
        if (!profile) {
          return {
            ...aviso,
            profiles: {
              full_name: `Usuario #${aviso.user_id.slice(-8)}`, // Mostrar ID corto
              email: aviso.contacto || 'N/A'
            }
          };
        }

        return {
          ...aviso,
          profiles: profile
        };
      })
    );

    return avisosWithProfiles;
  },

  async getById(id: string) {
    const { data: aviso, error } = await supabase
      .from('red_de_ayuda')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Usar la misma lógica de múltiples intentos
    let profile = null;
    let profileError = null;

    // Intento 1: Buscar en profiles por user_id
    try {
      const result = await supabase
        .from('profiles')
        .select('full_name, email, id')
        .eq('id', aviso.user_id)
        .single();
      profile = result.data;
      profileError = result.error;
    } catch (error) {
      profileError = error;
    }

    // Intento 2: Si no encuentra, buscar por auth.users
    if (!profile || profileError) {
      try {
        const { data: authUser } = await supabase
          .rpc('get_user_by_id', { user_id: aviso.user_id });

        if (authUser) {
          profile = {
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuario',
            email: authUser.email || 'N/A'
          };
        }
      } catch (error) {
        console.warn(`Intento 2 fallido para aviso ${aviso.id}:`, error);
      }
    }

    // Intento 3: Extraer nombre de metadatos del aviso
    if (!profile && aviso.contacto) {
      const nombreFromContact = aviso.contacto.split(' ')[0];
      profile = {
        full_name: nombreFromContact || 'Usuario desconocido',
        email: aviso.contacto || 'N/A'
      };
    }

    // Si todo falla, usar valores por defecto
    if (!profile) {
      return {
        ...aviso,
        profiles: {
          full_name: `Usuario #${aviso.user_id.slice(-8)}`,
          email: aviso.contacto || 'N/A'
        }
      };
    }

    return {
      ...aviso,
      profiles: profile
    };
  },

  async create(aviso: any) {
    const { data, error } = await supabase
      .from('red_de_ayuda')
      .insert(aviso)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('red_de_ayuda')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, estado: string) {
    const { data, error } = await supabase
      .from('red_de_ayuda')
      .update({ estado })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleDestacado(id: string, destacado: boolean, destacado_hasta?: string) {
    const { data, error } = await supabase
      .from('red_de_ayuda')
      .update({
        destacado,
        destacado_hasta: destacado ? destacado_hasta : null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('red_de_ayuda')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Dashboard statistics service
export const dashboardService = {
  async getStats() {
    try {
      // Función segura para obtener conteos
      const safeCount = async (table: string, filters = {}) => {
        try {
          let query = supabase.from(table).select('*', { count: 'exact', head: true });
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
          const { count, error } = await query;
          if (error) throw error;
          return count || 0;
        } catch (error) {
          console.warn(`Error counting ${table}:`, error);
          return 0;
        }
      };

      // Función segura para obtener datos recientes
      const safeSelect = async (table: string, columns = '*', limit = 5, order = 'created_at') => {
        try {
          const { data, error } = await supabase
            .from(table)
            .select(columns)
            .order(order, { ascending: false })
            .limit(limit);
          if (error) throw error;
          return data || [];
        } catch (error) {
          console.warn(`Error selecting from ${table}:`, error);
          return [];
        }
      };

      // Obtener conteos básicos que sabemos que existen
      const totalUsers = await safeCount('profiles');
      const activeUsers = await safeCount('profiles', { is_active: true });

      // Obtener usuarios recientes
      const recentUsers = await safeSelect('profiles', 'id, email, full_name, is_admin, is_active, created_at, last_seen');

      // Datos básicos para el resto (pueden ser 0 si las tablas no existen)
      const totalPets = await safeCount('pets');
      const activePets = await safeCount('pets', { is_active: true });
      const totalMemberships = await safeCount('user_memberships');
      const activeMemberships = await safeCount('user_memberships', { is_active: true });
      const totalOrders = await safeCount('pedidos');
      const totalEvents = await safeCount('events');
      const totalPlaces = await safeCount('places');
      const totalRedDeAyuda = await safeCount('red_de_ayuda');
      const activeRedDeAyuda = await safeCount('red_de_ayuda', { estado: 'activo' });
      const totalRefugios = await safeCount('refugios');

      // Intentar obtener ingresos (puede fallar si no hay pagos)
      let totalRevenue = 0;
      try {
        const { data: ordersData } = await supabase
          .from('pedidos')
          .select('total')
          .eq('estado_pago', 'pagado');

        totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      } catch (error) {
        console.warn('Error calculating revenue:', error);
      }

      // Intentar obtener datos recientes (simplificado sin joins)
      const recentOrders = await safeSelect('pedidos', 'id, total, estado, fecha_pedido');
      const recentRedDeAyuda = await safeSelect('red_de_ayuda', 'id, nombre, tipo_aviso, especie, estado, created_at');

      return {
        totalUsers,
        activeUsers,
        totalPets,
        activePets,
        totalMemberships,
        activeMemberships,
        totalOrders,
        totalRevenue,
        totalEvents,
        totalPlaces,
        totalRedDeAyuda,
        activeRedDeAyuda,
        totalRefugios,
        recentUsers,
        recentOrders,
        recentRedDeAyuda
      };
    } catch (error) {
      console.error('Error in dashboardService.getStats():', error);
      // Retornar datos básicos en caso de error general
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalPets: 0,
        activePets: 0,
        totalMemberships: 0,
        activeMemberships: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalEvents: 0,
        totalPlaces: 0,
        totalRedDeAyuda: 0,
        activeRedDeAyuda: 0,
        totalRefugios: 0,
        recentUsers: [],
        recentOrders: [],
        recentRedDeAyuda: []
      };
    }
  }
};

// Servicio extendido para analíticas
export const analyticsService = {
  async getDetailedStats(period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // month
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const startDateStr = startDate.toISOString();

    try {
      // Estadísticas básicas del período
      const [
        { count: newUsers },
        { count: newPets },
        { count: newOrders },
        { count: newMemberships },
        { count: newEvents },
        { count: newPlaces },
        { count: newRedDeAyuda },
        { count: newRefugios }
      ] = await Promise.all([
        supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', startDateStr),
        supabaseAdmin.from('pets').select('id', { count: 'exact', head: true }).gte('created_at', startDateStr),
        supabaseAdmin.from('pedidos').select('id', { count: 'exact', head: true }).gte('fecha_pedido', startDateStr),
        supabaseAdmin.from('user_memberships').select('id', { count: 'exact', head: true }).gte('created_at', startDateStr),
        supabaseAdmin.from('events').select('id', { count: 'exact', head: true }).gte('created_at', startDateStr),
        supabaseAdmin.from('places').select('id', { count: 'exact', head: true }).gte('created_at', startDateStr),
        supabaseAdmin.from('red_de_ayuda').select('id', { count: 'exact', head: true }).gte('created_at', startDateStr),
        supabaseAdmin.from('refugios').select('id', { count: 'exact', head: true }).gte('created_at', startDateStr)
      ]);

      // Ingresos del período
      let periodRevenue = 0;
      try {
        const { data: periodOrders } = await supabaseAdmin
          .from('pedidos')
          .select('total')
          .gte('fecha_pedido', startDateStr)
          .eq('estado_pago', 'pagado');

        periodRevenue = periodOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      } catch (error) {
        console.warn('Error calculating period revenue:', error);
      }

      // Estadísticas por categorías
      const [placesByCategory, eventsByType, redDeAyudaByType, petsByType] = await Promise.all([
        this.getPlacesByCategory(),
        this.getEventsByType(),
        this.getRedDeAyudaByType(),
        this.getPetsByType()
      ]);

      // Estadísticas de membresías
      const membershipStats = await this.getMembershipStats();

      // Estadísticas de adopciones de refugios
      const adoptionStats = await this.getAdoptionStats();

      // Actividad reciente
      const recentActivity = await this.getRecentActivity();

      return {
        period: {
          newUsers: newUsers || 0,
          newPets: newPets || 0,
          newOrders: newOrders || 0,
          newMemberships: newMemberships || 0,
          newEvents: newEvents || 0,
          newPlaces: newPlaces || 0,
          newRedDeAyuda: newRedDeAyuda || 0,
          newRefugios: newRefugios || 0,
          revenue: periodRevenue
        },
        categories: {
          places: placesByCategory,
          events: eventsByType,
          redDeAyuda: redDeAyudaByType,
          pets: petsByType
        },
        memberships: membershipStats,
        adoptions: adoptionStats,
        recentActivity
      };
    } catch (error) {
      console.error('Error in analyticsService.getDetailedStats():', error);
      throw error;
    }
  },

  async getPlacesByCategory() {
    try {
      const { data, error } = await supabaseAdmin
        .from('places')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;

      const categories = data?.reduce((acc: Record<string, number>, place) => {
        acc[place.category] = (acc[place.category] || 0) + 1;
        return acc;
      }, {}) || {};

      return categories;
    } catch (error) {
      console.warn('Error getting places by category:', error);
      return {};
    }
  },

  async getEventsByType() {
    try {
      const { data, error } = await supabaseAdmin
        .from('events')
        .select('event_type')
        .not('event_type', 'is', null);

      if (error) throw error;

      const types = data?.reduce((acc: Record<string, number>, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {}) || {};

      return types;
    } catch (error) {
      console.warn('Error getting events by type:', error);
      return {};
    }
  },

  async getRedDeAyudaByType() {
    try {
      const { data, error } = await supabaseAdmin
        .from('red_de_ayuda')
        .select('tipo_aviso')
        .not('tipo_aviso', 'is', null);

      if (error) throw error;

      const types = data?.reduce((acc: Record<string, number>, aviso) => {
        acc[aviso.tipo_aviso] = (acc[aviso.tipo_aviso] || 0) + 1;
        return acc;
      }, {}) || {};

      return types;
    } catch (error) {
      console.warn('Error getting red de ayuda by type:', error);
      return {};
    }
  },

  async getPetsByType() {
    try {
      const { data, error } = await supabaseAdmin
        .from('pets')
        .select('type')
        .not('type', 'is', null);

      if (error) throw error;

      const types = data?.reduce((acc: Record<string, number>, pet) => {
        acc[pet.type] = (acc[pet.type] || 0) + 1;
        return acc;
      }, {}) || {};

      return types;
    } catch (error) {
      console.warn('Error getting pets by type:', error);
      return {};
    }
  },

  async getMembershipStats() {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_memberships')
        .select('membership_type_id, is_active')
        .not('membership_type_id', 'is', null);

      if (error) throw error;

      const stats = data?.reduce((acc: any, membership) => {
        const typeKey = membership.membership_type_id;
        if (!acc[typeKey]) {
          acc[typeKey] = { total: 0, active: 0 };
        }
        acc[typeKey].total++;
        if (membership.is_active) {
          acc[typeKey].active++;
        }
        return acc;
      }, {}) || {};

      return stats;
    } catch (error) {
      console.warn('Error getting membership stats:', error);
      return {};
    }
  },

  async getAdoptionStats() {
    try {
      const { data, error } = await supabaseAdmin
        .from('refugios')
        .select('adoption_count, capacity, current_animals');

      if (error) throw error;

      const totalAdoptions = data?.reduce((sum, refugio) => sum + (refugio.adoption_count || 0), 0) || 0;
      const totalCapacity = data?.reduce((sum, refugio) => sum + (refugio.capacity || 0), 0) || 0;
      const totalCurrentAnimals = data?.reduce((sum, refugio) => sum + (refugio.current_animals || 0), 0) || 0;
      const averageOccupancy = totalCapacity > 0 ? Math.round((totalCurrentAnimals / totalCapacity) * 100) : 0;

      return {
        totalAdoptions,
        totalCapacity,
        totalCurrentAnimals,
        averageOccupancy,
        totalRefugios: data?.length || 0
      };
    } catch (error) {
      console.warn('Error getting adoption stats:', error);
      return {
        totalAdoptions: 0,
        totalCapacity: 0,
        totalCurrentAnimals: 0,
        averageOccupancy: 0,
        totalRefugios: 0
      };
    }
  },

  async getRecentActivity() {
    try {
      const activities = [];

      // Usuarios recientes
      const { data: recentUsers } = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentUsers) {
        recentUsers.forEach(user => {
          activities.push({
            id: `user_${user.id}`,
            type: 'user',
            title: 'Nuevo usuario registrado',
            description: `${user.first_name} ${user.last_name}`,
            timestamp: user.created_at,
            icon: 'user'
          });
        });
      }

      // Pedidos recientes
      const { data: recentOrders } = await supabaseAdmin
        .from('pedidos')
        .select('id, total, estado, fecha_pedido')
        .order('fecha_pedido', { ascending: false })
        .limit(5);

      if (recentOrders) {
        recentOrders.forEach(order => {
          activities.push({
            id: `order_${order.id}`,
            type: 'order',
            title: 'Nuevo pedido',
            description: `$${order.total} - ${order.estado}`,
            timestamp: order.fecha_pedido,
            icon: 'shopping-cart'
          });
        });
      }

      // Avisos recientes de Red de Ayuda
      const { data: recentAvisos } = await supabaseAdmin
        .from('red_de_ayuda')
        .select('id, nombre, tipo_aviso, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentAvisos) {
        recentAvisos.forEach(aviso => {
          activities.push({
            id: `aviso_${aviso.id}`,
            type: 'aviso',
            title: `Nuevo ${aviso.tipo_aviso}`,
            description: aviso.nombre,
            timestamp: aviso.created_at,
            icon: 'help-circle'
          });
        });
      }

      // Ordenar por timestamp
      return activities.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 10);
    } catch (error) {
      console.warn('Error getting recent activity:', error);
      return [];
    }
  },

  async getGrowthMetrics(period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
        break;
      default: // month
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    }

    try {
      const [currentPeriod, previousPeriod] = await Promise.all([
        this.getPeriodStats(startDate),
        this.getPeriodStats(previousStartDate, startDate)
      ]);

      return {
        users: this.calculateGrowth(currentPeriod.users, previousPeriod.users),
        pets: this.calculateGrowth(currentPeriod.pets, previousPeriod.pets),
        orders: this.calculateGrowth(currentPeriod.orders, previousPeriod.orders),
        revenue: this.calculateGrowth(currentPeriod.revenue, previousPeriod.revenue)
      };
    } catch (error) {
      console.error('Error getting growth metrics:', error);
      return {
        users: { current: 0, previous: 0, growth: 0 },
        pets: { current: 0, previous: 0, growth: 0 },
        orders: { current: 0, previous: 0, growth: 0 },
        revenue: { current: 0, previous: 0, growth: 0 }
      };
    }
  },

  async getPeriodStats(startDate: Date, endDate?: Date) {
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate?.toISOString();

    const query = endDateStr
      ? (table: string) => supabaseAdmin.from(table).select('id', { count: 'exact', head: true }).gte('created_at', startDateStr).lt('created_at', endDateStr)
      : (table: string) => supabaseAdmin.from(table).select('id', { count: 'exact', head: true }).gte('created_at', startDateStr);

    try {
      const [
        { count: users },
        { count: pets },
        { count: orders }
      ] = await Promise.all([
        query('profiles'),
        query('pets'),
        query('pedidos')
      ]);

      let revenue = 0;
      try {
        const revenueQuery = endDateStr
          ? supabaseAdmin.from('pedidos').select('total').gte('fecha_pedido', startDateStr).lt('fecha_pedido', endDateStr).eq('estado_pago', 'pagado')
          : supabaseAdmin.from('pedidos').select('total').gte('fecha_pedido', startDateStr).eq('estado_pago', 'pagado');

        const { data: revenueData } = await revenueQuery;
        revenue = revenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      } catch (error) {
        console.warn('Error calculating period revenue:', error);
      }

      return {
        users: users || 0,
        pets: pets || 0,
        orders: orders || 0,
        revenue
      };
    } catch (error) {
      console.error('Error getting period stats:', error);
      return { users: 0, pets: 0, orders: 0, revenue: 0 };
    }
  },

  calculateGrowth(current: number, previous: number) {
    const growth = previous === 0 ? 0 : ((current - previous) / previous) * 100;
    return {
      current,
      previous,
      growth: Math.round(growth * 10) / 10
    };
  }
};

// Servicio para notificaciones
export const notificationsService = {
  async getNotifications() {
    try {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match expected interface
      return (data || []).map(notification => ({
        ...notification,
        content: notification.message,
        channel: notification.metadata?.channel || 'in_app',
        target_audience: notification.metadata?.target_audience || 'all',
        scheduled_for: notification.metadata?.scheduled_for || null,
        sent_at: notification.metadata?.sent_at || null,
        status: notification.metadata?.status || 'draft',
        recipient_count: notification.metadata?.recipient_count || 0,
        open_count: notification.metadata?.open_count || 0,
        click_count: notification.metadata?.click_count || 0,
        specific_users: notification.metadata?.specific_users || []
      }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  },

  async getNotificationById(id: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Transform data to match expected interface
      return {
        ...data,
        content: data.message,
        channel: data.metadata?.channel || 'in_app',
        target_audience: data.metadata?.target_audience || 'all',
        scheduled_for: data.metadata?.scheduled_for || null,
        sent_at: data.metadata?.sent_at || null,
        status: data.metadata?.status || 'draft',
        recipient_count: data.metadata?.recipient_count || 0,
        open_count: data.metadata?.open_count || 0,
        click_count: data.metadata?.click_count || 0,
        specific_users: data.metadata?.specific_users || []
      };
    } catch (error) {
      console.error('Error getting notification by ID:', error);
      return null;
    }
  },

  async createNotification(notification: { title: string; content: string; type: string; channel: string; target_audience: string; scheduled_for?: string | null; specific_users?: string[] }) {
    try {
      // Obtener el usuario autenticado o usar un ID por defecto para notificaciones del sistema
      const { data: userData } = await supabaseAdmin.auth.getUser();
      const userId = userData.user?.id || '00000000-0000-0000-0000-000000000000'; // ID por defecto para notificaciones del sistema

      const { data, error } = await supabaseAdmin
        .from('notifications')
        .insert([{
          user_id: userId,
          title: notification.title,
          message: notification.content,
          type: notification.type,
          metadata: {
            channel: notification.channel,
            target_audience: notification.target_audience,
            scheduled_for: notification.scheduled_for,
            specific_users: notification.specific_users || [],
            status: notification.scheduled_for ? 'scheduled' : 'draft',
            recipient_count: 0,
            open_count: 0,
            click_count: 0
          }
        }])
        .select()
        .single();

      if (error) throw error;

      return this.getNotificationById(data.id);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  async updateNotification(id: string, notification: Partial<{ title: string; content: string; type: string; channel: string; target_audience: string; scheduled_for?: string | null; updated_at: string }>) {
    try {
      const currentNotification = await this.getNotificationById(id);
      if (!currentNotification) throw new Error('Notificación no encontrada');

      const updateData: any = {
        title: notification.title,
        message: notification.content,
        type: notification.type,
        metadata: {
          ...currentNotification,
          channel: notification.channel,
          target_audience: notification.target_audience,
          scheduled_for: notification.scheduled_for,
          status: currentNotification.status,
          recipient_count: currentNotification.recipient_count,
          open_count: currentNotification.open_count,
          click_count: currentNotification.click_count
        }
      };

      const { data, error } = await supabaseAdmin
        .from('notifications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.getNotificationById(data.id);
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  },

  async deleteNotification(id: string) {
    try {
      const { error } = await supabaseAdmin
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  async sendNotification(notificationId: string) {
    try {
      // Primero obtenemos los detalles de la notificación
      const notification = await this.getNotificationById(notificationId);
      if (!notification) {
        throw new Error('Notificación no encontrada');
      }

      // Actualizamos el estado a "sending" via metadata
      await this.updateNotificationStatus(notificationId, 'sending');

      // Obtenemos los usuarios reales según la audiencia
      const targetUsers = await this.getTargetUsers(notification.target_audience, notification.specific_users);

      // Enviamos la notificación según el canal
      let sendResult;
      let recipientCount = 0;

      switch (notification.channel) {
        case 'email':
          const emailRecipients = targetUsers.map(user => user.email);
          sendResult = await this.sendEmailNotification(notification, emailRecipients);
          recipientCount = emailRecipients.length;
          break;

        case 'push':
          // SOLUCIÓN: Para push notifications, creamos notificaciones individuales como in-app
          // El trigger universal se encargará de enviar a los usuarios correctos
          // NO llamamos directamente a sendPushNotification para evitar duplicados
          await this.createIndividualNotifications(notification, targetUsers);
          // El trigger universal enviará las push notifications automáticamente
          sendResult = { success: true, message: 'Push notifications enviadas por trigger universal' };
          recipientCount = targetUsers.length;
          break;

        case 'in_app':
          // Para in-app notifications, creamos notificaciones individuales para cada usuario
          await this.createIndividualNotifications(notification, targetUsers);
          sendResult = await this.sendInAppNotification(notification, targetUsers);
          recipientCount = targetUsers.length;
          break;

        case 'sms':
          const phoneNumbers = targetUsers.map(user => user.phone || user.email);
          sendResult = await this.sendSMSNotification(notification, phoneNumbers);
          recipientCount = phoneNumbers.length;
          break;

        default:
          throw new Error('Canal de notificación no soportado');
      }

      // Actualizamos el estado final
      const finalStatus = sendResult.success ? 'sent' : 'failed';
      await this.updateNotificationWithStats(notificationId, {
        status: finalStatus,
        sent_at: sendResult.success ? new Date().toISOString() : null,
        recipient_count: recipientCount,
        open_count: 0,
        click_count: 0
      });

      return {
        success: sendResult.success,
        message: sendResult.message,
        recipientCount,
        finalStatus
      };
    } catch (error) {
      console.error('Error sending notification:', error);

      // Actualizamos el estado a failed
      await this.updateNotificationStatus(notificationId, 'failed').catch(console.error);

      return {
        success: false,
        message: error.message || 'Error al enviar la notificación',
        recipientCount: 0,
        finalStatus: 'failed'
      };
    }
  },

  async getTargetUsers(targetAudience: string, specificUsers?: string[]) {
    // Usamos la misma lógica que getRecipients pero mantenemos el nombre de la función
    return await this.getRecipients(targetAudience, specificUsers);
  },

  async createAdminNotification(notification: any, targetUsers: any[]) {
    try {
      console.log('🔔 Creating single admin notification for', targetUsers.length, 'users');

      // Crear una sola notificación de administración que el trigger universal procesará
      const adminNotification = {
        user_id: '00000000-0000-0000-0000-000000000000', // ID especial para notificaciones de admin
        title: notification.title,
        message: notification.content,
        type: notification.type,
        metadata: {
          ...notification.metadata,
          from_admin: true,
          target_audience: notification.target_audience,
          specific_users: targetUsers.map(user => user.email),
          recipient_count: targetUsers.length,
          original_notification_id: notification.id
        },
        read: false
      };

      console.log('📝 Admin notification data:', adminNotification);

      // Usar API REST directa para insertar una sola notificación
      const response = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceRoleKey,
          'Authorization': `Bearer ${supabaseServiceRoleKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(adminNotification)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error creating admin notification via REST:', response.status, errorText);
        throw new Error('Error creating admin notification');
      }

      console.log('✅ Successfully created admin notification, trigger will send to', targetUsers.length, 'users');
    } catch (error) {
      console.error('Error creating admin notification:', error);
      throw error;
    }
  },

  async createIndividualNotifications(notification: any, targetUsers: any[]) {
    try {
      console.log('🔄 Creating individual notifications for', targetUsers.length, 'users');

      const notificationsToCreate = targetUsers.map(user => ({
        user_id: user.id,
        title: notification.title,
        message: notification.content,
        type: notification.type,
        metadata: {
          ...notification.metadata,
          from_admin: true,
          original_notification_id: notification.id
        },
        read: false
      }));

      console.log('📝 Notifications to create:', notificationsToCreate.length);

      if (notificationsToCreate.length > 0) {
        let createdCount = 0;

        // MODIFICADO: Insertar una por una para evitar que el trigger se dispare múltiples veces por batch
        for (const notification of notificationsToCreate) {
          try {
            const response = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
              method: 'POST',
              headers: {
                'apikey': supabaseServiceRoleKey,
                'Authorization': `Bearer ${supabaseServiceRoleKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify(notification)
            });

            if (response.ok) {
              createdCount++;
            } else {
              console.error('❌ Error creating notification for user:', notification.user_id);
            }
          } catch (error) {
            console.error('❌ Error creating notification:', error);
          }
        }

        console.log('✅ Successfully created', createdCount, 'individual notifications');
      }

      return notificationsToCreate.length;
    } catch (error) {
      console.error('❌ Error creating individual notifications:', error);
      throw error;
    }
  },

  async updateNotificationStatus(id: string, status: string) {
    try {
      const { data } = await supabaseAdmin
        .from('notifications')
        .select('metadata')
        .eq('id', id)
        .single();

      if (data?.metadata) {
        await supabaseAdmin
          .from('notifications')
          .update({
            metadata: {
              ...data.metadata,
              status
            }
          })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  },

  async updateNotificationWithStats(id: string, stats: any) {
    try {
      console.log('📊 Updating notification stats:', stats);

      // Extraer campos directos de la tabla principal
      const { recipient_count, status, sent_at, open_count, click_count, ...metadataStats } = stats;

      // Construir el objeto de actualización
      const updateData: any = {
        metadata: metadataStats
      };

      // Agregar campos directos si existen
      if (recipient_count !== undefined) updateData.recipient_count = recipient_count;
      if (status !== undefined) updateData.status = status;
      if (sent_at !== undefined) updateData.sent_at = sent_at;
      if (open_count !== undefined) updateData.open_count = open_count;
      if (click_count !== undefined) updateData.click_count = click_count;

      console.log('📊 Final update data:', updateData);

      const { error } = await supabaseAdmin
        .from('notifications')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('❌ Error updating notification stats:', error);
        throw error;
      }

      console.log('✅ Notification stats updated successfully');
    } catch (error) {
      console.error('Error updating notification stats:', error);
      throw error;
    }
  },

  async getRecipients(targetAudience: string, specificUsers?: string[]) {
    try {
      console.log('🎯 Getting target users for audience:', targetAudience);

      let query = supabaseAdmin
        .from('profiles')
        .select('id, email, fcm_token, notifications_enabled');

      // Eliminamos el filtro is_active que puede no existir o tener valores nulos
      // y agregamos filtro para usuarios con tokens FCM válidos
      query = query.not('fcm_token', 'is', null);

      switch (targetAudience) {
        case 'all':
          // Obtenemos todos los usuarios con tokens FCM
          const { data: allUsers } = await query;
          console.log(`🎯 Found ${allUsers?.length || 0} users with FCM tokens`);
          return allUsers || [];

        case 'users':
          // Solo usuarios registrados (mismo filtro que all para notificaciones push)
          const { data: registeredUsers } = await query;
          console.log(`🎯 Found ${registeredUsers?.length || 0} registered users with FCM tokens`);
          return registeredUsers || [];

        case 'premium_users':
          // Usuarios con membresía activa y tokens FCM
          const { data: premiumUsers } = await supabaseAdmin
            .from('profiles')
            .select('id, email, fcm_token, notifications_enabled')
            .not('fcm_token', 'is', null)
            .eq('user_memberships.is_active', true)
            .join('user_memberships', 'profiles.id', 'user_memberships.user_id');
          console.log(`🎯 Found ${premiumUsers?.length || 0} premium users with FCM tokens`);
          return premiumUsers || [];

        case 'specific':
          // Usuarios específicos (convertir emails a IDs si es necesario)
          if (!specificUsers || specificUsers.length === 0) {
            console.log('🎯 No specific users provided');
            return [];
          }

          // Si specificUsers contiene emails, buscar IDs
          const { data: specificUsersData } = await supabaseAdmin
            .from('profiles')
            .select('id, email, fcm_token, notifications_enabled')
            .not('fcm_token', 'is', null)
            .in('email', specificUsers);
          console.log(`🎯 Found ${specificUsersData?.length || 0} specific users with FCM tokens`);
          return specificUsersData || [];

        default:
          console.log('🎯 Unknown audience type:', targetAudience);
          return [];
      }
    } catch (error) {
      console.error('Error getting recipients:', error);
      return [];
    }
  },

  async sendEmailNotification(notification: any, recipients: string[]) {
    try {
      // Simulación de envío de email
      console.log('Enviando email notification:', {
        title: notification.title,
        message: notification.content,
        recipients: recipients.length,
        type: notification.type
      });

      // Aquí iría la lógica real de envío de emails
      // Por ahora simulamos que se envía correctamente

      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulación de delay

      return {
        success: true,
        message: `Email enviado exitosamente a ${recipients.length} destinatarios`,
        sentCount: recipients.length
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        message: 'Error al enviar email',
        sentCount: 0
      };
    }
  },

  async sendPushNotification(notification: any, recipients: any[]) {
    try {
      console.log('🔔 Enviando push notifications reales:', {
        title: notification.title,
        message: notification.content,
        recipients: recipients.length,
        type: notification.type
      });

      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send_notification`;
      let successCount = 0;
      let errorCount = 0;

      // Enviar push notification a cada usuario usando la Edge Function
      for (const user of recipients) {
        try {
          const response = await fetch(edgeFunctionUrl, {
            method: 'POST',
            headers: {
              'apikey': supabaseServiceRoleKey,
              'Authorization': `Bearer ${supabaseServiceRoleKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_id: user.id,
              title: notification.title,
              message: notification.content,
              type: notification.type,
              metadata: {
                ...notification.metadata,
                from_admin: true,
                original_notification_id: notification.id
              }
            })
          });

          if (response.ok) {
            const result = await response.json();
            console.log(`✅ Push notification sent to user ${user.id}:`, result);
            if (result.push?.success || result.push?.skipped) {
              successCount++;
            } else {
              errorCount++;
              console.error(`❌ Push notification failed for user ${user.id}:`, result.push?.error);
            }
          } else {
            errorCount++;
            console.error(`❌ HTTP error for user ${user.id}:`, response.status);
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Exception sending to user ${user.id}:`, error);
        }
      }

      console.log(`📊 Push notification summary: ${successCount} success, ${errorCount} errors`);

      // Siempre consideramos éxito si las notificaciones individuales se crearon
      // aunque el push tenga errores técnicos
      return {
        success: true,
        message: `Notificaciones creadas: ${recipients.length} | Push: ${successCount} exitosas, ${errorCount} errores`,
        sentCount: recipients.length,
        pushSuccess: successCount,
        pushErrors: errorCount
      };
    } catch (error) {
      console.error('Error sending push notifications:', error);
      return {
        success: false,
        message: 'Error al enviar notificaciones push',
        sentCount: 0
      };
    }
  },

  async sendSMSNotification(notification: any, recipients: string[]) {
    try {
      // Simulación de envío de SMS
      console.log('Enviando SMS notification:', {
        message: `${notification.title}: ${notification.message}`,
        recipients: recipients.length,
        type: notification.type
      });

      // Aquí iría la lógica real con un servicio SMS como Twilio
      await new Promise(resolve => setTimeout(resolve, 3000));

      return {
        success: true,
        message: `SMS enviado exitosamente a ${recipients.length} destinatarios`,
        sentCount: recipients.length
      };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return {
        success: false,
        message: 'Error al enviar SMS',
        sentCount: 0
      };
    }
  },

  async sendInAppNotification(notification: any, recipients: string[]) {
    try {
      // Para notificaciones en-app, guardamos en la base de datos
      // Los usuarios verán estas notificaciones al iniciar sesión
      console.log('Guardando in-app notification:', {
        title: notification.title,
        message: notification.message,
        recipients: recipients.length,
        type: notification.type
      });

      // Aquí podríamos guardar en una tabla de notificaciones en_app
      // Por ahora, simulamos que se guarda correctamente
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        message: `Notificación en-app guardada para ${recipients.length} usuarios`,
        sentCount: recipients.length
      };
    } catch (error) {
      console.error('Error saving in-app notification:', error);
      return {
        success: false,
        message: 'Error al guardar notificación en-app',
        sentCount: 0
      };
    }
  },

  async getNotificationStats() {
    try {
      const { data: notifications } = await supabaseAdmin
        .from('notifications')
        .select('status, channel, type, recipient_count, open_count, click_count');

      if (!notifications) return null;

      const total = notifications.length;
      const sent = notifications.filter(n => n.status === 'sent').length;
      const failed = notifications.filter(n => n.status === 'failed').length;
      const scheduled = notifications.filter(n => n.status === 'scheduled').length;
      const draft = notifications.filter(n.status === 'draft').length;

      const totalRecipients = notifications.reduce((sum, n) => sum + (n.recipient_count || 0), 0);
      const totalOpens = notifications.reduce((sum, n) => sum + (n.open_count || 0), 0);
      const totalClicks = notifications.reduce((sum, n) => sum + (n.click_count || 0), 0);

      const openRate = totalRecipients > 0 ? Math.round((totalOpens / totalRecipients) * 100) : 0;
      const clickRate = totalOpens > 0 ? Math.round((totalClicks / totalOpens) * 100) : 0;

      // Estadísticas por canal
      const channelStats = notifications.reduce((acc, n) => {
        if (!acc[n.channel]) {
          acc[n.channel] = { sent: 0, failed: 0, total: 0 };
        }
        acc[n.channel].total++;
        if (n.status === 'sent') acc[n.channel].sent++;
        if (n.status === 'failed') acc[n.channel].failed++;
        return acc;
      }, {} as Record<string, { sent: number; failed: number; total: number }>);

      // Estadísticas por tipo
      const typeStats = notifications.reduce((acc, n) => {
        if (!acc[n.type]) {
          acc[n.type] = { sent: 0, failed: 0, total: 0 };
        }
        acc[n.type].total++;
        if (n.status === 'sent') acc[n.type].sent++;
        if (n.status === 'failed') acc[n.type].failed++;
        return acc;
      }, {} as Record<string, { sent: number; failed: number; total: number }>);

      return {
        total,
        sent,
        failed,
        scheduled,
        draft,
        totalRecipients,
        totalOpens,
        totalClicks,
        openRate,
        clickRate,
        channelStats,
        typeStats
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return null;
    }
  },

  async scheduleNotification(notificationId: string, scheduledFor: string) {
    try {
      const notification = await this.updateNotification(notificationId, {
        status: 'scheduled',
        scheduled_for: scheduledFor,
        updated_at: new Date().toISOString()
      });

      if (!notification) {
        throw new Error('No se pudo programar la notificación');
      }

      return notification;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  },

  async cancelScheduledNotification(notificationId: string) {
    try {
      const notification = await this.updateNotification(notificationId, {
        status: 'draft',
        scheduled_for: null,
        updated_at: new Date().toISOString()
      });

      if (!notification) {
        throw new Error('No se pudo cancelar la notificación programada');
      }

      return notification;
    } catch (error) {
      console.error('Error canceling scheduled notification:', error);
      throw error;
    }
  },

  async trackNotificationOpen(notificationId: string, userId: string) {
    try {
      // Incrementar el contador de apertura
      const { data: notification } = await supabaseAdmin
        .from('notifications')
        .select('open_count')
        .eq('id', notificationId)
        .single();

      if (notification) {
        await supabaseAdmin
          .from('notifications')
          .update({
            open_count: (notification.open_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', notificationId);
      }

      return true;
    } catch (error) {
      console.error('Error tracking notification open:', error);
      return false;
    }
  },

  async trackNotificationClick(notificationId: string, userId: string) {
    try {
      // Incrementar el contador de clics
      const { data: notification } = await supabaseAdmin
        .from('notifications')
        .select('click_count')
        .eq('id', notificationId)
        .single();

      if (notification) {
        await supabaseAdmin
          .from('notifications')
          .update({
            click_count: (notification.click_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', notificationId);
      }

      return true;
    } catch (error) {
      console.error('Error tracking notification click:', error);
      return false;
    }
  }
};

// Servicio para códigos promocionales
export const promotionalCodesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('promotional_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('promotional_codes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(code: any) {
    const { data, error } = await supabase.rpc('create_promotional_code', {
      p_description: code.description,
      p_benefit_type: code.benefit_type,
      p_benefit_value: code.benefit_value,
      p_benefit_days: code.benefit_days || 30,
      p_max_uses: code.max_uses || 1,
      p_valid_until: code.valid_until || null,
      p_created_by: code.created_by || null
    });

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('promotional_codes')
      .update({
        description: updates.description,
        benefit_type: updates.benefit_type,
        benefit_value: updates.benefit_value,
        benefit_days: updates.benefit_days,
        max_uses: updates.max_uses,
        valid_until: updates.valid_until || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleActive(id: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('promotional_codes')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('promotional_codes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getStats() {
    const { data, error } = await supabase.rpc('get_promotional_codes_stats');

    if (error) throw error;
    return data?.[0] || null;
  },
};

// Servicio para refugios
export const refugiosService = {
  async getRefugios() {
    const { data, error } = await supabaseAdmin
      .from('refugios')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getRefugioById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('refugios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createRefugio(refugio: Partial<Database['public']['Tables']['refugios']['Insert']>) {
    const { data, error } = await supabaseAdmin
      .from('refugios')
      .insert([refugio])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateRefugio(id: string, refugio: Partial<Database['public']['Tables']['refugios']['Update']>) {
    const { data, error } = await supabaseAdmin
      .from('refugios')
      .update(refugio)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteRefugio(id: string) {
    const { error } = await supabaseAdmin
      .from('refugios')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Servicio para reportes
export const reportsService = {
  async getAll() {
    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Enriquecer con datos de perfiles y contenido reportado
    const reportsWithDetails = await Promise.all(
      (data || []).map(async (report) => {
        let reporter = null;
        let reviewer = null;
        let reportedContent = null;

        // Obtener perfil del reportante
        try {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('full_name, email')
            .eq('id', report.reporter_id)
            .single();
          reporter = profile;
        } catch (error) {
          console.warn(`No se encontró perfil para reporter ${report.reporter_id}:`, error);
        }

        // Obtener perfil del revisor si existe
        if (report.reviewed_by) {
          try {
            const { data: profile } = await supabaseAdmin
              .from('profiles')
              .select('full_name, email')
              .eq('id', report.reviewed_by)
              .single();
            reviewer = profile;
          } catch (error) {
            console.warn(`No se encontró perfil para reviewer ${report.reviewed_by}:`, error);
          }
        }

        // Obtener contenido reportado
        try {
          if (report.report_type === 'aviso') {
            const { data: aviso } = await supabaseAdmin
              .from('red_de_ayuda')
              .select('*')
              .eq('id', report.reported_id)
              .single();
            reportedContent = { aviso };
          } else if (report.report_type === 'petomatch') {
            const { data: pet } = await supabaseAdmin
              .from('pets')
              .select('*')
              .eq('id', report.reported_id)
              .single();
            reportedContent = { pet };
          } else if (report.report_type === 'user') {
            const { data: user } = await supabaseAdmin
              .from('profiles')
              .select('*')
              .eq('id', report.reported_id)
              .single();
            reportedContent = { user };
          }
        } catch (error) {
          console.warn(`Error fetching reported content for report ${report.id}:`, error);
        }

        return {
          ...report,
          reporter,
          reviewer,
          reported_content: reportedContent
        };
      })
    );

    return reportsWithDetails;
  },

  async getById(id: string) {
    const { data: report, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Obtener perfil del reportante
    let reporter = null;
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name, email')
        .eq('id', report.reporter_id)
        .single();
      reporter = profile;
    } catch (error) {
      console.warn(`No se encontró perfil para reporter ${report.reporter_id}:`, error);
    }

    // Obtener perfil del revisor si existe
    let reviewer = null;
    if (report.reviewed_by) {
      try {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('full_name, email')
          .eq('id', report.reviewed_by)
          .single();
        reviewer = profile;
      } catch (error) {
        console.warn(`No se encontró perfil para reviewer ${report.reviewed_by}:`, error);
      }
    }

    // Obtener contenido reportado
    let reportedContent = null;
    if (report.report_type === 'aviso') {
      const { data: aviso } = await supabaseAdmin
        .from('red_de_ayuda')
        .select('*')
        .eq('id', report.reported_id)
        .single();
      reportedContent = { aviso };
    } else if (report.report_type === 'petomatch') {
      const { data: pet } = await supabaseAdmin
        .from('pets')
        .select('*')
        .eq('id', report.reported_id)
        .single();
      reportedContent = { pet };
    } else if (report.report_type === 'user') {
      const { data: user } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', report.reported_id)
        .single();
      reportedContent = { user };
    }

    return {
      ...report,
      reporter,
      reviewer,
      reported_content: reportedContent
    };
  },

  async updateStatus(id: string, status: 'pending' | 'reviewed' | 'resolved' | 'dismissed', notes?: string, reviewedBy?: string) {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (reviewedBy && status !== 'pending') {
      updateData.reviewed_by = reviewedBy;
      updateData.reviewed_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async disableReportedContent(reportType: string, reportedId: string) {
    let error = null;

    if (reportType === 'aviso') {
      const result = await supabaseAdmin
        .from('red_de_ayuda')
        .update({ estado: 'vencido' })
        .eq('id', reportedId);
      error = result.error;
    } else if (reportType === 'petomatch') {
      const result = await supabaseAdmin
        .from('pets')
        .update({ is_active: false, suspended_by_admin: true, suspension_reason: 'Reportado y desactivado por administrador' })
        .eq('id', reportedId);
      error = result.error;
    } else if (reportType === 'user') {
      const result = await supabaseAdmin
        .from('profiles')
        .update({ is_active: false, suspended: true })
        .eq('id', reportedId);
      error = result.error;
    }

    if (error) throw error;
  },

  async enableReportedContent(reportType: string, reportedId: string) {
    let error = null;

    if (reportType === 'aviso') {
      const result = await supabaseAdmin
        .from('red_de_ayuda')
        .update({ estado: 'activo' })
        .eq('id', reportedId);
      error = result.error;
    } else if (reportType === 'petomatch') {
      const result = await supabaseAdmin
        .from('pets')
        .update({ is_active: true, suspended_by_admin: false, suspension_reason: null })
        .eq('id', reportedId);
      error = result.error;
    } else if (reportType === 'user') {
      const result = await supabaseAdmin
        .from('profiles')
        .update({ is_active: true, suspended: false })
        .eq('id', reportedId);
      error = result.error;
    }

    if (error) throw error;
  },

  async deleteReportedContent(reportType: string, reportedId: string) {
    let error = null;

    if (reportType === 'aviso') {
      const result = await supabaseAdmin
        .from('red_de_ayuda')
        .delete()
        .eq('id', reportedId);
      error = result.error;
    } else if (reportType === 'petomatch') {
      const result = await supabaseAdmin
        .from('pets')
        .delete()
        .eq('id', reportedId);
      error = result.error;
    } else if (reportType === 'user') {
      // Para usuarios, solo suspendemos, no eliminamos
      const result = await supabaseAdmin
        .from('profiles')
        .update({ is_active: false, suspended: true })
        .eq('id', reportedId);
      error = result.error;
    }

    if (error) throw error;
  },

  async getStats() {
    try {
      const [totalResult, pendingResult, resolvedResult, dismissedResult] = await Promise.all([
        supabaseAdmin.from('reports').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabaseAdmin.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
        supabaseAdmin.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'dismissed')
      ]);

      // Obtener reportes por tipo
      const { data: reportsByType } = await supabaseAdmin
        .from('reports')
        .select('report_type');

      const typeStats = (reportsByType || []).reduce((acc: Record<string, number>, report) => {
        acc[report.report_type] = (acc[report.report_type] || 0) + 1;
        return acc;
      }, {});

      // Obtener reportes por razón
      const { data: reportsByReason } = await supabaseAdmin
        .from('reports')
        .select('reason');

      const reasonStats = (reportsByReason || []).reduce((acc: Record<string, number>, report) => {
        acc[report.reason] = (acc[report.reason] || 0) + 1;
        return acc;
      }, {});

      return {
        total: totalResult.count || 0,
        pending: pendingResult.count || 0,
        resolved: resolvedResult.count || 0,
        dismissed: dismissedResult.count || 0,
        byType: typeStats,
        byReason: reasonStats
      };
    } catch (error) {
      console.error('Error getting reports stats:', error);
      return {
        total: 0,
        pending: 0,
        resolved: 0,
        dismissed: 0,
        byType: {},
        byReason: {}
      };
    }
  }
};

// Servicio para popups de la app móvil
export const popupsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('app_popups')
      .select('*')
      .order('priority', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('app_popups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(popup: any) {
    const { data, error } = await supabase
      .from('app_popups')
      .insert(popup)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('app_popups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('app_popups')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async toggleActive(id: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('app_popups')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getActivePopups(userId?: string) {
    const { data, error } = await supabase
      .rpc('get_active_popups_for_user', { p_user_id: userId || null });

    if (error) throw error;
    return data;
  },

  async markPopupAsViewed(userId: string, popupId: string) {
    const { data, error } = await supabase
      .from('app_popup_views')
      .insert({ user_id: userId, popup_id: popupId })
      .select()
      .single();

    // Ignorar error si ya existe (constraint unique)
    if (error && error.code !== '23505') throw error;
    return data;
  },

  async getStats() {
    try {
      const [totalResult, activeResult, inactiveResult] = await Promise.all([
        supabase.from('app_popups').select('id', { count: 'exact', head: true }),
        supabase.from('app_popups').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('app_popups').select('id', { count: 'exact', head: true }).eq('is_active', false)
      ]);

      return {
        total: totalResult.count || 0,
        active: activeResult.count || 0,
        inactive: inactiveResult.count || 0
      };
    } catch (error) {
      console.error('Error getting popups stats:', error);
      return { total: 0, active: 0, inactive: 0 };
    }
  }
};
