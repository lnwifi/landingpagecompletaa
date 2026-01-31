// Types generados para la base de datos de Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          is_admin: boolean;
          notifications_enabled: boolean;
          email_notifications_enabled: boolean;
          social_notifications_enabled: boolean;
          likes_notifications: boolean;
          comments_notifications: boolean;
          follows_notifications: boolean;
          notificaciones_geolocalizacion: boolean;
          latitud: number | null;
          longitud: number | null;
          created_at: string;
          updated_at: string;
          last_seen: string;
          is_active: boolean;
          suspended: boolean;
          fcm_token: string | null;
          payer_id: string | null;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      pets: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          species: string;
          breed: string | null;
          age: string | null;
          description: string | null;
          image_url: string | null;
          images: string[];
          interest: string[];
          created_at: string;
          updated_at: string;
          is_active: boolean;
          featured: boolean;
          featured_until: string | null;
          show_in_petomatch: boolean;
          deactivated_by_downgrade: boolean;
        };
        Insert: Omit<Database['public']['Tables']['pets']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['pets']['Insert']>;
      };
      membership_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          max_pets: number;
          max_photos_per_pet: number;
          max_interests_per_pet: number;
          has_ads: boolean;
          has_coupons: boolean;
          has_store_discount: boolean;
          price: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['membership_types']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['membership_types']['Insert']>;
      };
      user_memberships: {
        Row: {
          id: string;
          user_id: string;
          membership_type_id: string;
          start_date: string;
          end_date: string | null;
          is_active: boolean;
          status: 'active' | 'cancelled' | 'expired';
          type: 'subscription' | 'one_time';
          mercadopago_payment_id: string | null;
          mercadopago_subscription_id: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_memberships']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_memberships']['Insert']>;
      };
      productos: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          categoria_id: string;
          stock: number;
          is_active: boolean;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['productos']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['productos']['Insert']>;
      };
      categorias_productos: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categorias_productos']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['categorias_productos']['Insert']>;
      };
      pedidos: {
        Row: {
          id: string;
          cliente_id: string;
          fecha_pedido: string;
          estado: string;
          subtotal: number;
          costo_envio: number;
          descuento: number;
          total: number;
          direccion_envio: any;
          metodo_pago: string;
          id_transaccion_pago: string | null;
          notas_cliente: string | null;
          notas_admin: string | null;
          fecha_actualizacion: string;
          estado_pago: string;
          fecha_pago: string | null;
          delivery_status: string;
          delivery_attempt: number;
          first_delivery_date: string | null;
          second_delivery_date: string | null;
          delivery_notes: string | null;
          delivery_completed_at: string | null;
          repartidor_id: string | null;
        };
        Insert: Omit<Database['public']['Tables']['pedidos']['Row'], 'id' | 'fecha_pedido' | 'fecha_actualizacion'>;
        Update: Partial<Database['public']['Tables']['pedidos']['Insert']>;
      };
      pedidos_items: {
        Row: {
          id: string;
          pedido_id: string;
          producto_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Insert: Omit<Database['public']['Tables']['pedidos_items']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['pedidos_items']['Insert']>;
      };
      coupons: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          code: string | null;
          discount_percentage: number | null;
          discount_amount: number | null;
          valid_from: string;
          valid_until: string | null;
          partner_name: string | null;
          place_id: string | null;
          is_active: boolean;
          membership_required: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['coupons']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['coupons']['Insert']>;
      };
      banners: {
        Row: {
          id: string;
          title: string;
          description: string;
          image_url: string;
          link_url: string;
          target_section: string;
          start_date: string;
          end_date: string;
          is_active: boolean;
          priority: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['banners']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['banners']['Insert']>;
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          image_url: string | null;
          location: string | null;
          event_date: string;
          start_time: string;
          end_time: string;
          event_type: string;
          is_featured: boolean;
          is_active: boolean;
          max_participants: number;
          current_participants: number;
          organizer_id: string | null;
          organizer_name: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['events']['Insert']>;
      };
      places: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          address: string;
          latitude: number | null;
          longitude: number | null;
          lat: number | null;
          lng: number | null;
          category: string;
          photo_url: string | null;
          phone: string | null;
          whatsapp: string | null;
          type: string | null;
          rating: number | null;
          hours: object | null;
          owner_id: string | null;
          featured: boolean;
          featured_until: string | null;
          qr_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['places']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['places']['Insert']>;
      };
      red_de_ayuda: {
        Row: {
          id: string;
          user_id: string;
          tipo_aviso: 'perdida' | 'encontrada' | 'adopcion' | 'servicio';
          especie: string | null;
          nombre: string | null;
          descripcion: string | null;
          ubicacion: string | null;
          latitud: number | null;
          longitud: number | null;
          fecha: string | null;
          imagen_url: string | null;
          imagenes_urls: string[];
          contacto: string | null;
          estado: 'activo' | 'resuelto' | 'vencido';
          destacado: boolean;
          destacado_hasta: string | null;
          expires_at: string | null;
          payment_id: string | null;
          payment_status: string | null;
          payment_date: string | null;
          radio_busqueda: number;
          sexo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['red_de_ayuda']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['red_de_ayuda']['Insert']>;
      };
      refugios: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          address: string;
          phone: string | null;
          email: string | null;
          whatsapp: string | null;
          website: string | null;
          facebook: string | null;
          instagram: string | null;
          bank_account: string | null;
          bank_cbu: string | null;
          bank_alias: string | null;
          bank_account_holder: string | null;
          bank_account_type: string | null;
          bank_name: string | null;
          image: string | null;
          mascotas: object[];
          causas_urgentes: object[];
          donation_payments: object[];
          rating: string;
          created_at: string;
          dashboard_access: boolean;
          owner_id: string | null;
        };
        Insert: Omit<Database['public']['Tables']['refugios']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['refugios']['Insert']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}