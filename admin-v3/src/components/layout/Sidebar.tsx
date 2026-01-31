import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Heart,
  Crown,
  ShoppingCart,
  Calendar,
  MapPin,
  Image,
  HelpCircle,
  Building,
  BarChart3,
  Settings,
  LogOut,
  Package,
  Tags,
  Receipt,
  Ticket,
  Bell,
  Gift,
  Flag,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Usuarios',
    href: '/usuarios',
    icon: Users,
  },
  {
    name: 'Mascotas',
    href: '/mascotas',
    icon: Heart,
  },
  {
    name: 'Membresías',
    href: '/membresias',
    icon: Crown,
  },
  {
    name: 'Tienda',
    icon: ShoppingCart,
    children: [
      { name: 'Productos', href: '/tienda/productos', icon: Package },
      { name: 'Pedidos', href: '/tienda/pedidos', icon: Receipt },
      { name: 'Categorías', href: '/tienda/categorias', icon: Tags },
      { name: 'Cupones', href: '/tienda/cupones', icon: Ticket },
    ],
  },
  {
    name: 'Eventos',
    href: '/eventos',
    icon: Calendar,
  },
  {
    name: 'Lugares',
    href: '/lugares',
    icon: MapPin,
  },
  {
    name: 'Banners',
    href: '/banners',
    icon: Image,
  },
  {
    name: 'Red de Ayuda',
    href: '/red-de-ayuda',
    icon: HelpCircle,
  },
  {
    name: 'Reportes',
    href: '/reportes',
    icon: Flag,
  },
  {
    name: 'Refugios',
    href: '/refugios',
    icon: Building,
  },
  {
    name: 'Notificaciones',
    href: '/notificaciones',
    icon: Bell,
  },
  {
    name: 'Códigos Promocionales',
    href: '/codigos-promocionales',
    icon: Gift,
  },
  {
    name: 'Popups',
    href: '/popups',
    icon: MessageSquare,
  },
  {
    name: 'Analíticas',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Configuración',
    href: '/configuracion',
    icon: Settings,
  },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [openSections, setOpenSections] = React.useState<string[]>(['Tienda']);

  const toggleSection = (sectionName: string) => {
    setOpenSections(prev =>
      prev.includes(sectionName)
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  const handleSignOut = async () => {
    await signOut();
    onClose?.();
  };

  return (
    <div className="admin-sidebar flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-primary">PetoClub</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Panel de Administración</p>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-medium">
              {user?.full_name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.full_name || 'Admin'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const hasChildren = item.children && item.children.length > 0;
          const isSectionOpen = openSections.includes(item.name);

          if (hasChildren) {
            return (
              <Collapsible key={item.name} open={isSectionOpen} onOpenChange={() => toggleSection(item.name)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start pl-2 pr-3 h-10 ${
                      location.pathname.startsWith(item.children?.[0]?.href || '')
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                    {item.name}
                    {isSectionOpen ? (
                      <ChevronDown className="w-4 h-4 ml-auto" />
                    ) : (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 ml-4">
                  {item.children.map((child) => {
                    const isChildActive = location.pathname === child.href;
                    return (
                      <NavLink
                        key={child.href}
                        to={child.href}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`
                        }
                      >
                        {child.icon && <child.icon className="w-4 h-4 mr-3" />}
                        {child.name}
                      </NavLink>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              {item.icon && <item.icon className="w-5 h-5 mr-3" />}
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}