import api from "./api";

export const userApi = {
  getAll: () => api.get("/users").then((r) => r.data),
  getById: (id) => api.get(`/users/${id}`).then((r) => r.data),
  update: (id, payload) => api.put(`/users/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/users/${id}`).then((r) => r.data),
  // creating a user re-uses the public register endpoint
  create: (payload) => api.post("/auth/register", payload).then((r) => r.data),
};

export default userApi;
