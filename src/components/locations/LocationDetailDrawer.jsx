import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, IconButton, Drawer, Button } from "@mui/material";
import {
  LocationOn,
  Close,
  Home,
  Apartment,
  PhotoCamera,
  Map as MapIcon,
  Description,
  Check,
  Bed,
  Bathtub,
  Weekend,
  Kitchen,
  Phone,
  Email,
  Event,
  Tune,
  Info,
  GpsFixed,
  CalendarMonth,
  Schedule,
  Receipt,
  Chair,
  Tag,
  Balcony,
  Garage,
  LocalParking,
  Nature,
  AcUnit,
  Whatshot,
  Wifi,
  Elevator,
  Payments,
  SquareFoot,
  ChevronLeft,
  ChevronRight,
  Business,
  Directions,
  OpenInNew,
  Savings,
  Stairs,
  Route,
  Dashboard,
  Checklist,
  Gavel,
} from "@mui/icons-material";
import { decimalToDMS } from "../../utils/coordinateUtils";
import { BASE_SERVER_URL } from "../../config/config";

// Charte Dillanci
const NIGHT = "#101C36";
const GREEN = "#008557";
const GREEN_DEEP = "#005C48";
const GREEN_LIGHT = "#E5F3EC";
const GREY = "#F1F4F7";
const MUTED = "#64748B";
const BORDER = "#E2E8F0";
const FONT = "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif";

const fixImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  const correctedPath = imageUrl.replace(/\\/g, "/");
  if (correctedPath.startsWith("http")) return correctedPath;
  return `${BASE_SERVER_URL}/${correctedPath}`;
};

// Les photos peuvent être des chaînes ou des objets { url }
const photoSrc = (image) => fixImageUrl(typeof image === "string" ? image : image?.url);

// Nombre formaté, espaces insécables (le libellé FCFA est affiché à part)
const formatNumber = (amount) => new Intl.NumberFormat("fr-FR").format(amount).replace(/[  ]/g, " ");

// Statut de la location (seul endroit où des couleurs hors charte sont admises)
const STATUTS = {
  disponible: { label: "Disponible", bg: GREEN_LIGHT, color: GREEN_DEEP },
  loue: { label: "Loué", bg: "#FDECEA", color: "#d32f2f" },
  indisponible: { label: "Indisponible", bg: "#FFF3E0", color: "#B45309" },
  en_attente: { label: "En attente", bg: "#FFF3E0", color: "#B45309" },
};

// Équipements réellement enregistrés sur la location
const EQUIPEMENTS = [
  { key: "meuble", label: "Meublé", icon: Chair },
  { key: "climatisation", label: "Climatisation", icon: AcUnit },
  { key: "chauffage", label: "Chauffage", icon: Whatshot },
  { key: "internet", label: "Internet", icon: Wifi },
  { key: "parking", label: "Parking", icon: LocalParking },
  { key: "garage", label: "Garage", icon: Garage },
  { key: "balcon", label: "Balcon", icon: Balcony },
  { key: "jardin", label: "Jardin", icon: Nature },
  { key: "ascenseur", label: "Ascenseur", icon: Elevator },
];

const MAX_THUMBS = 5;

const Panel = ({ children, sx }) => (
  <Box sx={{ bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "12px", p: 2, minWidth: 0, ...sx }}>{children}</Box>
);

const SectionTitle = ({ icon: Icon, children }) => (
  <Typography component="h3" sx={{ display: "flex", alignItems: "center", gap: 1, fontFamily: FONT, fontSize: 17, fontWeight: 700, color: NIGHT, mb: 1.5 }}>
    <Icon sx={{ fontSize: 22, color: GREEN }} />
    {children}
  </Typography>
);

// Ligne d'information : icône + libellé à gauche, valeur à droite, séparateur discret
const InfoRow = ({ icon: Icon, label, children }) => (
  <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: 1.5, rowGap: 0.25, py: 1.25, borderBottom: `1px solid ${BORDER}`, "&:last-of-type": { borderBottom: "none" } }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flex: "1 1 130px", minWidth: 0 }}>
      <Icon sx={{ fontSize: 20, color: GREEN, flexShrink: 0 }} />
      <Typography sx={{ fontFamily: FONT, fontSize: 14, color: MUTED }}>{label}</Typography>
    </Box>
    <Typography component="div" sx={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 700, color: NIGHT, textAlign: "right", overflowWrap: "anywhere", flex: "0 1 auto", ml: "auto" }}>
      {children}
    </Typography>
  </Box>
);

