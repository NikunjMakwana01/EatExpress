import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { toast } from "react-toastify";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
} from "lucide-react";

const CartPage = () => {
  const {
    items: cartItems,
    updateQuantity,
    clearCart,
    total: getTotalAmount,
  } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleQuantityChange = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate("/checkout");
  };

  const handleClearCart = () => {
    clearCart();
    toast.info("Cart cleared");
  };

  const deliveryFee = getTotalAmount >= 200 ? 0 : 40;
  const tax = getTotalAmount * 0.05;
  const total = getTotalAmount + deliveryFee + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Looks like you haven't added any delicious items to your cart
                yet. Let's fix that!
              </p>
              <Link
                to="/menu"
                className="bg-orange-600 text-white px-8 py-4 rounded-xl hover:bg-orange-700 transition-all duration-300 font-semibold text-lg inline-flex items-center"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Browse Our Menu
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your <span className="text-orange-600">Shopping Cart</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Review your delicious selections and proceed to checkout for a
            seamless ordering experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-8 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <ShoppingBag className="h-6 w-6 mr-3 text-orange-600" />
                  Cart Items ({cartItems.length})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="p-8 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-6">
                                             {/* Item Image */}
                       <div className="flex-shrink-0">
                         {item.image ? (
                           <>
                             <img
                               src={`https://eatexpress-backend-ft4m.onrender.com${item.image}`}
                               alt={item.name}
                               className="w-24 h-24 rounded-2xl object-cover shadow-md"
                               onError={(e) => {
                                 console.error(
                                   "Cart image failed to load:",
                                   item.image
                                 );
                                 e.target.style.display = "none";
                                 e.target.nextSibling.style.display = "flex";
                               }}
                             />
                             <div
                               className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center shadow-md"
                               style={{ display: "none" }}
                             >
                               <span className="text-gray-400 text-sm">
                                 Image not found
                               </span>
                             </div>
                           </>
                         ) : (
                           <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center shadow-md">
                             <span className="text-gray-400 text-sm">
                               No image
                             </span>
                           </div>
                         )}
                       </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="flex items-center space-x-3">
                          {item.isVegetarian && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                              Vegetarian
                            </span>
                          )}
                          <span className="text-sm text-gray-500 flex items-center">
                            <Truck className="h-4 w-4 mr-1" />
                            {item.preparationTime} min
                          </span>
                        </div>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex flex-col items-end space-y-4">
                        <span className="text-2xl font-bold text-orange-600">
                          ₹{item.price}
                        </span>

                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() =>
                              handleQuantityChange(item._id, item.quantity - 1)
                            }
                            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          >
                            <Minus className="h-5 w-5" />
                          </button>

                          <span className="text-xl font-bold text-gray-900 w-12 text-center">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              handleQuantityChange(item._id, item.quantity + 1)
                            }
                            className="p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleQuantityChange(item._id, 0)}
                          className="text-red-600 hover:text-red-700 text-sm font-semibold flex items-center transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CreditCard className="h-6 w-6 mr-3 text-orange-600" />
                Order Summary
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">
                    Subtotal ({cartItems.length} items)
                  </span>
                  <span className="text-gray-900 font-semibold">
                    ₹{getTotalAmount}
                  </span>
                </div>

                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-gray-900 font-semibold">
                    ₹{deliveryFee}
                  </span>
                </div>

                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Tax (5%)</span>
                  <span className="text-gray-900 font-semibold">
                    ₹{tax.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-2xl font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-orange-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="h-4 w-4 mr-2 text-green-600" />
                  Secure payment processing
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Truck className="h-4 w-4 mr-2 text-orange-600" />
                  Fast delivery within 30 minutes
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ShoppingBag className="h-4 w-4 mr-2 text-blue-600" />
                  Free delivery on orders above ₹200
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-orange-600 text-white py-4 px-6 rounded-xl hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all duration-300 transform hover:scale-105"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </button>

                <button
                  onClick={handleClearCart}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-semibold transition-all duration-300"
                >
                  Clear Cart
                </button>

                <Link
                  to="/menu"
                  className="block w-full text-center bg-white border-2 border-orange-600 text-orange-600 py-3 px-6 rounded-xl hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 font-semibold transition-all duration-300"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
