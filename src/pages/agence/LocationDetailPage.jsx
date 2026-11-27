import React, { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import {
  ArrowBack,
  Edit,
  LocationOn,
  Apartment,
  Home,
  Map as MapIcon,
  Description,
  Check,
  Bed,
  Bathtub,
  Weekend,
  Kitchen,
  Phone,
  Email,
  Tune,
  Info,
  GpsFixed,
  CalendarMonth,
  Schedule,
  Receipt,
  Chair,
  Tag,
  Payments,
  SquareFoot,
  ChevronLeft,
  ChevronRight,
  Directions,
  OpenInNew,
  Savings,
  Stairs,
  Route,
  Checklist,
  Person,
  Badge as BadgeIcon,
  Key,
  EventAvailable,
  Inbox,
  PhotoCamera,
  ErrorOutline,
  Visibility,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import AgenceLayout from "../../components/agence/AgenceLayout";
import api from "../../services/api";
import { decimalToDMS } from "../../utils/coordinateUtils";
import { EQUIPEMENTS, photoSrc, formatNumber } from "../../components/locations/LocationDetailDrawer";

// Charte Dillanci (référence logo)
const BLUE = "#3030F9";
const NIGHT = "#0e1133";
const GREEN = "#0A7C4F";
const SKY = "#EAF0FF";
const GREEN_LIGHT = "#E3F5EC";
const GREY = "#f5f7fa";
const MUTED = "#64748B";
const BORDER = "#E2E8F0";
const FONT = "'Manrope', 'Plus Jakarta Sans', 'DM Sans', system-ui, Arial, sans-serif";

// Statuts (seul endroit où des couleurs d'alerte hors charte sont admises)
const STATUTS = {
  disponible: { label: "Disponible", bg: GREEN_LIGHT, color: GREEN },
  loue: { label: "Loué", bg: "#FDECEA", color: "#C62828" },
  indisponible: { label: "Indisponible", bg: "#FFF3E0", color: "#B45309" },
  en_attente: { label: "En attente", bg: "#FFF3E0", color: "#B45309" },
};
const STATUTS_VISITE = {
  planifiee: { label: "Planifiée", bg: SKY, color: BLUE },
  effectuee: { label: "Effectuée", bg: GREEN_LIGHT, color: GREEN },
  annulee: { label: "Annulée", bg: "#FDECEA", color: "#C62828" },
};
const STATUTS_DEMANDE = {
  en_attente: { label: "En attente", bg: "#FFF3E0", color: "#B45309" },
  acceptee: { label: "Acceptée", bg: GREEN_LIGHT, color: GREEN },
  refusee: { label: "Refusée", bg: "#FDECEA", color: "#C62828" },
  annulee: { label: "Annulée", bg: GREY, color: MUTED },
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("fr-FR") : null);

const Panel = ({ title, icon: Icon, bg = "#fff", iconColor = BLUE, children, sx }) => (
  <Box sx={{ bgcolor: bg, border: `1px solid ${bg === "#fff" ? BORDER : "transparent"}`, borderRadius: "14px", p: { xs: 2, sm: 2.5 }, minWidth: 0, ...sx }}>
    {title && (
      <Typography component="h2" sx={{ display: "flex", alignItems: "center", gap: 1, fontFamily: FONT, fontSize: 17, fontWeight: 700, color: NIGHT, mb: 1.5 }}>
        {Icon && <Icon sx={{ fontSize: 22, color: iconColor }} />}
        {title}
      </Typography>
    )}
    {children}
  </Box>
);

const InfoRow = ({ icon: Icon, label, iconColor = BLUE, children }) => (
  <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", columnGap: 1.5, rowGap: 0.25, py: 1.1, borderBottom: `1px solid ${BORDER}`, "&:last-of-type": { borderBottom: "none" } }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flex: "1 1 130px", minWidth: 0 }}>
      <Icon sx={{ fontSize: 20, color: iconColor, flexShrink: 0 }} />
      <Typography sx={{ fontFamily: FONT, fontSize: 14, color: MUTED }}>{label}</Typography>
    </Box>
    <Typography component="div" sx={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 700, color: NIGHT, textAlign: "right", overflowWrap: "anywhere", ml: "auto" }}>
      {children}
    </Typography>
  </Box>
);

const Badge = ({ children, bg, color, sx }) => (
  <Box component="span" sx={{ display: "inline-flex", alignItems: "center", bgcolor: bg, color, fontFamily: FONT, fontSize: 13, fontWeight: 700, px: 1.25, py: 0.35, borderRadius: "8px", whiteSpace: "nowrap", ...sx }}>
    {children}
  </Box>
);

const Chip = ({ icon: Icon, value, label }) => (
  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "999px", px: 1.5, py: 0.75, minWidth: 0 }}>
    <Icon sx={{ fontSize: 20, color: BLUE, flexShrink: 0 }} />
    <Typography sx={{ fontFamily: FONT, fontSize: 14, color: NIGHT, overflowWrap: "anywhere" }}>
      <Box component="strong" sx={{ fontWeight: 800 }}>{value}</Box>{" "}
      <Box component="span" sx={{ color: MUTED }}>{label}</Box>
    </Typography>
  </Box>
);

