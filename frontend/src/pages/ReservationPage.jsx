import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { reservationAPI } from "../services/api";
import { toast } from "react-toastify";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Gift,
  MessageSquare,
  ChefHat,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const ReservationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    date: "",
    time: "",
    guests: 2,
    tableType: "4-seater",
    occasion: "casual",
    specialRequests: "",
  });

  const timeSlots = [
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
  ];

  const tableTypes = [
    { value: "2-seater", label: "2-Seater Table", capacity: 2 },
    { value: "4-seater", label: "4-Seater Table", capacity: 4 },
    { value: "6-seater", label: "6-Seater Table", capacity: 6 },
    { value: "8-seater", label: "8-Seater Table", capacity: 8 },
    { value: "private", label: "Private Room", capacity: 10 },
  ];

  const occasions = [
    { value: "casual", label: "Casual Dining" },
    { value: "birthday", label: "Birthday Celebration" },
    { value: "anniversary", label: "Anniversary" },
    { value: "business", label: "Business Meeting" },
    { value: "other", label: "Other" },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await reservationAPI.createReservation(formData);
      const reservation = res.data.data;

      toast.info("Reservation created. Please pay the 500 deposit to confirm.");
      navigate(`/reservation/payment/${reservation._id}`);
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.errors?.[0]?.msg ||
        "Failed to create reservation";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  //   try {
  //     const response = await reservationAPI.createReservation(formData);
  //     toast.success('Reservation created successfully!');
  //     navigate('/my-reservations');
  //   } catch (error) {
  //     const errorMessage = error.response?.data?.error || 'Failed to create reservation';
  //     toast.error(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return thirtyDaysFromNow.toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-4xl font-bold text-gray-900 mb-4">
            Book Your <span className="text-orange-600">Table</span>
          </h1>
          <p className="text-l text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Reserve your perfect table for an unforgettable dining experience.
            Choose your preferred date, time, and we'll ensure everything is
            perfect.
          </p>
        </div>

        <div className="max-w-8xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Reservation Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Reservation Details
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-md transition-all duration-300"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-md transition-all duration-300"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-md transition-all duration-300"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="date"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        <Calendar className="inline w-4 h-4 mr-2" />
                        Date *
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        required
                        min={getMinDate()}
                        max={getMaxDate()}
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-md transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="time"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        <Clock className="inline w-4 h-4 mr-2" />
                        Time *
                      </label>
                      <select
                        id="time"
                        name="time"
                        required
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-md transition-all duration-300"
                      >
                        <option value="">Select time</option>
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Guests and Table Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="guests"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        <Users className="inline w-4 h-4 mr-2" />
                        Number of Guests *
                      </label>
                      <select
                        id="guests"
                        name="guests"
                        required
                        value={formData.guests}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-md transition-all duration-300"
                      >
                        {[...Array(20)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i === 0 ? "Guest" : "Guests"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="tableType"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        <MapPin className="inline w-4 h-4 mr-2" />
                        Table Type *
                      </label>
                      <select
                        id="tableType"
                        name="tableType"
                        required
                        value={formData.tableType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-md transition-all duration-300"
                      >
                        {tableTypes.map((table) => (
                          <option key={table.value} value={table.value}>
                            {table.label} (up to {table.capacity} guests)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Occasion */}
                  <div>
                    <label
                      htmlFor="occasion"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      <Gift className="inline w-4 h-4 mr-2" />
                      Occasion
                    </label>
                    <select
                      id="occasion"
                      name="occasion"
                      value={formData.occasion}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-md transition-all duration-300"
                    >
                      {occasions.map((occasion) => (
                        <option key={occasion.value} value={occasion.value}>
                          {occasion.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label
                      htmlFor="specialRequests"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      <MessageSquare className="inline w-4 h-4 mr-2" />
                      Special Requests
                    </label>
                    <textarea
                      id="specialRequests"
                      name="specialRequests"
                      rows="2"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-md transition-all duration-300 resize-none"
                      placeholder="Any special requests or dietary requirements..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Reservation...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Book Table
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </div>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Information Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Reservation Info
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Instant Confirmation
                      </h4>
                      <p className="text-sm text-gray-600">
                        Get immediate confirmation for your reservation
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <ChefHat className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Premium Service
                      </h4>
                      <p className="text-sm text-gray-600">
                        Enjoy our exceptional dining experience
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Flexible Timing
                      </h4>
                      <p className="text-sm text-gray-600">
                        Choose from multiple time slots
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-orange-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Important Notes:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Reservations can be made up to 30 days in advance</li>
                    <li>
                      Please arrive 5 minutes before your reservation time
                    </li>
                    <li>
                      Cancellations must be made at least 2 hours in advance
                    </li>
                    <li>Special requests are subject to availability</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationPage;
