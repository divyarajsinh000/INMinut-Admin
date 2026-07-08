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
  // Browsers cache favicons aggressively — we must REMOVE the old link element
  // and INSERT a fresh one (with a cache-busting timestamp) to force a reload.
  useEffect(() => {
    if (!settings?.appIcon) return;
    const iconUrl = getFullMediaUrl(settings.appIcon);
    if (!iconUrl) return;

    // Remove every existing icon link to avoid stale cached entries.
    document
      .querySelectorAll("link[rel~='icon']")
      .forEach((el) => el.parentNode?.removeChild(el));

    // Insert a brand-new <link> with a cache-busting query param.
    const cacheBustedUrl = `${iconUrl}${iconUrl.includes("?") ? "&" : "?"}t=${Date.now()}`;
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = cacheBustedUrl;
    document.head.appendChild(link);
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
