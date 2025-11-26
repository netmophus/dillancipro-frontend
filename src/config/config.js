// src/config/config.js

const resolveDefaultBaseUrl = () => {
  if (typeof window !== "undefined") {
    const isHttps = window.location.protocol === "https:";
    const host = window.location.hostname;

    // En production (hébergée), on force une URL sécurisée si aucune variable n'est définie
    if (isHttps && host && host !== "localhost") {
      
      return "https://dillanciprobackend-e5e16032094e.herokuapp.com/api";
    }
  }

  // Valeur par défaut pour le développement local (réseau interne)
   return "http://192.168.80.198:5000/api";
   //return "http://192.168.0.100:5000/api";
  // return "https://dillanciprobackend-e5e16032094e.herokuapp.com/api";

};

export const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || resolveDefaultBaseUrl();
