// src/config/config.js

const PROD_SERVER = "https://dillanciprobackend-e5e16032094e.herokuapp.com";
const DEV_SERVER  = "http://192.168.80.29:5000";

const isProd = () =>
  typeof window !== "undefined" &&
  window.location.protocol === "https:" &&
  window.location.hostname !== "localhost";

/** URL de base du serveur (sans /api) — pour les images et fichiers uploadés */
export const BASE_SERVER_URL =
  process.env.REACT_APP_SERVER_BASE_URL ||
  (isProd() ? PROD_SERVER : DEV_SERVER);

/** URL de base de l'API (avec /api) — pour axios */
export const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  `${BASE_SERVER_URL}/api`;