const Pill = ({ children, bg = GREEN_LIGHT, color = GREEN_DEEP }) => (
  <Box component="span" sx={{ display: "inline-block", bgcolor: bg, color, fontSize: 13, fontWeight: 700, px: 1.25, py: 0.3, borderRadius: "8px" }}>
    {children}
  </Box>
);

const openWhatsApp = () => {
  window.open("https://wa.me/22780648383", "_blank");
};

const TABS = [
  { key: "overview", label: "Vue d'ensemble", icon: Dashboard },
  { key: "carac", label: "Caractéristiques", icon: Tune },
  { key: "equip", label: "Équipements", icon: Checklist },
  { key: "loc", label: "Localisation", icon: LocationOn },
  { key: "cond", label: "Conditions", icon: Gavel },
];

const LocationDetailDrawer = ({ open, onClose, selectedLocation }) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const scrollRef = useRef(null);
  const tabsRef = useRef(null);
  const sectionRefs = useRef({});
  const lockRef = useRef(0);

  useEffect(() => {
    setPhotoIndex(0);
    setShowAllPhotos(false);
    setActiveTab("overview");
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [selectedLocation]);

  const loc = selectedLocation;
  const lat = loc?.coordonnees?.latitude;
  const lng = loc?.coordonnees?.longitude;
  const hasGps = Boolean(lat && lng);
  const equipements = loc ? EQUIPEMENTS.filter((e) => loc[e.key]) : [];
  const atouts = Array.isArray(loc?.atoutsMajeurs) ? loc.atoutsMajeurs : [];
  const loyer = loc ? loc.prixMensuel || loc.prix || 0 : 0;
  const charges = loc?.charges || 0;
  const statutKey = loc ? loc.statut || "disponible" : null;
  const statut = statutKey ? STATUTS[statutKey] || { label: String(statutKey).replace(/_/g, " "), bg: GREY, color: NIGHT } : null;
  const quartierVille = loc ? [loc.quartier, loc.ville].filter(Boolean).join(", ") : "";
  const photos = loc?.images || [];
  const nbPhotos = photos.length;
  const idx = Math.min(photoIndex, Math.max(nbPhotos - 1, 0));
  const currentPhoto = nbPhotos > 0 ? photoSrc(photos[idx]) : null;
  const overflow = nbPhotos > MAX_THUMBS;
  const visibleThumbs = overflow && !showAllPhotos ? photos.slice(0, MAX_THUMBS - 1) : photos;
  const hiddenCount = nbPhotos - (MAX_THUMBS - 1);
  const agence = loc?.agenceId && loc.agenceId.nom ? loc.agenceId : null;

  const tuiles = loc
    ? [
        loc.superficie && { value: `${loc.superficie} m²`, label: "Superficie", icon: SquareFoot },
        { value: loc.chambres, label: loc.chambres > 1 ? "Chambres" : "Chambre", icon: Bed, show: loc.chambres !== undefined && loc.chambres !== null },
        { value: loc.salleDeBain, label: loc.salleDeBain > 1 ? "Salles de bain" : "Salle de bain", icon: Bathtub, show: loc.salleDeBain !== undefined && loc.salleDeBain !== null },
        loc.salon && { value: "Oui", label: "Salon", icon: Weekend },
        loc.cuisine && { value: "Oui", label: "Cuisine", icon: Kitchen },
      ].filter((t) => t && (t.show === undefined ? t.value : t.show))
    : [];

  const complementaires = loc
    ? [
        { label: "Étage", value: loc.etage, icon: Stairs },
        { label: "Année de construction", value: loc.anneeConstruction, icon: CalendarMonth },
        { label: "État général", value: loc.etatGeneral, icon: Check },
        { label: "Accès", value: loc.acces, icon: Route },
      ].filter((r) => r.value)
    : [];

  const dispoDate = loc?.dateDisponibilite ? new Date(loc.dateDisponibilite).toLocaleDateString("fr-FR") : null;

  const tabs = TABS.filter((t) => t.key !== "equip" || equipements.length > 0);

  const goPhoto = (delta) => {
    if (nbPhotos < 2) return;
    setPhotoIndex((i) => (i + delta + nbPhotos) % nbPhotos);
  };

  const sectionOffset = (el) => {
    const c = scrollRef.current;
    return el.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop;
  };

  const goTo = (key) => {
    const el = sectionRefs.current[key];
    const c = scrollRef.current;
    if (!el || !c) return;
    const tabsH = tabsRef.current ? tabsRef.current.offsetHeight : 0;
    lockRef.current = Date.now() + 700;
    setActiveTab(key);
    c.scrollTo({ top: Math.max(sectionOffset(el) - tabsH - 12, 0), behavior: "smooth" });
  };

  // Onglet actif suivant le défilement réel
  const onScroll = useCallback(() => {
    const c = scrollRef.current;
    if (!c || Date.now() < lockRef.current) return;
    const tabsH = tabsRef.current ? tabsRef.current.offsetHeight : 0;
    const limit = c.scrollTop + tabsH + 40;
    let current = "overview";
    let best = -1;
    TABS.forEach((t) => {
      const el = sectionRefs.current[t.key];
      if (!el) return;
      const top = sectionOffset(el);
      if (top <= limit && top >= best) {
        best = top;
        current = t.key;
      }
    });
    if (c.scrollTop + c.clientHeight >= c.scrollHeight - 4 && sectionRefs.current.cond) current = "cond";
    setActiveTab(current);
  }, []);

  const twoCols = (cols) => ({
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "16px",
    alignItems: "start",
    "@container (min-width: 760px)": { gridTemplateColumns: cols },
  });

  const setRef = (key) => (el) => {
    sectionRefs.current[key] = el;
  };

  // Itinéraire / cartes : mêmes liens externes qu'avant
  const googleMaps = () => {
    if (hasGps) window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    else window.open(`https://maps.google.com/maps/search/${encodeURIComponent(loc.adresse || loc.ville)}`, "_blank");
  };
  const osm = () => {
    if (hasGps) window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`, "_blank");
    else window.open(`https://www.openstreetmap.org/search?query=${encodeURIComponent(loc.adresse || loc.ville)}`, "_blank");
  };
  const naviguer = () => {
    if (hasGps) window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    else alert("Coordonnées GPS non disponibles");
  };

  const btnMap = { flex: "1 1 140px", height: 44, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 700, fontSize: 14.5 };
  // Ordre d'empilement sur petite largeur (les colonnes sont aplaties)
  const col = { display: "contents", "@container (min-width: 760px)": { display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 } };
  const ord = (n) => ({ order: n, minWidth: 0, "@container (min-width: 760px)": { order: 0 } });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100%", sm: "min(92vw, 1100px)" },
          maxWidth: "1100px",
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          bgcolor: GREY,
          fontFamily: FONT,
        },
      }}
    >
      {/* 1. En-tête fixe */}
      <Box sx={{ bgcolor: NIGHT, color: "#fff", flexShrink: 0, p: { xs: "14px 16px", sm: "18px 20px" } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <Box sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 }, borderRadius: "12px", bgcolor: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Home sx={{ fontSize: { xs: 24, sm: 28 } }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography component="h2" sx={{ fontFamily: FONT, fontSize: { xs: 20, sm: 24 }, fontWeight: 700, lineHeight: 1.25, overflowWrap: "anywhere", color: "#fff" }}>
              {loc ? loc.titre : "Détails de la location"}
            </Typography>
            {loc && (
              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 1.5, rowGap: 0.75, mt: 1, fontFamily: FONT, fontSize: 13.5, color: "rgba(255,255,255,0.88)" }}>
                {loc.type && (
                  <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                    <Apartment sx={{ fontSize: 17 }} />
                    {loc.type}
                  </Box>
                )}
                {quartierVille && (
                  <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                    <LocationOn sx={{ fontSize: 17 }} />
                    {quartierVille}
                  </Box>
                )}
                {statut && (
                  <Box component="span" sx={{ bgcolor: statut.bg, color: statut.color, fontSize: 12, fontWeight: 700, px: 1.25, py: 0.35, borderRadius: "8px", textTransform: "capitalize" }}>
                    {statut.label}
                  </Box>
                )}
              </Box>
            )}
          </Box>
          <IconButton onClick={onClose} aria-label="Fermer" sx={{ width: 40, height: 40, flexShrink: 0, bgcolor: "rgba(255,255,255,0.14)", color: "#fff", "&:hover": { bgcolor: "rgba(255,255,255,0.26)" } }}>
            <Close />
          </IconButton>
        </Box>
      </Box>

      {/* 2. Contenu : défilement interne */}
      <Box ref={scrollRef} onScroll={onScroll} sx={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", position: "relative" }}>
        {loc ? (
          <>
            {/* Navigation entre sections (collante) */}
            <Box ref={tabsRef} sx={{ position: "sticky", top: 0, zIndex: 2, bgcolor: GREY, p: { xs: "10px 16px 6px", sm: "12px 20px 8px" } }}>
              <Box role="tablist" aria-label="Sections de la location" sx={{ display: "flex", gap: "6px", p: "4px", bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "10px", overflowX: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
                {tabs.map((t) => {
                  const on = activeTab === t.key;
                  return (
                    <Box
                      key={t.key}
                      component="button"
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => goTo(t.key)}
                      sx={{ flex: "0 0 auto", display: "inline-flex", alignItems: "center", gap: 0.75, height: 38, px: 1.5, border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: FONT, fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", bgcolor: on ? GREEN : "transparent", color: on ? "#fff" : NIGHT, "&:hover": { bgcolor: on ? GREEN : GREY }, "&:focus-visible": { outline: `2px solid ${GREEN}`, outlineOffset: 1 } }}
                    >
                      <t.icon sx={{ fontSize: 19 }} />
                      {t.label}
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ containerType: "inline-size", p: { xs: "10px 16px 24px", sm: "12px 20px 28px" } }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Galerie + présentation synthétique */}
                <Box sx={twoCols("minmax(0, 60fr) minmax(0, 40fr)")}>
                  <Panel sx={{ p: 1.5 }}>
                    <Box sx={{ position: "relative", height: { xs: 240, sm: 320 }, borderRadius: "12px", overflow: "hidden", bgcolor: GREEN_DEEP }}>
                      <Box sx={{ position: "absolute", inset: 0, backgroundImage: "url(/images/bien-placeholder.webp)", backgroundSize: "cover", backgroundPosition: "center" }} />
                      {currentPhoto ? (
                        <Box component="img" src={currentPhoto} alt={loc.titre} sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      ) : (
                        <Box sx={{ position: "absolute", left: 12, bottom: 12, px: 1, py: 0.25, borderRadius: "6px", bgcolor: "rgba(16,28,54,0.6)", color: "#fff", fontSize: 11.5, fontFamily: FONT }}>
                          Image illustrative
                        </Box>
                      )}
                      {nbPhotos > 1 && (
                        <>
                          <IconButton onClick={() => goPhoto(-1)} aria-label="Photo précédente" sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 38, height: 38, bgcolor: "#fff", color: NIGHT, "&:hover": { bgcolor: GREEN_LIGHT } }}>
                            <ChevronLeft />
                          </IconButton>
                          <IconButton onClick={() => goPhoto(1)} aria-label="Photo suivante" sx={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 38, height: 38, bgcolor: "#fff", color: NIGHT, "&:hover": { bgcolor: GREEN_LIGHT } }}>
                            <ChevronRight />
                          </IconButton>
                        </>
                      )}
                      {nbPhotos > 0 && (
                        <Box sx={{ position: "absolute", right: 10, bottom: 10, display: "flex", alignItems: "center", gap: 0.5, bgcolor: NIGHT, color: "#fff", px: 1.25, py: 0.4, borderRadius: "999px", fontFamily: FONT, fontSize: 12.5, fontWeight: 600 }}>
                          <PhotoCamera sx={{ fontSize: 16 }} />
                          {idx + 1} / {nbPhotos}
                        </Box>
                      )}
                    </Box>

                    {nbPhotos > 1 && (
                      <Box sx={{ display: "flex", gap: "8px", mt: 1, overflowX: "auto", pb: 0.5, scrollbarWidth: "thin" }}>
                        {visibleThumbs.map((image, index) => {
                          const selected = index === idx;
                          return (
                            <Box
                              key={index}
                              component="button"
                              type="button"
                              onClick={() => setPhotoIndex(index)}
                              aria-label={`Afficher la photo ${index + 1}`}
                              aria-current={selected ? "true" : undefined}
                              sx={{ flex: "0 0 auto", width: 84, height: 60, p: 0, borderRadius: "8px", overflow: "hidden", cursor: "pointer", bgcolor: GREY, border: `2px solid ${selected ? GREEN : "transparent"}`, outline: "none", "&:focus-visible": { boxShadow: `0 0 0 2px ${GREEN}` } }}
                            >
                              <Box component="img" src={photoSrc(image)} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            </Box>
                          );
                        })}
                        {overflow && !showAllPhotos && (
                          <Box component="button" type="button" onClick={() => setShowAllPhotos(true)} aria-label={`Afficher ${hiddenCount} photos de plus`} sx={{ flex: "0 0 auto", width: 84, height: 60, p: 0, border: "none", borderRadius: "8px", cursor: "pointer", bgcolor: NIGHT, color: "#fff", fontFamily: FONT, fontWeight: 700, fontSize: 17 }}>
                            +{hiddenCount}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Panel>

                  <Panel sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.75 }}>
                      {loc.type && <Pill>{loc.type}</Pill>}
                      {statut && <Pill bg={statut.bg} color={statut.color}>{statut.label}</Pill>}
                      {loc.meuble ? <Pill bg={GREY} color={NIGHT}>Meublé</Pill> : null}
                    </Box>
                    <Typography component="h3" sx={{ fontFamily: FONT, fontSize: 19, fontWeight: 700, color: NIGHT, lineHeight: 1.3, overflowWrap: "anywhere" }}>
                      {loc.titre}
                    </Typography>
                    {(loc.adresse || quartierVille) && (
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75, color: MUTED, fontFamily: FONT, fontSize: 14 }}>
                        <LocationOn sx={{ fontSize: 18, color: GREEN, mt: "1px", flexShrink: 0 }} />
                        <span style={{ overflowWrap: "anywhere" }}>{[loc.adresse, quartierVille].filter(Boolean).join(" - ")}</span>
                      </Box>
                    )}
                    <Box sx={{ bgcolor: GREEN_LIGHT, borderRadius: "10px", p: "12px 14px" }}>
                      <Typography sx={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: MUTED }}>Loyer mensuel</Typography>
                      <Typography sx={{ fontFamily: FONT, fontSize: "clamp(26px, 8cqw, 34px)", fontWeight: 800, color: GREEN_DEEP, lineHeight: 1.2, overflowWrap: "anywhere" }}>
                        {formatNumber(loyer)}{" "}
                        <Box component="span" sx={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>FCFA / mois</Box>
                      </Typography>
                    </Box>
                    <Box sx={{ display: "grid", gap: 0.5 }}>
                      {dispoDate && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, fontFamily: FONT, fontSize: 14, color: MUTED }}>
                          <CalendarMonth sx={{ fontSize: 18, color: GREEN }} />
                          Disponible le <b style={{ color: NIGHT }}>{dispoDate}</b>
                        </Box>
                      )}
                      {loc.reference && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, fontFamily: FONT, fontSize: 14, color: MUTED }}>
                          <Tag sx={{ fontSize: 18, color: GREEN }} />
                          Réf. : <b style={{ color: NIGHT, overflowWrap: "anywhere" }}>{loc.reference}</b>
                        </Box>
                      )}
                    </Box>
                  </Panel>
                </Box>

                {/* Contenu en deux colonnes (60 / 40) */}
                <Box sx={twoCols("minmax(0, 60fr) minmax(0, 40fr)")}>
                  {/* Colonne gauche */}
                  <Box sx={col}>
                    <Panel sx={ord(1)}>
                      <Box ref={setRef("overview")} sx={{ scrollMarginTop: 80 }}>
                        <SectionTitle icon={Description}>Description</SectionTitle>
                        <Typography sx={{ fontFamily: FONT, fontSize: 15, lineHeight: 1.6, color: "#334155", overflowWrap: "anywhere", whiteSpace: "pre-line" }}>
                          {loc.description || "Aucune description disponible"}
                        </Typography>
                      </Box>
                      {atouts.length > 0 && (
                        <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${BORDER}` }}>
                          <Typography sx={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: MUTED, textTransform: "uppercase", mb: 1 }}>Atouts majeurs</Typography>
                          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px 16px" }}>
                            {atouts.map((atout, index) => (
                              <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
                                <Box sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <Check sx={{ fontSize: 15, color: "#fff" }} />
                                </Box>
                                <Typography sx={{ fontFamily: FONT, fontSize: 14.5, color: NIGHT, overflowWrap: "anywhere" }}>
                                  {typeof atout === "string" ? atout : atout.nom || atout}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Panel>

                    {equipements.length > 0 && (
                      <Panel sx={ord(3)}>
                        <Box ref={setRef("equip")} sx={{ scrollMarginTop: 80 }}>
                          <SectionTitle icon={Checklist}>Équipements et services</SectionTitle>
                          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "10px" }}>
                            {equipements.map((e) => (
                              <Box key={e.key} sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: GREY, border: `1px solid ${BORDER}`, borderRadius: "8px", p: "10px 12px", minWidth: 0 }}>
                                <e.icon sx={{ fontSize: 22, color: GREEN, flexShrink: 0 }} />
                                <Typography sx={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: NIGHT }}>{e.label}</Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Panel>
                    )}

                    <Panel sx={{ ...ord(4), display: "flex", flexDirection: "column" }}>
                      <Box ref={setRef("loc")} sx={{ scrollMarginTop: 80 }}>
                        <SectionTitle icon={LocationOn}>Localisation et géolocalisation</SectionTitle>
                        {loc.ville && <InfoRow icon={Apartment} label="Ville">{loc.ville}</InfoRow>}
                        <InfoRow icon={MapIcon} label="Quartier">{loc.quartier || "Quartier non spécifié"}</InfoRow>
                        <InfoRow icon={Home} label="Adresse">{loc.adresse || "Adresse non spécifiée"}</InfoRow>
                        {loc.codePostal && <InfoRow icon={Tag} label="Code postal">{loc.codePostal}</InfoRow>}
                        {loc.coordonnees && (
                          <InfoRow icon={GpsFixed} label="Coordonnées GPS">
                            <Box component="span" sx={{ display: "block" }}>Lat : {lat || "N/A"} / Lng : {lng || "N/A"}</Box>
                            {hasGps && decimalToDMS(lat, "lat") && decimalToDMS(lng, "lon") && (
                              <Box component="span" sx={{ display: "block", fontSize: 12.5, fontWeight: 500, color: MUTED, mt: 0.25 }}>
                                {decimalToDMS(lat, "lat")} / {decimalToDMS(lng, "lon")}
                              </Box>
                            )}
                          </InfoRow>
                        )}
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                          <Button disableElevation startIcon={<MapIcon />} onClick={googleMaps} sx={{ ...btnMap, bgcolor: GREY, color: GREEN, "&:hover": { bgcolor: GREEN_LIGHT } }}>
                            Google Maps
                          </Button>
                          <Button disableElevation startIcon={<OpenInNew />} onClick={osm} sx={{ ...btnMap, bgcolor: GREY, color: GREEN, "&:hover": { bgcolor: GREEN_LIGHT } }}>
                            OpenStreetMap
                          </Button>
                          {loc.coordonnees && (
                            <Button variant="contained" disableElevation startIcon={<Directions />} onClick={naviguer} sx={{ ...btnMap, bgcolor: GREEN, color: "#fff", "&:hover": { bgcolor: GREEN_DEEP } }}>
                              Naviguer
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Panel>
                  </Box>

                  {/* Colonne droite */}
                  <Box sx={col}>
                    <Panel sx={ord(2)}>
                      <Box ref={setRef("carac")} sx={{ scrollMarginTop: 80 }}>
                        <SectionTitle icon={Tune}>Caractéristiques du logement</SectionTitle>
                        {tuiles.length > 0 && (
                          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
                            {tuiles.map((t) => (
                              <Box key={t.label} sx={{ bgcolor: GREEN_LIGHT, borderRadius: "10px", p: "12px", minWidth: 0 }}>
                                <t.icon sx={{ fontSize: 26, color: GREEN }} />
                                <Typography sx={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: NIGHT, lineHeight: 1.2, mt: 0.5, overflowWrap: "anywhere" }}>{t.value}</Typography>
                                <Typography sx={{ fontFamily: FONT, fontSize: 13, color: MUTED }}>{t.label}</Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                        {complementaires.length > 0 && (
                          <Box sx={{ mt: 1.5 }}>
                            {complementaires.map((r) => (
                              <InfoRow key={r.label} icon={r.icon} label={r.label}>{r.value}</InfoRow>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Panel>

                    <Panel sx={{ ...ord(5), p: 0, overflow: "hidden" }}>
                      <Box ref={setRef("cond")} sx={{ scrollMarginTop: 80 }}>
                        <Box sx={{ bgcolor: GREY, borderBottom: `1px solid ${BORDER}`, p: "12px 16px" }}>
                          <Typography component="h3" sx={{ display: "flex", alignItems: "center", gap: 1, fontFamily: FONT, fontSize: 17, fontWeight: 700, color: NIGHT }}>
                            <Info sx={{ fontSize: 22, color: GREEN }} />
                            Informations pratiques
                          </Typography>
                        </Box>
                        <Box sx={{ p: "4px 16px 8px" }}>
                          {dispoDate && <InfoRow icon={CalendarMonth} label="Date de disponibilité">{dispoDate}</InfoRow>}
                          <InfoRow icon={Schedule} label="Durée minimale">{loc.dureeMinimale ? `${loc.dureeMinimale} mois` : "Non spécifiée"}</InfoRow>
                          {loc.dureeMaximale ? <InfoRow icon={Schedule} label="Durée maximale">{`${loc.dureeMaximale} mois`}</InfoRow> : null}
                          <InfoRow icon={Receipt} label="Charges incluses">
                            <Pill bg={loc.chargesIncluses ? GREEN_LIGHT : "#FFF3E0"} color={loc.chargesIncluses ? GREEN_DEEP : "#B45309"}>{loc.chargesIncluses ? "Oui" : "Non"}</Pill>
                          </InfoRow>
                          <InfoRow icon={Chair} label="Logement">{loc.meuble ? "Meublé" : "Non meublé"}</InfoRow>
                          <InfoRow icon={Tag} label="Référence">{loc.reference || "Non spécifiée"}</InfoRow>
                        </Box>
                      </Box>
                    </Panel>

                    <Panel sx={{ ...ord(6), p: 0, overflow: "hidden" }}>
                      <Box sx={{ bgcolor: GREEN_DEEP, color: "#fff", p: "12px 16px" }}>
                        <Typography component="h3" sx={{ display: "flex", alignItems: "center", gap: 1, fontFamily: FONT, fontSize: 17, fontWeight: 700, color: "#fff" }}>
                          <Payments sx={{ fontSize: 22 }} />
                          Informations financières
                        </Typography>
                      </Box>
                      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.25 }}>
                        <Box sx={{ bgcolor: GREEN_LIGHT, borderRadius: "10px", p: "12px 14px" }}>
                          <Typography sx={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: MUTED }}>Loyer mensuel</Typography>
                          <Typography sx={{ fontFamily: FONT, fontSize: "clamp(24px, 7cqw, 32px)", fontWeight: 800, color: GREEN_DEEP, lineHeight: 1.2, overflowWrap: "anywhere" }}>
                            {formatNumber(loyer)}{" "}
                            <Box component="span" sx={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>FCFA / mois</Box>
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1, flexWrap: "wrap", borderBottom: `1px solid ${BORDER}`, pb: 1.25 }}>
                          <Typography sx={{ fontFamily: FONT, fontSize: 14, color: MUTED, display: "flex", alignItems: "center", gap: 1 }}>
                            <Savings sx={{ fontSize: 20, color: GREEN }} /> Caution
                          </Typography>
                          <Typography sx={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: NIGHT }}>
                            {formatNumber(loc.caution || 0)} <Box component="span" sx={{ fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" }}>FCFA</Box>
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1, flexWrap: "wrap", borderBottom: `1px solid ${BORDER}`, pb: 1.25 }}>
                          <Box>
                            <Typography sx={{ fontFamily: FONT, fontSize: 14, color: MUTED, display: "flex", alignItems: "center", gap: 1 }}>
                              <Receipt sx={{ fontSize: 20, color: GREEN }} /> Charges mensuelles
                            </Typography>
                            <Typography sx={{ fontFamily: FONT, fontSize: 12, color: MUTED, ml: 3.5 }}>
                              Charges {loc.chargesIncluses ? "(incluses)" : "(non incluses)"}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: NIGHT }}>
                            {formatNumber(charges)} <Box component="span" sx={{ fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" }}>FCFA</Box>
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1, flexWrap: "wrap", bgcolor: GREY, borderRadius: "10px", p: "12px 14px" }}>
                          <Typography sx={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 700, color: NIGHT }}>Total mensuel</Typography>
                          <Typography sx={{ fontFamily: FONT, fontSize: 18, fontWeight: 800, color: GREEN_DEEP }}>
                            {formatNumber(loyer + charges)} <Box component="span" sx={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>FCFA</Box>
                          </Typography>
                        </Box>
                      </Box>
                    </Panel>

                    {agence && (
                      <Panel sx={ord(7)}>
                        <SectionTitle icon={Business}>Agence</SectionTitle>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                          <Box sx={{ width: 48, height: 48, borderRadius: "10px", bgcolor: GREEN_LIGHT, color: GREEN_DEEP, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Business sx={{ fontSize: 26 }} />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontFamily: FONT, fontSize: 16, fontWeight: 800, color: NIGHT, overflowWrap: "anywhere" }}>{agence.nom}</Typography>
                            {agence.telephone && (
                              <Box component="a" href={`tel:${String(agence.telephone).replace(/\s+/g, "")}`} sx={{ display: "flex", alignItems: "center", gap: 0.5, color: GREEN, textDecoration: "none", fontFamily: FONT, fontSize: 14.5, fontWeight: 600, "&:hover": { textDecoration: "underline" } }}>
                                <Phone sx={{ fontSize: 17 }} />
                                {agence.telephone}
                              </Box>
                            )}
                            {agence.email && (
                              <Box component="a" href={`mailto:${agence.email}`} sx={{ display: "flex", alignItems: "center", gap: 0.5, color: GREEN, textDecoration: "none", fontFamily: FONT, fontSize: 14, overflowWrap: "anywhere", "&:hover": { textDecoration: "underline" } }}>
                                <Email sx={{ fontSize: 17 }} />
                                {agence.email}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Panel>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <Typography variant="h6" color="text.secondary">
              Aucune location sélectionnée
            </Typography>
          </Box>
        )}
      </Box>

      {/* 3. Barre d'actions fixe */}
      {loc && (
        <Box sx={{ flexShrink: 0, bgcolor: "#fff", borderTop: `1px solid ${BORDER}`, boxShadow: "0 -2px 8px rgba(16,28,54,0.06)", p: { xs: "12px 16px", sm: "14px 20px" }, display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <Button
            variant="outlined"
            disableElevation
            startIcon={<Phone />}
            onClick={openWhatsApp}
            sx={{ flex: "1 1 180px", height: 48, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 700, fontSize: 15, border: `1.5px solid ${GREEN}`, color: GREEN, bgcolor: "#fff", "&:hover": { border: `1.5px solid ${GREEN_DEEP}`, bgcolor: GREEN_LIGHT } }}
          >
            Contacter l'agence
          </Button>
          <Button
            variant="contained"
            disableElevation
            startIcon={<Event />}
            onClick={openWhatsApp}
            sx={{ flex: "1 1 180px", height: 48, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 700, fontSize: 15, bgcolor: GREEN, color: "#fff", "&:hover": { bgcolor: GREEN_DEEP } }}
          >
            Demander une visite
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

export default LocationDetailDrawer;
