import api from "./api";

export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials).then((r) => r.data),
  register: (payload) => api.post("/auth/register", payload).then((r) => r.data),
  getMe: () => api.get("/auth/me").then((r) => r.data),
};

export default authApi;
