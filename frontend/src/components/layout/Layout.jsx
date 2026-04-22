import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useSettings } from "../../contexts/SettingsContext";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Home,
  BookOpen,
  Info,
  Phone,
  ChefHat,
  Star,
  MapPin,
  Mail,
  Clock,
  Calendar,
} from "lucide-react";

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { items: cartItems } = useCart();
  const { restaurantName } = useSettings();
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Menu", href: "/menu", icon: BookOpen },
    { name: "Book Table", href: "/reservation", icon: Calendar },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const cartItemCount =
    cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center group">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                  <ChefHat className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                  {restaurantName}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-4 py-2 text-lg font-semibold rounded-xl transition-all duration-300 ${
                      location.pathname === item.href
                        ? "bg-orange-100 text-orange-600 shadow-md"
                        : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-6">
              {user ? (
                <>
                  <Link
                    to="/cart"
                    className="relative p-3 text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    <ShoppingCart className="w-7 h-7" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center text-lg font-semibold text-gray-700 hover:text-orange-600 transition-colors px-4 py-2 rounded-xl hover:bg-orange-50">
                      <User className="w-5 h-5 mr-2" />
                      {user.name}
                    </button>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-gray-100">
                      <Link
                        to="/profile"
                        className="block px-6 py-3 text-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-6 py-3 text-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        Orders
                      </Link>
                      <Link
                        to="/my-reservations"
                        className="block px-6 py-3 text-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        Reservations
                      </Link>
                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-6 py-3 text-lg text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-orange-600 px-6 py-3 rounded-xl text-lg font-semibold hover:bg-orange-50 transition-all duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-orange-600 p-2 rounded-xl hover:bg-orange-50 transition-all duration-300"
              >
                {isMenuOpen ? (
                  <X className="w-7 h-7" />
                ) : (
                  <Menu className="w-7 h-7" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 rounded-xl text-lg font-semibold transition-all duration-300 ${
                      location.pathname === item.href
                        ? "bg-orange-100 text-orange-600"
                        : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-6 h-6 mr-3" />
                    {item.name}
                  </Link>
                );
              })}

              {user ? (
                <>
                  <Link
                    to="/cart"
                    className="flex items-center px-4 py-3 rounded-xl text-lg font-semibold text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShoppingCart className="w-6 h-6 mr-3" />
                    Cart ({cartItemCount})
                  </Link>
                  <Link
                    to="/reservation"
                    className="flex items-center px-4 py-3 rounded-xl text-lg font-semibold text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Calendar className="w-6 h-6 mr-3" />
                    Book Table
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 rounded-xl text-lg font-semibold text-red-600 hover:bg-red-50 transition-all duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="pt-4 pb-3 border-t border-gray-200 space-y-2">
                  <Link
                    to="/login"
                    className="block px-4 py-3 rounded-xl text-lg font-semibold text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-3 rounded-xl text-lg font-semibold text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="w-full py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                  <ChefHat className="h-7 w-7 text-white" />
                </div>
                <span className="text-2xl font-bold">{restaurantName}</span>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Delicious food delivered to your doorstep. Fresh ingredients,
                amazing taste, and excellent service. Experience the finest
                culinary delights from the best restaurants in town.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-orange-400">
                  <Star className="h-5 w-5 mr-1 fill-current" />
                  <span className="font-semibold">4.8★</span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-gray-300">10K+ Happy Customers</span>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/menu"
                    className="text-gray-300 hover:text-orange-400 transition-colors text-lg"
                  >
                    Our Menu
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-gray-300 hover:text-orange-400 transition-colors text-lg"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-300 hover:text-orange-400 transition-colors text-lg"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cart"
                    className="text-gray-300 hover:text-orange-400 transition-colors text-lg"
                  >
                    Shopping Cart
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-6">Contact Info</h4>
              <ul className="space-y-4 text-lg">
                <li className="flex items-center text-gray-300">
                  <MapPin className="h-5 w-5 mr-3 text-orange-400" />
                  123 Food Street, City, State 12345
                </li>
                <li className="flex items-center text-gray-300">
                  <Phone className="h-5 w-5 mr-3 text-orange-400" />
                  (555) 123-4567
                </li>
                <li className="flex items-center text-gray-300">
                  <Mail className="h-5 w-5 mr-3 text-orange-400" />
                  info@eatexpress.com
                </li>
                <li className="flex items-center text-gray-300">
                  <Clock className="h-5 w-5 mr-3 text-orange-400" />
                  Mon-Fri: 11AM-10PM
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-lg">
              &copy; 2026 {restaurantName}. All rights reserved. |
              <span className="text-orange-400 ml-2">
                Made for food lovers
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
