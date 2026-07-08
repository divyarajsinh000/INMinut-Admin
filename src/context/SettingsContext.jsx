import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { getFullMediaUrl } from "../components/MediaPreview";

const SettingsContext = createContext({
  appLogo: null,
  appIcon: null,
  settings: null,
  reloadSettings: () => {},
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);

  const loadSettings = async () => {
    try {
      const res = await axiosInstance.get("/settings");
      if (res.data.settings) {
        setSettings(res.data.settings);
      }
    } catch {
      // Settings are non-critical; silently ignore fetch errors.
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Dynamically update the browser favicon whenever appIcon changes.
  useEffect(() => {
    if (!settings?.appIcon) return;
    const iconUrl = getFullMediaUrl(settings.appIcon);
    if (!iconUrl) return;

    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/png";
    link.href = iconUrl;
  }, [settings?.appIcon]);

  const appLogo = settings?.appLogo ? getFullMediaUrl(settings.appLogo) : null;
  const appIcon = settings?.appIcon ? getFullMediaUrl(settings.appIcon) : null;

  return (
    <SettingsContext.Provider
      value={{ appLogo, appIcon, settings, reloadSettings: loadSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
