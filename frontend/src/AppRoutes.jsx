import { Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

// Dashboard Pages
import ProfilePage from "./pages/dashboard/ProfilePage";
import OrderHistoryPage from "./pages/dashboard/OrderHistoryPage";
import OrderStatusPage from "./pages/OrderStatusPage";
import ReservationPage from "./pages/ReservationPage";
import MyReservationsPage from "./pages/MyReservationsPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import FoodItemsPage from "./pages/admin/FoodItemsPage";
import AddFoodItemPage from "./pages/admin/AddFoodItemPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminReservationsPage from "./pages/admin/AdminReservationsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import EditFoodItemPage from "./pages/admin/EditFoodItemPage";
import AdminMessagesPage from "./pages/admin/AdminMessagesPage";

// Protected Route Component
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ReservationPaymentPage from "./pages/ReservationPaymentPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected Routes */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrderHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:orderId"
        element={
          <ProtectedRoute>
            <OrderStatusPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reservation"
        element={
          <ProtectedRoute>
            <ReservationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reservation/payment/:reservationId"
        element={
          <ProtectedRoute>
            <ReservationPaymentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-reservations"
        element={
          <ProtectedRoute>
            <MyReservationsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/food-items"
        element={
          <ProtectedRoute requireAdmin>
            <FoodItemsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/food-items/add"
        element={
          <ProtectedRoute requireAdmin>
            <AddFoodItemPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/food-items/edit/:id"
        element={
          <ProtectedRoute requireAdmin>
            <EditFoodItemPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute requireAdmin>
            <AdminCategoriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute requireAdmin>
            <AdminOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reservations"
        element={
          <ProtectedRoute requireAdmin>
            <AdminReservationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireAdmin>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute requireAdmin>
            <AdminSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/messages"
        element={
          <ProtectedRoute requireAdmin>
            <AdminMessagesPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
