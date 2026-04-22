import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AdminNavbar from "../../components/admin/AdminNavbar";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  Plus,
  Users,
  ShoppingCart,
  Calendar,
  BarChart3,
  Settings,
  Package,
  Tag,
  MessageSquare,
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    totalReservations: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch orders for stats
      const ordersResponse = await api.get("/orders", {
        params: { page: 1, limit: 100 },
      });
      const orders = ordersResponse.data.data || [];

      // Fetch users for stats
      const usersResponse = await api.get("/users");
      const users = usersResponse.data.data || [];

      // Fetch reservations for stats
      const reservationsResponse = await api.get("/reservations", {
        params: { page: 1, limit: 100 },
      });
      const reservations = reservationsResponse.data.data || [];

      // Calculate stats
      const totalRevenue = orders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0,
      );
      const activeUsers = users.filter((user) => user.role === "user").length;

      setStats({
        totalOrders: ordersResponse.data.total ?? orders.length,
        totalRevenue: totalRevenue,
        activeUsers: activeUsers,
        totalReservations:
          reservationsResponse.data.total ?? reservations.length,
      });

      // Create recent activity from actual data
      const activity = [];

      // Add recent orders
      const sortedOrders = orders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      const recentOrders = sortedOrders.slice(0, 5);
      recentOrders.forEach((order) => {
        activity.push({
          type: "order",
          message: `New order #${order._id.slice(-6).toUpperCase()} received`,
          time: order.createdAt,
          displayTime: new Date(order.createdAt).toLocaleTimeString(),
          color: "bg-green-500",
        });
      });

      // Add recent reservations
      const sortedReservations = reservations.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      const recentReservations = sortedReservations.slice(0, 5);
      recentReservations.forEach((reservation) => {
        activity.push({
          type: "reservation",
          message: `Reservation confirmed for ${reservation.name || "customer"
            }`,
          time: reservation.createdAt,
          displayTime: new Date(reservation.createdAt).toLocaleTimeString(),
          color: "bg-blue-500",
        });
      });

      // Add recent users
      const sortedUsers = users.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      const recentUsers = sortedUsers.slice(0, 5);
      recentUsers.forEach((user) => {
        activity.push({
          type: "user",
          message: `New user ${user.name} registered`,
          time: user.createdAt,
          displayTime: new Date(user.createdAt).toLocaleTimeString(),
          color: "bg-purple-500",
        });
      });

      // Sort by creation time (we will group this data in the UI).
      activity.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivity(activity);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const adminStats = [
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      change: "+0%", // Could be calculated with date comparison
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: "+0%",
      icon: BarChart3,
      color: "bg-green-500",
    },
    {
      title: "Active Users",
      value: stats.activeUsers.toString(),
      change: "+0%",
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: "Reservations",
      value: stats.totalReservations.toString(),
      change: "+0%",
      icon: Calendar,
      color: "bg-orange-500",
    },
  ];

  const adminActions = [
    {
      title: "Add Food Items",
      description: "Add new food items to the menu",
      icon: Plus,
      link: "/admin/food-items/add",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Manage Categories",
      description: "Add and manage food categories",
      icon: Tag,
      link: "/admin/categories",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Manage Orders",
      description: "View and update order status",
      icon: ShoppingCart,
      link: "/admin/orders",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Manage Reservations",
      description: "Handle table reservations",
      icon: Calendar,
      link: "/admin/reservations",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      icon: Users,
      link: "/admin/users",
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      title: "Manage Messages",
      description: "View customer inquiries",
      icon: MessageSquare,
      link: "/admin/messages",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      title: "Settings",
      description: "Configure system settings",
      icon: Settings,
      link: "/admin/settings",
      color: "bg-gray-500 hover:bg-gray-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name}! Manage your restaurant operations from
            here.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading
            ? // Loading skeleton for stats
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))
            : adminStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div
                    className={`p-3 rounded-full ${stat.color} text-white`}
                  >
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-green-600 font-medium">
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    from last month
                  </span>
                </div>
              </div>
            ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            {loading ? (
              // Loading skeleton for activity
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No recent activity
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Activity will appear here as orders and reservations are made.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Recent Orders
                  </h3>
                  <div className="space-y-4">
                    {recentActivity
                      .filter((a) => a.type === "order")
                      .slice(0, 5)
                      .map((activity, index) => (
                        <div key={index} className="flex items-center">
                          <div
                            className={`w-2 h-2 ${activity.color} rounded-full mr-3`}
                          ></div>
                          <span className="text-sm text-gray-600 flex-1">
                            {activity.message}
                          </span>
                          <span className="text-xs text-gray-400">
                            {activity.displayTime}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Recent Reservations
                  </h3>
                  <div className="space-y-4">
                    {recentActivity
                      .filter((a) => a.type === "reservation")
                      .slice(0, 5)
                      .map((activity, index) => (
                        <div key={index} className="flex items-center">
                          <div
                            className={`w-2 h-2 ${activity.color} rounded-full mr-3`}
                          ></div>
                          <span className="text-sm text-gray-600 flex-1">
                            {activity.message}
                          </span>
                          <span className="text-xs text-gray-400">
                            {activity.displayTime}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    New Users
                  </h3>
                  <div className="space-y-4">
                    {recentActivity
                      .filter((a) => a.type === "user")
                      .slice(0, 5)
                      .map((activity, index) => (
                        <div key={index} className="flex items-center">
                          <div
                            className={`w-2 h-2 ${activity.color} rounded-full mr-3`}
                          ></div>
                          <span className="text-sm text-gray-600 flex-1">
                            {activity.message}
                          </span>
                          <span className="text-xs text-gray-400">
                            {activity.displayTime}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className={`${action.color} text-white rounded-lg p-6 transition-colors duration-200`}
              >
                <div className="flex items-center mb-4">
                  <action.icon className="h-8 w-8" />
                  <h3 className="text-xl font-semibold ml-3">{action.title}</h3>
                </div>
                <p className="text-white/90">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
