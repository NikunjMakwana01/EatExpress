import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  Calendar,
} from "lucide-react";

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [filter, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
      };

      if (filter !== "all") {
        params.status = filter;
      }

      const response = await api.get("/orders/my-orders", { params });
      setOrders(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/cancel`);
      toast.success("Order cancelled successfully");
      fetchOrders(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to cancel order");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "confirmed":
      case "preparing":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "out_for_delivery":
        return <Truck className="h-5 w-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canCancelOrder = (status) => {
    // User can cancel only before "out_for_delivery".
    return ["pending", "confirmed", "preparing"].includes(status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        <p className="text-gray-600 mt-2">View and manage your past orders.</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: "all", label: "All Orders" },
              { key: "pending", label: "Pending" },
              { key: "confirmed", label: "Confirmed" },
              { key: "preparing", label: "Preparing" },
              { key: "out_for_delivery", label: "Out for Delivery" },
              { key: "delivered", label: "Delivered" },
              { key: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setFilter(tab.key);
                  setCurrentPage(1);
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === "all"
              ? "You haven't placed any orders yet."
              : `No ${filter} orders found.`}
          </p>
          {filter === "all" && (
            <Link
              to="/menu"
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
            >
              Browse Menu
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order._id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(order.status)}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="flex-1">
                        {item.quantity}x {item.foodItem.name}
                      </span>
                      <span className="text-gray-600">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">
                    Total Amount:
                  </span>
                  <span className="ml-2 text-gray-900">
                    ₹{order.totalAmount}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Payment Status:
                  </span>
                  {/*
                    For COD orders, backend keeps paymentStatus as "pending".
                    UI requirement: show "Cash on delivery".
                  */}
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      order.paymentMethod === "cod"
                        ? "bg-gray-100 text-gray-800"
                        : order.paymentStatus === "completed"
                        ? "bg-green-100 text-green-800"
                        : order.paymentStatus === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.paymentMethod === "cod"
                      ? "Cash on delivery"
                      : order.paymentStatus.toUpperCase()}
                  </span>
                </div>
                {order.estimatedDeliveryTime && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Estimated Delivery:
                    </span>
                    <span className="ml-2 text-gray-900">
                      {formatDate(order.estimatedDeliveryTime)}
                    </span>
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              {order.specialInstructions && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-1">
                    Special Instructions:
                  </h4>
                  <p className="text-sm text-gray-600">
                    {order.specialInstructions}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <Link
                  to={`/orders/${order._id}`}
                  className="flex items-center text-orange-600 hover:text-orange-700 font-medium"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Link>

                <div className="flex space-x-2">
                  {canCancelOrder(order.status) && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === page
                    ? "bg-orange-600 text-white"
                    : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
