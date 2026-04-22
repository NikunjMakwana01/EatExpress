import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import {
  ArrowRight,
  Clock,
  Truck,
  Star,
  Shield,
  ChefHat,
} from "lucide-react";

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { restaurantName } = useSettings();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-white-300 via-white-600 to-red-600 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black opacity-100"></div>
        <div className="bg-g absolute inset-0  opacity-70"></div>

        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
                <ChefHat className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Delicious Food
                <span className="block text-orange-200 mt-2">
                  Delivered Fast
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-orange-100 max-w-3xl mx-auto leading-relaxed">
                Experience the finest culinary delights from the best
                restaurants in town. Fast delivery, fresh ingredients, and
                amazing taste guaranteed.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/menu"
                className="group bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
              >
                Browse Our Menu
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-orange-600 transition-all duration-300 transform hover:scale-105"
                >
                  Get Started Today
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose{" "}
              <span className="text-orange-600">{restaurantName}</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We provide the best food delivery experience with quality service,
              fresh ingredients, and exceptional customer satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Clock className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Lightning Fast
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get your food delivered within 30 minutes or it's completely
                free. We value your time as much as you do.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-100 to-green-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Truck className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Free Delivery
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Enjoy free delivery on all orders above ₹200. No hidden charges,
                just pure convenience.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Star className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Premium Quality
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Fresh ingredients and quality food from top-rated restaurants.
                Every dish is crafted with care and passion.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Safe & Secure
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Contactless delivery and secure payment options. Your safety and
                satisfaction are our top priorities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Popular <span className="text-orange-600">Categories</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our wide variety of delicious food categories, each
              carefully curated to satisfy your cravings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Pizza & Italian",
                image: "🍕",
                description:
                  "Fresh and cheesy pizzas with authentic Italian flavors",
                color: "from-red-100 to-red-200",
                textColor: "text-red-600",
              },
              {
                name: "Burgers & Fast Food",
                image: "🍔",
                description:
                  "Juicy and delicious burgers with premium ingredients",
                color: "from-yellow-100 to-yellow-200",
                textColor: "text-yellow-600",
              },
              {
                name: "Asian Cuisine",
                image: "🍣",
                description: "Fresh and healthy Asian dishes with bold flavors",
                color: "from-green-100 to-green-200",
                textColor: "text-green-600",
              },
              {
                name: "Desserts & Sweets",
                image: "🍰",
                description: "Sweet and delightful desserts for every occasion",
                color: "from-pink-100 to-pink-200",
                textColor: "text-pink-600",
              },
              {
                name: "Beverages & Drinks",
                image: "🥤",
                description: "Refreshing drinks and specialty beverages",
                color: "from-blue-100 to-blue-200",
                textColor: "text-blue-600",
              },
              {
                name: "Healthy & Salads",
                image: "🥗",
                description:
                  "Healthy and fresh salads with nutritious ingredients",
                color: "from-emerald-100 to-emerald-200",
                textColor: "text-emerald-600",
              },
            ].map((category, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div
                  className={`bg-gradient-to-br ${category.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <span className="text-3xl">{category.image}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {category.name}
                </h3>
                <p className="text-gray-600 mb-6 text-center leading-relaxed">
                  {category.description}
                </p>
                <Link
                  to="/menu"
                  className={`block text-center font-semibold ${category.textColor} hover:opacity-80 transition-opacity`}
                >
                  Explore Menu →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-600 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
              <div className="text-orange-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-orange-100">Restaurant Partners</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">30min</div>
              <div className="text-orange-100">Average Delivery</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">4.8★</div>
              <div className="text-orange-100">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Experience{" "}
              <span className="text-orange-400">Amazing Food</span>?
            </h2>
            <p className="text-xl mb-8 text-gray-300 leading-relaxed">
              Join thousands of satisfied customers who trust us for their daily
              meals. Start your culinary journey today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/menu"
                className="group bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
              >
                Start Ordering Now
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
                >
                  Create Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
