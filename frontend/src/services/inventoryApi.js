import api from "./api";

export const inventoryApi = {
  getAll: (params) => api.get("/inventory", { params }).then((r) => r.data),
  getLowStock: (params) => api.get("/inventory/low-stock", { params }).then((r) => r.data),
  getByProductStore: (productId, storeId) =>
    api.get(`/inventory/${productId}/${storeId}`).then((r) => r.data),
  create: (payload) => api.post("/inventory", payload).then((r) => r.data),
  updateStock: (payload) => api.put("/inventory/update-stock", payload).then((r) => r.data),
  transfer: (payload) => api.post("/inventory/transfer", payload).then((r) => r.data),
};

export default inventoryApi;
