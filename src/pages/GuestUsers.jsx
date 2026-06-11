import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import { FiBell, FiBellOff, FiTrash2, FiRefreshCw, FiSmartphone } from "react-icons/fi";

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "-");
const maskToken = (token = "") => (!token ? "-" : token.length <= 18 ? token : `${token.slice(0, 10)}...${token.slice(-8)}`);

const getDevices = (item) => {
  const devices = Array.isArray(item.devices)
    ? item.devices.filter((device) => device?.expoPushToken || device?.fcmToken)
    : [];

  if (devices.length > 0) return devices;

  if (item.expoPushToken || item.fcmToken) {
    return [
      {
        _id: `${item._id}-legacy`,
        deviceId: "legacy-device",
        expoPushToken: item.expoPushToken,
        fcmToken: item.fcmToken,
        platform: item.platform,
        deviceName: item.deviceName,
        appVersion: item.appVersion,
        notificationsEnabled: item.notificationsEnabled,
        lastSeenAt: item.lastSeenAt,
      },
    ];
  }

  return [];
};

const GuestUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const deviceRows = useMemo(() => {
    return users.flatMap((user) => {
      const devices = getDevices(user);
      if (devices.length === 0) {
        return [{ user, device: null, key: `${user._id}-empty` }];
      }

      return devices.map((device, index) => ({
        user,
        device,
        key: device._id || device.deviceId || device.expoPushToken || device.fcmToken || `${user._id}-${index}`,
      }));
    });
  }, [users]);

  const enabledDeviceCount = useMemo(
    () => deviceRows.filter((row) => row.device && row.device.notificationsEnabled !== false).length,
    [deviceRows]
  );

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/guest-users");
      setUsers(res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load app users");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this app guest user and all its registered devices?")) return;
    try {
      await axiosInstance.delete(`/guest-users/${id}`);
      toast.success("Guest user deleted");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete guest user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <AdminLayout title="App Guest Devices">
      <div className="bg-slate-950 text-white rounded-[2rem] p-6 mb-6 flex items-center justify-between gap-5 overflow-hidden relative">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-cyan-500 flex items-center justify-center">
            <FiSmartphone className="text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Registered app devices</h2>
            <p className="text-slate-300 mt-1">
              {users.length} guest users · {deviceRows.length} device rows · {enabledDeviceCount} notification-enabled devices.
            </p>
            <p className="text-cyan-100 text-xs font-bold mt-1">
              Open the app once on every phone after updating so each phone sends its own deviceId and Expo token.
            </p>
          </div>
        </div>
        <button onClick={fetchUsers} className="relative z-10 inline-flex items-center gap-2 px-4 py-3 bg-white text-slate-950 rounded-2xl font-black hover:bg-cyan-50">
          <FiRefreshCw />Refresh
        </button>
      </div>

      <div className="bg-white/90 rounded-[1.6rem] shadow-sm border border-cyan-100 overflow-hidden">
        {loading ? (
          <p className="p-6 text-center text-slate-500 font-bold">Loading...</p>
        ) : deviceRows.length === 0 ? (
          <p className="p-8 text-center text-slate-500 font-bold">No app devices registered yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cyan-50 text-slate-700">
                <tr>
                  <th className="text-left p-4">Device</th>
                  <th className="text-left p-4">Guest ID</th>
                  <th className="text-left p-4">Push Tokens</th>
                  <th className="text-left p-4">Cities</th>
                  <th className="text-left p-4">Notification</th>
                  <th className="text-left p-4">Last Seen</th>
                  <th className="text-right p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {deviceRows.map(({ user, device, key }) => (
                  <tr key={key} className="border-t border-cyan-50 hover:bg-cyan-50/40 align-top">
                    <td className="p-4 min-w-[240px]">
                      {device ? (
                        <div>
                          <p className="font-black text-slate-800">{device.deviceName || "Unknown device"}</p>
                          <p className="text-xs text-slate-500 font-semibold capitalize">
                            {device.platform || "unknown"}{device.appVersion ? ` · v${device.appVersion}` : ""}
                          </p>
                          <p className="mt-1 text-[11px] font-mono text-cyan-700 break-all">
                            Device ID: {device.deviceId || "not sent by old app"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-slate-400 font-bold">No device token saved</p>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 max-w-[240px] break-all font-mono text-xs">{user.guestId}</td>
                    <td className="p-4 min-w-[300px]">
                      <p className="text-slate-500 font-mono text-xs">Expo: {maskToken(device?.expoPushToken)}</p>
                      <p className="text-slate-500 font-mono text-xs mt-1">FCM: {maskToken(device?.fcmToken)}</p>
                    </td>
                    <td className="p-4 text-slate-700 max-w-[260px] font-semibold">
                      {user.cityPreferences?.length ? user.cityPreferences.map((city) => city.name).join(", ") : "All cities / no preference"}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black ${device?.notificationsEnabled !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {device?.notificationsEnabled !== false ? <FiBell /> : <FiBellOff />}
                        {device?.notificationsEnabled !== false ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-semibold">{formatDateTime(device?.lastSeenAt || user.lastSeenAt)}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => deleteUser(user._id)} className="p-2.5 bg-red-50 rounded-xl hover:bg-red-100" title="Delete guest user and all devices">
                        <FiTrash2 className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default GuestUsers;
