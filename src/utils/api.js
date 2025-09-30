import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// 👉 Debug : affiche la baseURL en console quand ton app démarre
console.log("📡 API baseURL:", api.defaults.baseURL);

// Ajout du JWT si dispo
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
