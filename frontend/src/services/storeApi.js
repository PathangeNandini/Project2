import api from "./api";

export const storeApi = {
  getAll: () => api.get("/stores").then((r) => r.data),
  getById: (id) => api.get(`/stores/${id}`).then((r) => r.data),
  create: (payload) => api.post("/stores", payload).then((r) => r.data),
  update: (id, payload) => api.put(`/stores/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/stores/${id}`).then((r) => r.data),
};

export default storeApi;