const PersonBlock = ({ icon: Icon, role, name, phone, email }) => (
  <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", py: 1.25, borderBottom: `1px solid ${BORDER}`, "&:last-of-type": { borderBottom: "none" } }}>
    <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: SKY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon sx={{ fontSize: 22, color: BLUE }} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5 }}>{role}</Typography>
      <Typography sx={{ fontFamily: FONT, fontSize: 15.5, fontWeight: 700, color: NIGHT, overflowWrap: "anywhere" }}>{name || "Non renseigné"}</Typography>
      {phone && (
        <Typography component="a" href={`tel:${phone}`} sx={{ display: "flex", alignItems: "center", gap: 0.75, fontFamily: FONT, fontSize: 14, color: BLUE, textDecoration: "none", mt: 0.25, "&:hover": { textDecoration: "underline" } }}>
          <Phone sx={{ fontSize: 17 }} /> {phone}
        </Typography>
      )}
      {email && (
        <Typography component="a" href={`mailto:${email}`} sx={{ display: "flex", alignItems: "center", gap: 0.75, fontFamily: FONT, fontSize: 14, color: BLUE, textDecoration: "none", mt: 0.25, overflowWrap: "anywhere", "&:hover": { textDecoration: "underline" } }}>
          <Email sx={{ fontSize: 17 }} /> {email}
        </Typography>
      )}
    </Box>
  </Box>
);

const LocationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loc, setLoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorKind, setErrorKind] = useState(null); // "notfound" | "other"
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrorKind(null);
    setPhotoIndex(0);
    api
      .get(`/agence/locations/${id}`)
      .then((res) => {
        if (!cancelled) setLoc(res.data);
      })
      .catch((err) => {
        if (cancelled) return;
        const status = err.response?.status;
        setErrorKind(status === 404 || status === 400 ? "notfound" : "other");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const goList = () => navigate("/agence/locations");
  const goEdit = () => navigate(`/agence/locations/edit/${id}`);

  const btnBase = { height: 44, borderRadius: "10px", textTransform: "none", fontFamily: FONT, fontWeight: 700, fontSize: 14.5, px: 2.25 };
  const btnBack = { ...btnBase, bgcolor: "#fff", color: NIGHT, border: `1px solid ${BORDER}`, "&:hover": { bgcolor: GREY } };
  const btnEdit = { ...btnBase, bgcolor: BLUE, color: "#fff", "&:hover": { bgcolor: "#2424D6" } };

  if (loading) {
    return (
      <AgenceLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 360 }}>
          <CircularProgress sx={{ color: BLUE }} aria-label="Chargement de la location" />
        </Box>
      </AgenceLayout>
    );
  }

  if (errorKind || !loc) {
    return (
      <AgenceLayout>
        <Box sx={{ maxWidth: 560, mx: "auto", mt: 4, textAlign: "center", bgcolor: "#fff", border: `1px solid ${BORDER}`, borderRadius: "14px", p: { xs: 3, sm: 5 } }}>
          <ErrorOutline sx={{ fontSize: 52, color: errorKind === "notfound" ? BLUE : "#C62828" }} />
          <Typography component="h1" sx={{ fontFamily: FONT, fontSize: 21, fontWeight: 800, color: NIGHT, mt: 1 }}>
            {errorKind === "notfound" ? "Location introuvable" : "Impossible de charger la location"}
          </Typography>
          <Typography sx={{ fontFamily: FONT, fontSize: 15, color: MUTED, mt: 1, mb: 3 }}>
            {errorKind === "notfound"
              ? "Cette location n'existe pas ou n'appartient pas à votre agence."
              : "Vérifiez votre connexion puis réessayez."}
          </Typography>
          <Button disableElevation startIcon={<ArrowBack />} onClick={goList} sx={btnEdit}>
            Retour à la liste
          </Button>
        </Box>
      </AgenceLayout>
    );
  }

  const lat = loc.coordonnees?.latitude;
  const lng = loc.coordonnees?.longitude;
  const hasGps = Boolean(lat && lng);
  const equipements = EQUIPEMENTS.filter((e) => loc[e.key]);
  const loyer = loc.prixMensuel || 0;
  const charges = loc.charges || 0;
  const statutKey = loc.statut || "disponible";
  const statut = STATUTS[statutKey] || { label: String(statutKey).replace(/_/g, " "), bg: GREY, color: NIGHT };
  const quartierVille = [loc.quartier, loc.ville].filter(Boolean).join(", ");

  // Photos : tri par "ordre" puis URL
  const photos = (Array.isArray(loc.images) ? [...loc.images] : [])
    .sort((a, b) => (a?.ordre || 0) - (b?.ordre || 0))
    .map((img) => photoSrc(img))
    .filter(Boolean);
  const nbPhotos = photos.length;
  const idx = Math.min(photoIndex, Math.max(nbPhotos - 1, 0));
  const goPhoto = (delta) => nbPhotos > 1 && setPhotoIndex((i) => (i + delta + nbPhotos) % nbPhotos);

  const chips = [
    loc.superficie && { icon: SquareFoot, value: `${loc.superficie} m²`, label: "Superficie" },
    loc.chambres != null && { icon: Bed, value: loc.chambres, label: loc.chambres > 1 ? "Chambres" : "Chambre" },
    loc.salleDeBain != null && { icon: Bathtub, value: loc.salleDeBain, label: loc.salleDeBain > 1 ? "Salles de bain" : "Salle de bain" },
    loc.salon && { icon: Weekend, value: "Oui", label: "Salon" },
    loc.cuisine && { icon: Kitchen, value: "Oui", label: "Cuisine" },
    loc.etage && { icon: Stairs, value: loc.etage, label: "Étage" },
    loc.anneeConstruction && { icon: CalendarMonth, value: loc.anneeConstruction, label: "Construction" },
    loc.etatGeneral && { icon: Check, value: loc.etatGeneral, label: "État" },
    loc.acces && { icon: Route, value: loc.acces, label: "Accès" },
  ].filter(Boolean);

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

  const visites = Array.isArray(loc.visites) ? loc.visites : [];
  const demandes = Array.isArray(loc.demandes) ? loc.demandes : [];
  const dispoDate = fmtDate(loc.dateDisponibilite);
  const hasPersons = loc.proprietaire || loc.commercial || loc.locataireActuel;

  const actions = (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      <Button disableElevation startIcon={<ArrowBack />} onClick={goList} sx={btnBack}>
        Retour à la liste
      </Button>
      <Button disableElevation startIcon={<Edit />} onClick={goEdit} sx={btnEdit}>
        Modifier
      </Button>
    </Box>
  );

  return (
    <AgenceLayout>
      <Box sx={{ maxWidth: 1200, mx: "auto", fontFamily: FONT, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* En-tête */}
        <Box sx={{ bgcolor: NIGHT, color: "#fff", borderRadius: "14px", p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
            <Box sx={{ minWidth: 0, flex: "1 1 320px" }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.25 }}>
                {loc.type && <Badge bg={BLUE} color="#fff">{loc.type}</Badge>}
                <Badge bg={statut.bg} color={statut.color}>{statut.label}</Badge>
                {loc.meuble && <Badge bg={SKY} color={BLUE}>Meublé</Badge>}
              </Box>
              <Typography component="h1" sx={{ fontFamily: FONT, fontSize: { xs: 22, sm: 28 }, fontWeight: 800, lineHeight: 1.25, overflowWrap: "anywhere", color: "#fff" }}>
                {loc.titre}
              </Typography>
              {(quartierVille || loc.adresse) && (
                <Typography sx={{ display: "flex", alignItems: "flex-start", gap: 0.75, fontFamily: FONT, fontSize: 14.5, color: "rgba(255,255,255,0.78)", mt: 0.75 }}>
                  <LocationOn sx={{ fontSize: 19, mt: "1px", flexShrink: 0 }} />
                  <span>{[quartierVille, loc.adresse].filter(Boolean).join(" · ")}</span>
                </Typography>
              )}
              <Typography sx={{ fontFamily: FONT, fontSize: 13, color: "rgba(255,255,255,0.6)", mt: 0.75 }}>
                {loc.reference ? `Réf. ${loc.reference}` : ""}
                {loc.reference && loc.nombreVues != null ? " · " : ""}
                {loc.nombreVues != null ? `${loc.nombreVues} vue${loc.nombreVues > 1 ? "s" : ""}` : ""}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: "left", sm: "right" }, flex: "0 1 auto" }}>
              <Typography sx={{ fontFamily: FONT, fontSize: { xs: 26, sm: 32 }, fontWeight: 800, lineHeight: 1.15, color: "#fff" }}>
                {formatNumber(loyer)}{" "}
                <Box component="span" sx={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>FCFA / mois</Box>
              </Typography>
              {loc.superficie ? (
                <Typography sx={{ fontFamily: FONT, fontSize: 14.5, color: "rgba(255,255,255,0.78)", mt: 0.5 }}>{loc.superficie} m²</Typography>
              ) : null}
            </Box>
          </Box>
          <Box sx={{ mt: 2 }}>{actions}</Box>
        </Box>

        {/* Photos + bloc financier */}
        <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 2, alignItems: "start", "@media (min-width:960px)": { gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)" } }}>
          <Panel title="Photos" icon={PhotoCamera} bg={SKY}>
            {nbPhotos > 0 ? (
              <>
                <Box sx={{ position: "relative", bgcolor: NIGHT, borderRadius: "12px", overflow: "hidden", height: { xs: 240, sm: 380 } }}>
                  <Box component="img" src={photos[idx]} alt={`${loc.titre} - photo ${idx + 1}`} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  {nbPhotos > 1 && (
                    <>
                      <Box component="button" type="button" aria-label="Photo précédente" onClick={() => goPhoto(-1)} sx={arrowSx("left")}>
                        <ChevronLeft />
                      </Box>
                      <Box component="button" type="button" aria-label="Photo suivante" onClick={() => goPhoto(1)} sx={arrowSx("right")}>
                        <ChevronRight />
                      </Box>
                      <Box sx={{ position: "absolute", bottom: 10, right: 10, bgcolor: NIGHT, color: "#fff", fontFamily: FONT, fontSize: 13, fontWeight: 700, px: 1.25, py: 0.35, borderRadius: "8px" }}>
                        {idx + 1} / {nbPhotos}
                      </Box>
                    </>
                  )}
                </Box>
                {nbPhotos > 1 && (
                  <Box sx={{ display: "flex", gap: 1, mt: 1.25, overflowX: "auto", pb: 0.5 }}>
                    {photos.map((src, i) => (
                      <Box
                        key={`${src}-${i}`}
                        component="button"
                        type="button"
                        aria-label={`Voir la photo ${i + 1}`}
                        onClick={() => setPhotoIndex(i)}
                        sx={{ flex: "0 0 auto", width: 84, height: 64, p: 0, borderRadius: "8px", overflow: "hidden", cursor: "pointer", bgcolor: "#fff", border: `2px solid ${i === idx ? BLUE : "transparent"}`, opacity: i === idx ? 1 : 0.8 }}
                      >
                        <Box component="img" src={src} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      </Box>
                    ))}
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ height: 200, borderRadius: "12px", bgcolor: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: MUTED, gap: 0.5 }}>
                <PhotoCamera sx={{ fontSize: 40 }} />
                <Typography sx={{ fontFamily: FONT, fontSize: 14.5 }}>Aucune photo pour cette location</Typography>
              </Box>
            )}
          </Panel>

          <Panel title="Informations financières" icon={Payments} bg={GREEN_LIGHT} iconColor={GREEN}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              <Box sx={{ bgcolor: "#fff", borderRadius: "10px", p: "12px 14px" }}>
                <Typography sx={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: MUTED }}>Loyer mensuel</Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: 28, fontWeight: 800, color: GREEN, lineHeight: 1.2, overflowWrap: "anywhere" }}>
                  {formatNumber(loyer)} <Box component="span" sx={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>FCFA / mois</Box>
                </Typography>
              </Box>
              <MoneyRow icon={Savings} label="Caution" value={loc.caution || 0} />
              <MoneyRow icon={Receipt} label="Charges mensuelles" sub={`Charges ${loc.chargesIncluses ? "(incluses)" : "(non incluses)"}`} value={charges} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1, flexWrap: "wrap", bgcolor: NIGHT, borderRadius: "10px", p: "12px 14px" }}>
                <Typography sx={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 700, color: "#fff" }}>Total mensuel</Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: 19, fontWeight: 800, color: "#fff" }}>
                  {formatNumber(loyer + charges)} <Box component="span" sx={{ fontSize: 13, fontWeight: 700 }}>FCFA</Box>
                </Typography>
              </Box>
            </Box>
          </Panel>
        </Box>

        {/* Caractéristiques */}
        {chips.length > 0 && (
          <Panel title="Caractéristiques" icon={Tune} bg={SKY}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {chips.map((c) => (
                <Chip key={c.label} icon={c.icon} value={c.value} label={c.label} />
              ))}
            </Box>
          </Panel>
        )}

        {/* Équipements */}
        {equipements.length > 0 && (
          <Panel title="Équipements et services" icon={Checklist} bg={GREEN_LIGHT} iconColor={GREEN}>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 1 }}>
              {equipements.map((e) => (
                <Box key={e.key} sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#fff", borderRadius: "10px", p: "10px 12px", minWidth: 0 }}>
                  <e.icon sx={{ fontSize: 22, color: GREEN, flexShrink: 0 }} />
                  <Typography sx={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 600, color: NIGHT, overflowWrap: "anywhere" }}>{e.label}</Typography>
                </Box>
              ))}
            </Box>
          </Panel>
        )}

        {/* Description + localisation */}
        <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 2, alignItems: "start", "@media (min-width:960px)": { gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" } }}>
          <Panel title="Description" icon={Description}>
            <Typography sx={{ fontFamily: FONT, fontSize: 15, lineHeight: 1.65, color: NIGHT, whiteSpace: "pre-line", overflowWrap: "anywhere" }}>
              {loc.description || "Aucune description renseignée."}
            </Typography>
          </Panel>

          <Panel title="Localisation et géolocalisation" icon={LocationOn} bg={SKY}>
            {loc.ville && <InfoRow icon={Apartment} label="Ville">{loc.ville}</InfoRow>}
            <InfoRow icon={MapIcon} label="Quartier">{loc.quartier || "Non spécifié"}</InfoRow>
            <InfoRow icon={Home} label="Adresse">{loc.adresse || "Non spécifiée"}</InfoRow>
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
              <Button disableElevation startIcon={<MapIcon />} onClick={googleMaps} sx={{ ...btnMap, bgcolor: "#fff", color: BLUE, "&:hover": { bgcolor: GREY } }}>
                Google Maps
              </Button>
              <Button disableElevation startIcon={<OpenInNew />} onClick={osm} sx={{ ...btnMap, bgcolor: "#fff", color: BLUE, "&:hover": { bgcolor: GREY } }}>
                OpenStreetMap
              </Button>
              {loc.coordonnees && (
                <Button disableElevation startIcon={<Directions />} onClick={naviguer} sx={{ ...btnMap, bgcolor: BLUE, color: "#fff", "&:hover": { bgcolor: "#2424D6" } }}>
                  Naviguer
                </Button>
              )}
            </Box>
          </Panel>
        </Box>

        {/* Infos pratiques + propriétaire / commercial */}
        <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 2, alignItems: "start", "@media (min-width:960px)": { gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" } }}>
          <Panel title="Informations pratiques" icon={Info}>
            {dispoDate && <InfoRow icon={CalendarMonth} label="Date de disponibilité">{dispoDate}</InfoRow>}
            <InfoRow icon={Schedule} label="Durée minimale">{loc.dureeMinimale ? `${loc.dureeMinimale} mois` : "Non spécifiée"}</InfoRow>
            {loc.dureeMaximale ? <InfoRow icon={Schedule} label="Durée maximale">{`${loc.dureeMaximale} mois`}</InfoRow> : null}
            <InfoRow icon={Receipt} label="Charges incluses">
              <Badge bg={loc.chargesIncluses ? GREEN_LIGHT : "#FFF3E0"} color={loc.chargesIncluses ? GREEN : "#B45309"}>{loc.chargesIncluses ? "Oui" : "Non"}</Badge>
            </InfoRow>
            <InfoRow icon={Chair} label="Logement">{loc.meuble ? "Meublé" : "Non meublé"}</InfoRow>
            <InfoRow icon={Tag} label="Référence">{loc.reference || "Non spécifiée"}</InfoRow>
            {(loc.dateDebutLocation || loc.dateFinLocation) && (
              <InfoRow icon={EventAvailable} label="Période de location">
                {[fmtDate(loc.dateDebutLocation), fmtDate(loc.dateFinLocation)].filter(Boolean).join(" au ")}
              </InfoRow>
            )}
          </Panel>

          <Panel title="Propriétaire et commercial" icon={Person}>
            {hasPersons ? (
              <>
                {loc.proprietaire && <PersonBlock icon={Person} role="Propriétaire" name={loc.proprietaire.fullName} phone={loc.proprietaire.phone} email={loc.proprietaire.email} />}
                {loc.commercial && (
                  <PersonBlock icon={BadgeIcon} role="Commercial" name={[loc.commercial.prenom, loc.commercial.nom].filter(Boolean).join(" ")} phone={loc.commercial.telephone} />
                )}
                {loc.locataireActuel && <PersonBlock icon={Key} role="Locataire actuel" name={loc.locataireActuel.fullName} phone={loc.locataireActuel.phone} />}
              </>
            ) : (
              <Typography sx={{ fontFamily: FONT, fontSize: 14.5, color: MUTED }}>Aucun contact associé à cette location.</Typography>
            )}
          </Panel>
        </Box>

        {/* Gestion : visites et demandes reçues */}
        {(visites.length > 0 || demandes.length > 0) && (
          <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 2, alignItems: "start", "@media (min-width:960px)": { gridTemplateColumns: visites.length > 0 && demandes.length > 0 ? "minmax(0, 1fr) minmax(0, 1fr)" : "minmax(0, 1fr)" } }}>
            {visites.length > 0 && (
              <Panel title={`Visites reçues (${visites.length})`} icon={Visibility}>
                {visites.map((v, i) => {
                  const st = STATUTS_VISITE[v.statut] || { label: v.statut, bg: GREY, color: NIGHT };
                  return (
                    <ActivityRow key={v._id || i} name={v.visiteur?.fullName} phone={v.visiteur?.phone} date={fmtDate(v.dateVisite)} note={v.commentaire} badge={st} />
                  );
                })}
              </Panel>
            )}
            {demandes.length > 0 && (
              <Panel title={`Demandes reçues (${demandes.length})`} icon={Inbox}>
                {demandes.map((d, i) => {
                  const st = STATUTS_DEMANDE[d.statut] || { label: d.statut, bg: GREY, color: NIGHT };
                  const extra = [d.dureeSouhaitee ? `${d.dureeSouhaitee} mois souhaités` : null, d.dateDebutSouhaitee ? `à partir du ${fmtDate(d.dateDebutSouhaitee)}` : null].filter(Boolean).join(" · ");
                  return (
                    <ActivityRow key={d._id || i} name={d.demandeur?.fullName} phone={d.demandeur?.phone} email={d.demandeur?.email} date={fmtDate(d.dateDemande)} note={d.message} extra={extra} badge={st} />
                  );
                })}
              </Panel>
            )}
          </Box>
        )}

        <Box sx={{ pb: 1 }}>{actions}</Box>
      </Box>
    </AgenceLayout>
  );
};

