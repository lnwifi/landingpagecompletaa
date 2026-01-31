// Types principales para el panel de administración

export interface Profile {
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
}

export interface Pet {
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
  suspended_by_admin: boolean;
  suspension_reason: string | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

export interface MembershipType {
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
}

export interface UserMembership {
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
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string;
  stock: number;
  is_active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Coupon {
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
}

export interface Banner {
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
}

export interface Event {
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
}

export interface Place {
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
}

export interface RedDeAyuda {
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
}

export interface Refugio {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
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
  mascotas: any[];
  causas_urgentes: any[];
  donation_payments: any[];
  rating: number;
  created_at: string;
  dashboard_access: boolean;
  owner_id: string | null;
}

// Dashboard statistics
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPets: number;
  activePets: number;
  totalMemberships: number;
  activeMemberships: number;
  totalOrders: number;
  totalRevenue: number;
  totalEvents: number;
  totalPlaces: number;
  totalRedDeAyuda: number;
  activeRedDeAyuda: number;
  totalRefugios: number;
  recentUsers: Profile[];
  recentOrders: Order[];
  topProducts: Product[];
  recentRedDeAyuda: RedDeAyuda[];
}

// Form types
export type CreateUserData = Partial<Pick<Profile, 'email' | 'full_name' | 'is_admin'>>;

export type UpdateUserData = Partial<CreateUserData>;

export type CreatePetData = Partial<Pick<Pet, 'name' | 'species' | 'breed' | 'age' | 'description'>>;

export type UpdatePetData = Partial<CreatePetData & Pick<Pet, 'is_active' | 'featured'>>;

export type CreateMembershipTypeData = Partial<Pick<MembershipType, 'name' | 'description' | 'max_pets' | 'max_photos_per_pet' | 'max_interests_per_pet' | 'has_ads' | 'has_coupons' | 'has_store_discount' | 'price'>>;

export type CreateProductData = Partial<Pick<Product, 'name' | 'description' | 'price' | 'category_id' | 'stock'>>;

export type CreateCategoryData = Partial<Pick<Category, 'name' | 'description'>>;

export type CreateCouponData = Partial<Pick<Coupon, 'title' | 'description' | 'code' | 'discount_percentage' | 'discount_amount' | 'valid_until' | 'partner_name' | 'place_id' | 'membership_required'>>;

export type CreateBannerData = Partial<Pick<Banner, 'title' | 'description' | 'image_url' | 'link_url' | 'target_section' | 'start_date' | 'end_date' | 'priority'>>;

export type CreateEventData = Partial<Pick<Event, 'title' | 'description' | 'location' | 'event_date' | 'start_time' | 'end_time' | 'event_type' | 'max_participants' | 'organizer_name'>>;

export type CreatePlaceData = Partial<Pick<Place, 'name' | 'description' | 'address' | 'latitude' | 'longitude' | 'category' | 'phone' | 'whatsapp' | 'type' | 'hours'>>;

export type CreateRefugioData = Partial<Pick<Refugio, 'name' | 'description' | 'address' | 'phone' | 'email' | 'whatsapp' | 'website' | 'facebook' | 'instagram' | 'bank_account' | 'bank_cbu' | 'bank_alias' | 'bank_account_holder' | 'bank_account_type' | 'bank_name'>>;

// Report types
export type ReportType = 'aviso' | 'petomatch' | 'user';
export type ReportReason = 'spam' | 'inappropriate' | 'fake' | 'harassment' | 'scam' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reporter_id: string;
  report_type: ReportType;
  reported_id: string;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  // Joined fields
  reporter?: {
    full_name: string | null;
    email: string | null;
  };
  reviewer?: {
    full_name: string | null;
    email: string | null;
  };
  // Content details (joined based on report_type)
  reported_content?: {
    aviso?: RedDeAyuda | null;
    pet?: Pet | null;
    user?: Profile | null;
  };
}

export type UpdateReportData = Partial<Pick<Report, 'status' | 'notes'>>;