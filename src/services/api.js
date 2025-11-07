// src/services/api.js
import axios from "axios";

const api = axios.create({
 // baseURL: "http://localhost:5000/api", // Utiliser localhost pour le développement local
  // Alternatives si localhost ne fonctionne pas:
  // baseURL: "http://192.168.0.100:5000/api", // Votre IP locale actuelle
 // baseURL: "http://192.168.0.100:5000/api",
    baseURL:"https://dillanciprobackend-e5e16032094e.herokuapp.com/api",
});

// Intercepteur pour ajouter automatiquement le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;


