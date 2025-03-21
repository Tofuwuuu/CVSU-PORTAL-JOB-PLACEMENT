export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const removeToken = () => localStorage.removeItem("token");

export const getRole = () => localStorage.getItem("role");
export const setRole = (role) => localStorage.setItem("role", role);
export const removeRole = () => localStorage.removeItem("role");

export const isAuthenticated = () => !!getToken();
export const isAdmin = () => getRole() === "admin";
