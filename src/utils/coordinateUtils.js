/**
 * Utilitaires pour la conversion des coordonnées GPS
 * Support des formats : Décimal (DD) et Degrés/Minutes/Secondes (DMS)
 */

/**
 * Convertit les coordonnées DMS vers décimal
 * Format d'entrée : "N 13°34'02.2" ou "13°34'02.2 N" ou "13 34 02.2"
 * @param {string} dmsString - Chaîne au format DMS
 * @returns {number|null} - Coordonnée décimale ou null si invalide
 */
export const dmsToDecimal = (dmsString) => {
  console.log("🔍 [DMS_TO_DECIMAL] Début conversion:", dmsString);
  
  if (!dmsString || typeof dmsString !== "string") {
    console.warn("❌ [DMS_TO_DECIMAL] Chaîne vide ou invalide");
    return null;
  }

  // Nettoyer la chaîne et remplacer les apostrophes typographiques par des apostrophes simples
  let cleaned = dmsString.trim();
  console.log("📝 [DMS_TO_DECIMAL] Chaîne originale:", dmsString);
  
  // Remplacer les différents types d'apostrophes typographiques (U+2019, U+2032) par apostrophe simple
  cleaned = cleaned.replace(/[''′‵]/g, "'");
  cleaned = cleaned.replace(/[""]/g, '"');
  console.log("🧹 [DMS_TO_DECIMAL] Chaîne nettoyée:", cleaned);
  
  // Convertir en majuscules pour la détection N/E/S/W
  const cleanedUpper = cleaned.toUpperCase();
  console.log("🔤 [DMS_TO_DECIMAL] Chaîne en majuscules:", cleanedUpper);

  // Déterminer le signe (N/S pour latitude, E/W pour longitude)
  let sign = 1;
  if (cleanedUpper.includes("S") || cleanedUpper.includes("W")) {
    sign = -1;
    console.log("📍 [DMS_TO_DECIMAL] Signe négatif détecté (S ou W)");
  }
  if (cleanedUpper.includes("N") || cleanedUpper.includes("E")) {
    sign = 1;
    console.log("📍 [DMS_TO_DECIMAL] Signe positif détecté (N ou E)");
  }
  console.log("🔢 [DMS_TO_DECIMAL] Signe final:", sign);

  // Extraire les nombres (degrés, minutes, secondes)
  // Format: "N 13°34'02.2" ou "13°34'02.2" ou "13 34 02.2"
  // Regex améliorée pour capturer même avec espaces avant les degrés
  // Pattern 1: avec symboles ° et ' (apostrophe simple ou typographique)
  let regex = /(\d+)[°\s]*(\d+)[\'"′\s]+(\d+\.?\d*)/;
  let match = cleaned.match(regex);
  console.log("🔎 [DMS_TO_DECIMAL] Regex Pattern 1:", regex);
  console.log("🔎 [DMS_TO_DECIMAL] Match Pattern 1:", match);

  if (!match) {
    // Pattern 2: format simplifié sans symboles (juste espaces)
    const simpleMatch = cleaned.match(/(\d+)\s+(\d+)\s+(\d+\.?\d*)/);
    console.log("🔎 [DMS_TO_DECIMAL] Match Pattern 2 (simplifié):", simpleMatch);
    if (simpleMatch) {
      const degrees = parseFloat(simpleMatch[1]);
      const minutes = parseFloat(simpleMatch[2]);
      const seconds = parseFloat(simpleMatch[3]);
      const result = sign * (degrees + minutes / 60 + seconds / 3600);
      console.log(`✅ [DMS_TO_DECIMAL] Format simplifié "${dmsString}" → ${result}`);
      console.log(`   Détails: ${degrees}° + ${minutes}'/60 + ${seconds}"/3600 = ${result}`);
      return result;
    }
    
    // Pattern 3: essayer avec format très flexible
    const flexibleMatch = cleaned.match(/(\d+)[^\d]*(\d+)[^\d]*(\d+\.?\d*)/);
    console.log("🔎 [DMS_TO_DECIMAL] Match Pattern 3 (flexible):", flexibleMatch);
    if (flexibleMatch) {
      const degrees = parseFloat(flexibleMatch[1]);
      const minutes = parseFloat(flexibleMatch[2]);
      const seconds = parseFloat(flexibleMatch[3]);
      const result = sign * (degrees + minutes / 60 + seconds / 3600);
      console.log(`✅ [DMS_TO_DECIMAL] Format flexible "${dmsString}" → ${result}`);
      console.log(`   Détails: ${degrees}° + ${minutes}'/60 + ${seconds}"/3600 = ${result}`);
      return result;
    }
    
    console.warn("❌ [DMS_TO_DECIMAL] Format non reconnu:", dmsString);
    console.warn("   Chaîne nettoyée:", cleaned);
    console.warn("   Longueur:", cleaned.length);
    console.warn("   Caractères:", Array.from(cleaned).map(c => `${c} (${c.charCodeAt(0)})`).join(", "));
    return null;
  }

  const degrees = parseFloat(match[1]);
  const minutes = parseFloat(match[2]);
  const seconds = parseFloat(match[3]);
  console.log(`📊 [DMS_TO_DECIMAL] Valeurs extraites: ${degrees}° ${minutes}' ${seconds}"`);

  const result = sign * (degrees + minutes / 60 + seconds / 3600);
  console.log(`✅ [DMS_TO_DECIMAL] "${dmsString}" → ${result}`);
  console.log(`   Calcul: ${sign} * (${degrees} + ${minutes}/60 + ${seconds}/3600) = ${result}`);
  return result;
};

/**
 * Convertit les coordonnées décimales vers DMS
 * @param {number} decimal - Coordonnée décimale
 * @param {string} type - "lat" pour latitude, "lon" pour longitude
 * @returns {string} - Coordonnée au format DMS (ex: "N 13°34'02.2")
 */
export const decimalToDMS = (decimal, type = "lat") => {
  if (decimal === null || decimal === undefined || isNaN(decimal)) return null;

  const absDecimal = Math.abs(decimal);
  const degrees = Math.floor(absDecimal);
  const minutesFloat = (absDecimal - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = (minutesFloat - minutes) * 60;

  // Déterminer la direction
  let direction = "";
  if (type === "lat") {
    direction = decimal >= 0 ? "N" : "S";
  } else {
    direction = decimal >= 0 ? "E" : "W";
  }

  const secondsFormatted = seconds.toFixed(1);
  return `${direction} ${degrees}°${minutes.toString().padStart(2, "0")}'${secondsFormatted.padStart(4, "0")}`;
};

/**
 * Parse une chaîne de coordonnées DMS complète
 * Format: "N 13°34'02.2 / E 2°04'59.3" ou "13°34'02.2 N / 2°04'59.3 E"
 * @param {string} dmsString - Chaîne complète avec latitude et longitude
 * @returns {Object|null} - { latitude: number, longitude: number } ou null
 */
export const parseDMSString = (dmsString) => {
  console.log("🔍 [PARSE_DMS_STRING] Début parsing:", dmsString);
  
  if (!dmsString || typeof dmsString !== "string") {
    console.warn("❌ [PARSE_DMS_STRING] Chaîne vide ou invalide");
    return null;
  }

  // Séparer latitude et longitude
  const parts = dmsString.split("/").map((p) => p.trim());
  console.log("✂️ [PARSE_DMS_STRING] Parties séparées:", parts);
  console.log("✂️ [PARSE_DMS_STRING] Nombre de parties:", parts.length);
  
  if (parts.length !== 2) {
    console.warn("❌ [PARSE_DMS_STRING] Format invalide: doit contenir '/' pour séparer lat/lon");
    return null;
  }

  const latDMS = parts[0].trim();
  const lonDMS = parts[1].trim();
  console.log("📍 [PARSE_DMS_STRING] Latitude DMS:", latDMS);
  console.log("📍 [PARSE_DMS_STRING] Longitude DMS:", lonDMS);

  console.log("🔄 [PARSE_DMS_STRING] Conversion latitude...");
  const latitude = dmsToDecimal(latDMS);
  console.log("🔄 [PARSE_DMS_STRING] Conversion longitude...");
  const longitude = dmsToDecimal(lonDMS);

  console.log("📊 [PARSE_DMS_STRING] Résultats conversion:");
  console.log("   Latitude:", latitude);
  console.log("   Longitude:", longitude);

  if (latitude === null || longitude === null) {
    console.warn("❌ [PARSE_DMS_STRING] Conversion échouée");
    return null;
  }

  const result = { latitude, longitude };
  console.log("✅ [PARSE_DMS_STRING] Résultat final:", result);
  return result;
};

/**
 * Valide si une chaîne est au format DMS
 * @param {string} str - Chaîne à valider
 * @returns {boolean}
 */
export const isDMSFormat = (str) => {
  if (!str || typeof str !== "string") return false;
  
  // Vérifier la présence de symboles DMS (°, ', ", apostrophe typographique)
  const hasDMSSymbols = /[°'"'′]/.test(str);
  
  // Vérifier le format avec regex (supporte apostrophe typographique)
  const dmsPattern = /\d+[°\s]+\d+['"'′\s]+\d+\.?\d*/;
  
  return hasDMSSymbols && dmsPattern.test(str);
};

