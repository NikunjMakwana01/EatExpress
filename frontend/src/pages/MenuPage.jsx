import { useState, useEffect } from "react";
import api from "../services/api";
import { useCart } from "../contexts/CartContext";
import { toast } from "react-toastify";
import {
  Search,
  Filter,
  Plus,
  Minus,
  ShoppingCart,
  Star,
  Clock,
  Leaf,
} from "lucide-react";

const MenuPage = () => {
  const { addToCart, removeFromCart, updateQuantity, getItemQuantity } = useCart();
  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [filters, setFilters] = useState({
    isVegetarian: false,
    isAvailable: true,
  });

  useEffect(() => {
    fetchCategories();
    fetchFoodItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data);
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        category: selectedCategory,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        isVegetarian: filters.isVegetarian,
        isAvailable: filters.isAvailable,
      };

      const response = await api.get("/food-items", { params });
      setFoodItems(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch menu items");
      console.error("Fetch food items error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodItems();
  }, [searchTerm, selectedCategory, priceRange, filters]);

  const handleAddToCart = (foodItem) => {
    addToCart(foodItem);
  };

  const handleRemoveFromCart = (foodItem) => {
    removeFromCart(foodItem._id);
  };

  const handleQuantityChange = (foodItem, newQuantity) => {
    updateQuantity(foodItem._id, newQuantity);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
    setFilters({ isVegetarian: false, isAvailable: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Loading delicious menu items...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <p className="text-5xl md:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-orange-600">Delicious Menu</span>
          </p>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our carefully curated selection of dishes, each crafted
            with passion and the finest ingredients to satisfy your cravings.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for your favorite dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="flex space-x-3">
              <input
                type="number"
                placeholder="Min ₹"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange((prev) => ({ ...prev, min: e.target.value }))
                }
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
              />
              </div>
              <div className="flex">
              <input
                type="number"
                placeholder="Max ₹"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange((prev) => ({ ...prev, max: e.target.value }))
                }
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
              />
              </div>
            

            {/* Filter Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    isVegetarian: !prev.isVegetarian,
                  }))
                }
                className={`px-6 py-3 text-lg font-semibold rounded-xl transition-all duration-300 flex items-center ${
                  filters.isVegetarian
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Leaf className="h-5 w-5 mr-2" />
                Veg Only
              </button>
              <button
                onClick={clearFilters}
                className="px-6 py-3 text-lg font-semibold text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-all duration-300"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        {foodItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <Filter className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No items found
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Try adjusting your search or filters to find what you're looking
                for.
              </p>
              <button
                onClick={clearFilters}
                className="bg-orange-600 text-white px-8 py-3 rounded-xl hover:bg-orange-700 transition-all duration-300 font-semibold text-lg"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {foodItems.map((foodItem) => {
              const quantity = getItemQuantity(foodItem._id);

              return (
                <div
                  key={foodItem._id}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  {/* Food Item Image */}
                  <div className="relative overflow-hidden">
                    {foodItem.image ? (
                      <>
                        <img
                          src={`http://localhost:5000${foodItem.image}`}
                          alt={foodItem.name}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            console.error(
                              "Image failed to load:",
                              foodItem.image
                            );
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div
                          className="w-full h-56 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
                          style={{ display: "none" }}
                        >
                          <span className="text-gray-400 text-lg">
                            Image not found
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-56 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-gray-400 text-lg">No image</span>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {foodItem.isVegetarian && (
                        <span className="px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-full flex items-center">
                          <Leaf className="h-4 w-4 mr-1" />
                          Veg
                        </span>
                      )}
                      {!foodItem.isAvailable && (
                        <span className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-full">
                          Unavailable
                        </span>
                      )}
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-full flex items-center">
                        <Star className="h-4 w-4 mr-1 fill-current" />
                        4.5
                      </span>
                    </div>
                  </div>

                  {/* Food Item Details */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {foodItem.name}
                      </h3>
                      <span className="text-2xl font-bold text-orange-600">
                        ₹{foodItem.price}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {foodItem.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {foodItem.category && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                            {foodItem.category.name}
                          </span>
                        )}
                        <span className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {foodItem.preparationTime} min
                        </span>
                      </div>
                    </div>

                    {/* Add to Cart Controls */}
                    <div className="flex items-center justify-between">
                      {quantity > 0 ? (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() =>
                              handleQuantityChange(foodItem, quantity - 1)
                            }
                            className="p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors"
                          >
                            <Minus className="h-5 w-5" />
                          </button>
                          <span className="text-xl font-bold text-gray-900 min-w-[2rem] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(foodItem, quantity + 1)
                            }
                            className="p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(foodItem)}
                          disabled={!foodItem.isAvailable}
                          className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
                        >
                          <ShoppingCart className="h-5 w-5" />
                          <span>
                            {foodItem.isAvailable
                              ? "Add to Cart"
                              : "Unavailable"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
