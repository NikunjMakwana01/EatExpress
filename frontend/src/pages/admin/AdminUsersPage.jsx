import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { Users, Mail, Phone, Calendar, Shield, UserCheck, UserX } from "lucide-react";
import api from "../../services/api";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setUsers(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await api.put(`/users/${userId}`, { isActive: newStatus === "active" });
      toast.success(`User ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      toast.success("User role updated successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "user":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    return status === "active" 
      ? "bg-green-100 text-green-800" 
      : "bg-gray-100 text-gray-800";
  };

  const filteredUsers = selectedRole === "all" 
    ? users 
    : users.filter(user => user.role === selectedRole);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-600 mt-2">
            View and manage user accounts
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Filter Users</h2>
          </div>
          <div className="p-6">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="admin">Admins</option>
              <option value="user">Users</option>
            </select>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Users ({filteredUsers.length})
            </h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No users found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedRole === "all" 
                    ? "No users have registered yet." 
                    : `No ${selectedRole} users found.`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Member since {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.isActive ? "active" : "inactive")}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Email</p>
                          <p className="text-gray-900">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Phone</p>
                          <p className="text-gray-900">{user.phone || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Joined</p>
                          <p className="text-gray-900">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    {user.address && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-2">Address:</p>
                        <p className="text-gray-700">
                          {user.address.street && `${user.address.street}, `}
                          {user.address.city && `${user.address.city}, `}
                          {user.address.state && `${user.address.state} `}
                          {user.address.zipCode && `${user.address.zipCode}`}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Actions:</span>
                      </div>
                      <div className="flex space-x-2">
                        {/* Role Update */}
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user._id, e.target.value)}
                          className="px-3 py-1 rounded-md text-sm font-medium border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>

                        {/* Status Toggle */}
                        <button
                          onClick={() => toggleUserStatus(user._id, user.isActive ? "active" : "inactive")}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center ${
                            user.isActive
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </button>
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

export default AdminUsersPage; 