import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AdminNavbar from "../../components/admin/AdminNavbar";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react";
import api from "../../services/api";

const AdminReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    // If a user deletes a pending reservation while this tab is open,
    // refresh when the admin comes back to the tab.
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchReservations();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reservations");
      const sortedData = response.data.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setReservations(sortedData);
    } catch (error) {
      toast.error("Failed to fetch reservations");
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (reservationId, status) => {
    try {
      await api.put(`/reservations/${reservationId}/status`, { status });
      toast.success("Reservation status updated successfully");
      fetchReservations();
    } catch (error) {
      toast.error("Failed to update reservation status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredReservations =
    selectedStatus === "all"
      ? reservations
      : reservations.filter(
          (reservation) => reservation.status === selectedStatus,
        );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Reservations
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage table reservations
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Filter Reservations
            </h2>
          </div>
          <div className="p-6">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Reservations</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Reservations List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Reservations ({filteredReservations.length})
            </h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading reservations...</p>
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No reservations found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedStatus === "all"
                    ? "No reservations have been made yet."
                    : `No ${selectedStatus} reservations found.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReservations.map((reservation) => (
                  <div
                    key={reservation._id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Reservation #{reservation._id.slice(-6).toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(reservation.createdAt).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(reservation.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(reservation.status)}
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}
                        >
                          {reservation.status.charAt(0).toUpperCase() +
                            reservation.status.slice(1)}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            reservation.depositPaid ||
                            reservation.paymentStatus === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                          title="Reservation deposit payment status"
                        >
                          {reservation.depositPaid ||
                          reservation.paymentStatus === "completed"
                            ? "Deposit Paid"
                            : "Deposit Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Guests
                          </p>
                          <p className="text-gray-900">
                            {reservation.numberOfPeople} people
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Date
                          </p>
                          <p className="text-gray-900">
                            {new Date(reservation.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Time
                          </p>
                          <p className="text-gray-900">{reservation.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Customer
                          </p>
                          <p className="text-gray-900">
                            {reservation.name ||
                              reservation.user?.name ||
                              "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Table Type and Occasion */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Table Type
                        </p>
                        <p className="text-gray-900">
                          {reservation.tableType || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Occasion
                        </p>
                        <p className="text-gray-900 capitalize">
                          {reservation.occasion || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {reservation.specialRequests && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          Special Requests:
                        </p>
                        <p className="text-gray-700">
                          {reservation.specialRequests}
                        </p>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Phone
                        </p>
                        <p className="text-gray-900">
                          {reservation.phone || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Email
                        </p>
                        <p className="text-gray-900">
                          {reservation.email || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Status Update */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          Update Status:
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {["pending", "confirmed", "cancelled", "completed"].map(
                          (status) => (
                            <button
                              key={status}
                              onClick={() =>
                                updateReservationStatus(reservation._id, status)
                              }
                              disabled={reservation.status === status}
                              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                reservation.status === status
                                  ? "bg-orange-100 text-orange-800 cursor-not-allowed"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ),
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
    </div>
  );
};

export default AdminReservationsPage;
