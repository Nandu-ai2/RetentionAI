import axios from "axios";

// ======================================
// API CONFIG
// ======================================

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// ======================================
// REQUEST INTERCEPTOR
// ======================================

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ======================================
// RESPONSE INTERCEPTOR
// ======================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API Error:",
      error.response?.data || error.message
    );

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

// ======================================
// AUTH
// ======================================

export const register = (data) =>
  api.post("/register", data);

export const login = (data) =>
  api.post("/login", data);

// ======================================
// PREDICTIONS
// ======================================

export const predictChurn = (data) =>
  api.post("/predict/", data);   // trailing slash

export const getHistory = () =>
  api.get("/predict/history");

// ======================================
// DATASETS
// ======================================

export const uploadDataset = (file) => {
  const formData = new FormData();

  formData.append("file", file);

  return api.post(
    "/predict/datasets/upload",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );
};

export const getDatasets = () =>
  api.get("/predict/datasets");

export default api;