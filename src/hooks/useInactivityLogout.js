// src/hooks/useInactivityLogout.js
import { useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";

const useInactivityLogout = (timeout = 60000) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      console.log("Aucune activité détectée pendant", timeout / 1000, "secondes. Déconnexion.");
      logout(); // Appel de la déconnexion dans le contexte
      navigate("/login"); // Redirection vers la page de login
    }, timeout);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeout, logout, navigate]);
};

export default useInactivityLogout;
