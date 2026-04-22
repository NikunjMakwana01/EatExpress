import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { settingsAPI } from "../services/api";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await settingsAPI.getSettings();
      setSettings(res.data?.data || res.data);
    } catch (e) {
      // Keep fallback UI usable if settings fetch fails.
      setSettings(null);
      console.error("Failed to fetch settings:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  // Keep restaurant name in sync across admin/user tabs.
  useEffect(() => {
    const id = setInterval(() => {
      refreshSettings();
    }, 60000);
    return () => clearInterval(id);
  }, [refreshSettings]);

  const value = useMemo(
    () => ({
      settings,
      restaurantName: settings?.restaurantName || "Eat Express",
      loading,
      refreshSettings,
    }),
    [settings, loading, refreshSettings]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};

