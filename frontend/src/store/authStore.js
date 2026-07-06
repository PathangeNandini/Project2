import { create } from "zustand";
import authApi from "../services/authApi";

const storedUser = (() => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
})();

export const useAuthStore = create((set, get) => ({
  user: storedUser || null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,

  isAuthenticated: () => !!get().token,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const data = await authApi.login(credentials);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const data = await authApi.register(payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
