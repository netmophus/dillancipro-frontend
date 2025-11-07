// src/config/config.js

const resolveDefaultBaseUrl = () => {
  if (typeof window !== "undefined") {
    const isHttps = window.location.protocol === "https:";
    const host = window.location.hostname;

    // En production (hébergée), on force une URL sécurisée si aucune variable n'est définie
    if (isHttps && host && host !== "localhost") {
      return "https://<REMPLACEZ_PAR_VOTRE_BACKEND_PROD>/api";
    }
  }

  // Valeur par défaut pour le développement local (réseau interne)
  return "https://dillanciprobackend-e5e16032094e.herokuapp.com/api";

};

export const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || resolveDefaultBaseUrl();
