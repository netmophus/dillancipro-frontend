
import axios from "axios";
import { BASE_URL } from "./config/config";

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// 👉 Intercepteur pour ajouter automatiquement le token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;