import { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import AdminNavbar from "../../components/admin/AdminNavbar";
import {
  Mail,
  User,
  Calendar,
  MessageSquare,
  CheckCircle,
  Clock,
  Trash2,
  Filter,
  Search,
} from "lucide-react";

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get("/contacts");
      setMessages(response.data.data);
    } catch (error) {
      console.error("Fetch messages error:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/contacts/${id}`, { status });
      toast.success(`Message marked as ${status}`);
      fetchMessages();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await api.delete(`/contacts/${id}`);
      toast.success("Message deleted successfully");
      fetchMessages();
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const filteredMessages = messages
    .filter((msg) => {
      if (filter === "unread") return msg.status === "unread";
      if (filter === "read") return msg.status === "read";
      return true;
    })
    .filter((msg) => {
      const search = searchTerm.toLowerCase();
      return (
        msg.name.toLowerCase().includes(search) ||
        msg.email.toLowerCase().includes(search) ||
        msg.subject.toLowerCase().includes(search) ||
        msg.message.toLowerCase().includes(search)
      );
    });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
            <p className="text-gray-600 mt-2">
              View and manage customer inquiries and feedback.
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Messages</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-6">
          {filteredMessages.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No messages found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your filters or search.</p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg._id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden border ${
                  msg.status === "unread" ? "border-orange-200 bg-orange-50/10" : "border-gray-100"
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {msg.status === "unread" && (
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                            NEW
                          </span>
                        )}
                        <h3 className="text-xl font-bold text-gray-900">{msg.subject}</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span className="font-medium text-gray-900 mr-2">From:</span>
                          {msg.name}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="font-medium text-gray-900 mr-2">Email:</span>
                          <a href={`mailto:${msg.email}`} className="text-orange-600 hover:underline">
                            {msg.email}
                          </a>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="font-medium text-gray-900 mr-2">Date:</span>
                          {formatDate(msg.createdAt)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          {msg.status === 'read' ? (
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 mr-2 text-orange-500" />
                          )}
                          <span className="font-medium text-gray-900 mr-2">Status:</span>
                          <span className={msg.status === 'read' ? 'text-green-600' : 'text-orange-600'}>
                            {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap italic border border-gray-100">
                        "{msg.message}"
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2">
                      {msg.status === "unread" && (
                        <button
                          onClick={() => handleUpdateStatus(msg._id, "read")}
                          className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-bold shadow-sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Read
                        </button>
                      )}
                      {msg.status === "read" && (
                        <button
                          onClick={() => handleUpdateStatus(msg._id, "unread")}
                          className="flex items-center justify-center px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-bold"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Mark Unread
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-bold"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessagesPage;
