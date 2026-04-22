import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { Settings, Save, Database, Shield, Bell, Palette } from "lucide-react";
import { settingsAPI } from "../../services/api";
import { useSettings } from "../../contexts/SettingsContext";

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    restaurantName: "Eat Express",
    restaurantEmail: "info@eatexpress.com",
    restaurantPhone: "(555) 123-4567",
    restaurantAddress: "123 Food Street, City, State 12345",
    openingHours: "11:00 AM - 10:00 PM",
    deliveryRadius: "5",
    minimumOrder: "100",
    taxRate: "5",
    notifications: {
      newOrders: true,
      newReservations: true,
      lowStock: true,
      systemAlerts: true,
    },
  });

  const [loading, setLoading] = useState(false);
  const { refreshSettings } = useSettings();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsAPI.getSettings();
        const saved = res.data?.data || res.data;
        if (saved) setSettings(saved);
      } catch (e) {
        toast.error("Failed to load settings");
      }
    };

    fetchSettings();
  }, []);

  const handleSettingChange = (category, key, value) => {
    if (category) {
      setSettings((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value,
        },
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await settingsAPI.updateSettings(settings);
      toast.success("Settings saved successfully");
      await refreshSettings();
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure your restaurant settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Restaurant Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Restaurant Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={settings.restaurantName}
                  onChange={(e) =>
                    handleSettingChange(null, "restaurantName", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.restaurantEmail}
                  onChange={(e) =>
                    handleSettingChange(null, "restaurantEmail", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={settings.restaurantPhone}
                  onChange={(e) =>
                    handleSettingChange(null, "restaurantPhone", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={settings.restaurantAddress}
                  onChange={(e) =>
                    handleSettingChange(
                      null,
                      "restaurantAddress",
                      e.target.value,
                    )
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opening Hours
                </label>
                <input
                  type="text"
                  value={settings.openingHours}
                  onChange={(e) =>
                    handleSettingChange(null, "openingHours", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Business Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Business Settings
              </h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Radius (km)
                </label>
                <input
                  type="number"
                  value={settings.deliveryRadius}
                  onChange={(e) =>
                    handleSettingChange(null, "deliveryRadius", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Amount (₹)
                </label>
                <input
                  type="number"
                  value={settings.minimumOrder}
                  onChange={(e) =>
                    handleSettingChange(null, "minimumOrder", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) =>
                    handleSettingChange(null, "taxRate", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Notifications */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </p>
                    <p className="text-xs text-gray-500">
                      Receive notifications for{" "}
                      {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        handleSettingChange(
                          "notifications",
                          key,
                          e.target.checked,
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
