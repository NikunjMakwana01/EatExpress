import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { orderAPI } from "../services/api";
import { toast } from "react-toastify";
import {
  CheckCircle,
  Clock,
  Truck,
  Package,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

const OrderStatusPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrder(orderId);
      setOrder(response.data.data);
    } catch (error) {
      console.error("Fetch order error:", error);
      toast.error("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchOrder();
  }, [orderId]);
  
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case "confirmed":
        return <CheckCircle className="h-6 w-6 text-blue-500" />;
      case "preparing":
        return <Package className="h-6 w-6 text-orange-500" />;
      case "out_for_delivery":
        return <Truck className="h-6 w-6 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "cancelled":
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Order Pending";
      case "confirmed":
        return "Order Confirmed";
      case "preparing":
        return "Preparing Your Order";
      case "out_for_delivery":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Order Cancelled";
      default:
        return "Unknown Status";
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case "pending":
        return "We've received your order and are processing it.";
      case "confirmed":
        return "Your order has been confirmed and is being prepared.";
      case "preparing":
        return "Our chefs are preparing your delicious meal.";
      case "out_for_delivery":
        return "Your order is on its way to you.";
      case "delivered":
        return "Your order has been delivered. Enjoy your meal!";
      case "cancelled":
        return "Your order has been cancelled.";
      default:
        return "Processing your order.";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The order you're looking for doesn't exist.
          </p>
          <Link
            to="/menu"
            className="bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition-all duration-300 font-semibold"
          >
            <ArrowLeft className="h-5 w-5 mr-2 inline" />
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Order <span className="text-orange-600">Status</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Track your order and know exactly when your delicious meal will
            arrive.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Order Status Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Order #{order._id.slice(-8).toUpperCase()}
                </h2>
                <p className="text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">
                  ₹{order.finalAmount}
                </div>
                <p className="text-sm text-gray-500">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Status Display */}
            <div className="flex items-center space-x-4 mb-6">
              {getStatusIcon(order.status)}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {getStatusText(order.status)}
                </h3>
                <p className="text-gray-600">
                  {getStatusDescription(order.status)}
                </p>
              </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Delivery Address
                </h4>
                <div className="text-gray-600">
                  <p>{order.deliveryAddress.street}</p>
                  <p>
                    {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
                    {order.deliveryAddress.zipCode}
                  </p>
                  <p>{order.deliveryAddress.country}</p>
                </div>
              </div>
            </div>

            {order.specialInstructions && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Special Instructions
                </h4>
                <p className="text-gray-600">{order.specialInstructions}</p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Order Items
            </h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {item.foodItem.image ? (
                      <img
                        src={`https://eatexpress-backend-ft4m.onrender.com${item.foodItem.image}`}
                        alt={item.foodItem.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {item.foodItem.name}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {item.foodItem.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ₹{item.price} × {item.quantity}
                    </div>
                    <div className="text-orange-600 font-bold">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Payment Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{order.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-semibold">₹{order.deliveryFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold">₹{order.tax}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">₹{order.finalAmount}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-semibold capitalize">
                  {order.paymentMethod}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-600">Payment Status</span>
                <span
                  className={`font-semibold capitalize ${
                    order.paymentMethod === "cod"
                      ? "text-gray-600"
                      : order.paymentStatus === "completed"
                        ? "text-green-600"
                        : order.paymentStatus === "failed"
                          ? "text-red-600"
                          : "text-yellow-600"
                  }`}
                >
                  {order.paymentMethod === "cod"
                    ? "Cash on delivery"
                    : order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/menu"
              className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition-all duration-300 font-semibold text-center"
            >
              Order More Food
            </Link>
            <Link
              to="/orders"
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold text-center"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusPage;
