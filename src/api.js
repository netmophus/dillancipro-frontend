
import axios from "axios";

const API = axios.create({
  //baseURL: "http://localhost:5000/api", // Utiliser localhost pour le développement local
  // Production: "https://fahimtabackend-647bfe306335.herokuapp.com/api",
  // IP locale si nécessaire: "http://192.168.0.100:5000/api",

   baseURL:"https://dillanciprobackend-e5e16032094e.herokuapp.com/api",
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