const arrowSx = (side) => ({
  position: "absolute",
  top: "50%",
  [side]: 10,
  transform: "translateY(-50%)",
  width: 40,
  height: 40,
  border: "none",
  borderRadius: "50%",
  cursor: "pointer",
  bgcolor: NIGHT,
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": { bgcolor: BLUE },
});

const MoneyRow = ({ icon: Icon, label, sub, value }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1, flexWrap: "wrap", borderBottom: `1px solid rgba(10,124,79,0.18)`, pb: 1.25 }}>
    <Box>
      <Typography sx={{ fontFamily: FONT, fontSize: 14, color: MUTED, display: "flex", alignItems: "center", gap: 1 }}>
        <Icon sx={{ fontSize: 20, color: GREEN }} /> {label}
      </Typography>
      {sub && <Typography sx={{ fontFamily: FONT, fontSize: 12, color: MUTED, ml: 3.5 }}>{sub}</Typography>}
    </Box>
    <Typography sx={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: NIGHT }}>
      {formatNumber(value)} <Box component="span" sx={{ fontSize: 12.5, fontWeight: 700 }}>FCFA</Box>
    </Typography>
  </Box>
);

const ActivityRow = ({ name, phone, email, date, note, extra, badge }) => (
  <Box sx={{ py: 1.25, borderBottom: `1px solid ${BORDER}`, "&:last-of-type": { borderBottom: "none" } }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, flexWrap: "wrap" }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: NIGHT, overflowWrap: "anywhere" }}>{name || "Utilisateur"}</Typography>
        <Typography sx={{ fontFamily: FONT, fontSize: 13, color: MUTED, overflowWrap: "anywhere" }}>
          {[date, phone, email].filter(Boolean).join(" · ")}
        </Typography>
      </Box>
      <Badge bg={badge.bg} color={badge.color}>{badge.label}</Badge>
    </Box>
    {extra ? <Typography sx={{ fontFamily: FONT, fontSize: 13.5, color: NIGHT, mt: 0.5 }}>{extra}</Typography> : null}
    {note ? (
      <Typography sx={{ fontFamily: FONT, fontSize: 14, color: NIGHT, mt: 0.75, bgcolor: GREY, borderRadius: "8px", p: "8px 10px", overflowWrap: "anywhere", whiteSpace: "pre-line" }}>{note}</Typography>
    ) : null}
  </Box>
);

export default LocationDetailPage;
