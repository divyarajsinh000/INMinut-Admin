const TOKEN_KEY = "adminToken";

export const getAdminToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setAdminToken = (token) => sessionStorage.setItem(TOKEN_KEY, token);
export const clearAdminToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  // Remove tokens left by older deployments.
  localStorage.removeItem(TOKEN_KEY);
};

export const migrateLegacyToken = () => {
  const legacyToken = localStorage.getItem(TOKEN_KEY);
  if (legacyToken && !sessionStorage.getItem(TOKEN_KEY)) {
    sessionStorage.setItem(TOKEN_KEY, legacyToken);
  }
  localStorage.removeItem(TOKEN_KEY);
};
