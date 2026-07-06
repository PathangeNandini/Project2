import api from "./api";

export const dashboardApi = {
  getSummary: (params) => api.get("/dashboard/summary", { params }).then((r) => r.data),
};

export default dashboardApi;
