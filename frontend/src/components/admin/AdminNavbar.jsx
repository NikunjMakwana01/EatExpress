import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import {
  Home,
  Package,
  Users,
  ShoppingCart,
  Calendar,
  Settings,
  LogOut,
} from "lucide-react";

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { restaurantName } = useSettings();

  const navItems = [
    {
      name: "Dashboard",
      icon: Home,
      path: "/admin",
    },
    {
      name: "Food Items",
      icon: Package,
      path: "/admin/food-items",
    },
    {
      name: "Categories",
      icon: Package,
      path: "/admin/categories",
    },
    {
      name: "Orders",
      icon: ShoppingCart,
      path: "/admin/orders",
    },
    {
      name: "Reservations",
      icon: Calendar,
      path: "/admin/reservations",
    },
    {
      name: "Users",
      icon: Users,
      path: "/admin/users",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/admin" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary-600">
                {restaurantName} Admin
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary-100 text-primary-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">Welcome, {user?.name}</div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
