import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { reservationAPI } from "../services/api";
import { toast } from "react-toastify";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Gift,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Plus,
  Filter,
  Search,
} from "lucide-react";

const MyReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchReservations();
  }, [filter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter && filter !== "all") {
        params.status = filter;
      }
      const response = await reservationAPI.getReservations(params);
      setReservations(response.data.data);
    } catch (error) {
      console.error("Fetch reservations error:", error);
      toast.error("Failed to fetch reservations");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

    try {
      await reservationAPI.cancelReservation(reservationId);
      toast.success("Reservation cancelled successfully");
      fetchReservations(); // Refresh the list
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to cancel reservation";
      toast.error(errorMessage);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    return time;
  };

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your reservations...</p>
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
            My <span className="text-orange-600">Reservations</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            View and manage your table reservations. Keep track of your upcoming
            dining experiences.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Actions Bar */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/reservation"
                  className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Reservation
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reservations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Filter */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Filter:</span>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="all">All Reservations</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          {!loading && (
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredReservations.length} reservation
              {filteredReservations.length !== 1 ? "s" : ""}
              {filter !== "all" && ` (${filter} status)`}
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          )}

          {/* Reservations List */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reservations...</p>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Reservations Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filter !== "all"
                  ? "No reservations match your current filters."
                  : "You haven't made any reservations yet."}
              </p>
              <Link
                to="/reservation"
                className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2" />
                Make Your First Reservation
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation._id}
                  className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {reservation.name}
                      </h3>
                      <p className="text-gray-600">{reservation.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(reservation.status)}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          reservation.status
                        )}`}
                      >
                        {getStatusText(reservation.status)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          reservation.depositPaid
                            ? "bg-green-100 text-green-800"
                            : reservation.paymentStatus === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {reservation.depositPaid
                          ? "Deposit Paid"
                          : reservation.paymentStatus === "failed"
                            ? "Deposit Failed"
                            : "Deposit Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">
                        {formatDate(reservation.date)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">
                        {formatTime(reservation.time)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">
                        {reservation.numberOfPeople}{" "}
                        {reservation.numberOfPeople === 1 ? "Guest" : "Guests"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 capitalize">
                        {reservation.tableType?.replace("-", " ")}
                      </span>
                    </div>

                    {reservation.occasion && (
                      <div className="flex items-center space-x-3">
                        <Gift className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700 capitalize">
                          {reservation.occasion}
                        </span>
                      </div>
                    )}

                    {reservation.specialRequests && (
                      <div className="flex items-start space-x-3">
                        <MessageSquare className="w-5 h-5 text-gray-400 mt-1" />
                        <span className="text-gray-700 text-sm">
                          {reservation.specialRequests}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Created:{" "}
                      {new Date(reservation.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex space-x-2">
                      {reservation.status === "pending" &&
                        !reservation.depositPaid && (
                        <button
                          onClick={() =>
                            handleCancelReservation(reservation._id)
                          }
                          className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300 text-sm font-semibold"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReservationsPage;
