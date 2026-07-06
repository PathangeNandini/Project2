import api from "./api";

export const orderApi = {
  getAll: (params) => api.get("/orders", { params }).then((r) => r.data),
  getById: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  checkout: (payload) => api.post("/orders/checkout", payload).then((r) => r.data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }).then((r) => r.data),
};

export default orderApi;
