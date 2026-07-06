import api from "./api";

export const productApi = {
  getAll: (params) => api.get("/products", { params }).then((r) => r.data),
  getById: (id) => api.get(`/products/${id}`).then((r) => r.data),
  getByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`).then((r) => r.data),
  create: (payload) => api.post("/products", payload).then((r) => r.data),
  update: (id, payload) => api.put(`/products/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/products/${id}`).then((r) => r.data),
};

export default productApi;
