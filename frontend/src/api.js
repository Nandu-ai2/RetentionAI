
import axios from "axios";

// ======================================
// API CONFIG
// ======================================

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// ======================================
// REQUEST INTERCEPTOR
// ======================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ======================================
// RESPONSE INTERCEPTOR
// ======================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      window.location.href = "/";
    }

    console.error(
      "API Error:",
      error.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

// ======================================
// AUTH APIs
// ======================================

export const register = async (data) => {
  return await api.post("/register", data);
};

export const login = async (data) => {
  return await api.post("/login", data);
};

// ======================================
// CHURN PREDICTION
// ======================================

export const predictChurn = async (data) => {
  return await api.post("/predict", data);
};

// ======================================
// HISTORY
// ======================================

export const getHistory = async () => {
  return await api.get("/predict/history");
};


// ======================================
// DATASETS
// ======================================

export const uploadDataset = async (file) => {
  const form = new FormData();
  form.append("file", file);
  return await api.post("/predict/datasets/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getDatasets = async () => {
  return await api.get("/predict/datasets");
};

// ======================================
// EXPORT
// ======================================

export default api;

