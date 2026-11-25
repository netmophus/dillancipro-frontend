


// import React, { useEffect, useState } from "react";
// import {
//   Container,
//   Typography,
//   CircularProgress,
//   Alert,
//   Button,
//   Box,
// } from "@mui/material";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../../services/api";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css"; // important

// // Corriger l'affichage des icônes par défaut de Leaflet
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
//   iconUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//   shadowUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
// });

// const CommercialMapPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [parcelles, setParcelles] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchParcelles = async () => {
//       setLoading(true);
//       try {
//         const res = await api.get(`/agence/commerciaux/${id}/parcelles`);
//         setParcelles(res.data);
//       } catch (err) {
//         setError("Erreur lors du chargement des parcelles");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchParcelles();
//   }, [id]);

//   const parcellesAvecCoord = parcelles.filter(
//     (p) => p.localisation?.lat && p.localisation?.lng
//   );

//   const center = parcellesAvecCoord.length
//     ? [parcellesAvecCoord[0].localisation.lat, parcellesAvecCoord[0].localisation.lng]
//     : [13.5128, 2.1127]; // par défaut : Niamey

//   return (
//     <Container sx={{ mt: 4 }}>
//       <Typography variant="h5" gutterBottom>
// Carte des parcelles du commercial
//       </Typography>

//       <Button
//         onClick={() => navigate(-1)}
//         sx={{ mb: 2 }}
//         variant="outlined"
//         color="secondary"
//       >
// Retour
//       </Button>

//       {loading ? (
//         <CircularProgress />
//       ) : error ? (
//         <Alert severity="error">{error}</Alert>
//       ) : parcellesAvecCoord.length === 0 ? (
//         <Alert severity="info">Aucune parcelle avec coordonnées</Alert>
//       ) : (
//         <Box
//           sx={{
//             height: "600px",
//             width: "100%",
//             borderRadius: 2,
//             overflow: "hidden",
//             boxShadow: 2,
//             mt: 2,
//           }}
//         >
//           <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
//             <TileLayer
//               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//               attribution="© OpenStreetMap contributors"
//             />
//             {parcellesAvecCoord.map((p) => (
//               <Marker
//                 key={p._id}
//                 position={[p.localisation.lat, p.localisation.lng]}
//               >
//                 <Popup>
//                   <strong>{p.numeroParcelle}</strong>
//                   <br />
//                   Îlot : {p.ilot?.numeroIlot || "-"}
//                   <br />
//                   Superficie : {p.superficie} m²
//                 </Popup>
//               </Marker>
//             ))}
//           </MapContainer>
//         </Box>
//       )}
//     </Container>
//   );
// };

// export default CommercialMapPage;




// import React, { useEffect, useState } from "react";
// import {
//   Container,
//   Typography,
//   CircularProgress,
//   Alert,
//   Button,
//   Box,
// } from "@mui/material";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../../services/api";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// // Corriger les icônes de Leaflet
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
//   iconUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//   shadowUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
// });

// const CommercialMapPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [parcelles, setParcelles] = useState([]);
//   const [userLocation, setUserLocation] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Obtenir la position actuelle
//   useEffect(() => {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setUserLocation({
//           lat: position.coords.latitude,
//           lng: position.coords.longitude,
//         });
//       },
//       () => {
//         setUserLocation({ lat: 13.5128, lng: 2.1127 }); // fallback Niamey
//       }
//     );
//   }, []);

//   // Charger les parcelles affectées
//   useEffect(() => {
//     const fetchParcelles = async () => {
//       setLoading(true);
//       try {
//         const res = await api.get(`/agence/commerciaux/${id}/parcelles`);
//         const avecCoords = res.data.filter(
//           (p) => p.localisation?.lat && p.localisation?.lng
//         );
//         setParcelles(avecCoords);
//       } catch (err) {
//         setError("Erreur lors du chargement des parcelles");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchParcelles();
//   }, [id]);

//   const center = userLocation || [13.5128, 2.1127];

//   return (
//     <Container sx={{ mt: 4 }}>
//       <Typography variant="h5" gutterBottom>
// Carte des parcelles du commercial
//       </Typography>

//       <Button
//         onClick={() => navigate(-1)}
//         sx={{ mb: 2 }}
//         variant="outlined"
//         color="secondary"
//       >
// Retour
//       </Button>

//       {loading || !userLocation ? (
//         <CircularProgress />
//       ) : error ? (
//         <Alert severity="error">{error}</Alert>
//       ) : parcelles.length === 0 ? (
//         <Alert severity="info">Aucune parcelle avec coordonnées</Alert>
//       ) : (
//         <Box
//           sx={{
//             height: "600px",
//             width: "100%",
//             borderRadius: 2,
//             overflow: "hidden",
//             boxShadow: 2,
//             mt: 2,
//           }}
//         >
//           <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
//             <TileLayer
//               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//               attribution="© OpenStreetMap contributors"
//             />

// {/* Position actuelle */}
//             <Marker position={[userLocation.lat, userLocation.lng]}>
// <Popup> Vous êtes ici</Popup>
//             </Marker>

// {/* Parcelles */}
//             {parcelles.map((p) => (
//               <Marker
//                 key={p._id}
//                 position={[p.localisation.lat, p.localisation.lng]}
//               >
//                 <Popup>
//                   <strong>{p.numeroParcelle}</strong>
//                   <br />
//                   Îlot : {p.ilot?.numeroIlot || "-"}
//                   <br />
//                   Superficie : {p.superficie} m²
//                 </Popup>
//               </Marker>
//             ))}
//           </MapContainer>
//         </Box>
//       )}
//     </Container>
//   );
// };

// export default CommercialMapPage;






import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Box,
  TextField,
  MenuItem,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowBack, Map } from "@mui/icons-material";
import AgencePageHeader from "../../components/agence/AgencePageHeader";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapCentrer = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position]);
  return null;
};

const CommercialMapPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parcelles, setParcelles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedParcelleId, setSelectedParcelleId] = useState("");
  const [mapCenter, setMapCenter] = useState([13.5128, 2.1127]); // Niamey par défaut

  useEffect(() => {
    const fetchParcelles = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/agence/commerciaux/${id}/parcelles`);
        const avecCoord = res.data.filter(
          (p) => p.localisation?.lat && p.localisation?.lng
        );
        setParcelles(avecCoord);
        if (avecCoord.length) {
          setMapCenter([
            avecCoord[0].localisation.lat,
            avecCoord[0].localisation.lng,
          ]);
        }
      } catch (err) {
        setError("Erreur lors du chargement des parcelles");
      } finally {
        setLoading(false);
      }
    };

    fetchParcelles();
  }, [id]);

  const handleSelectParcelle = (id) => {
    setSelectedParcelleId(id);
    const parcelle = parcelles.find((p) => p._id === id);
    if (parcelle) {
      setMapCenter([parcelle.localisation.lat, parcelle.localisation.lng]);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <AgencePageHeader
        icon={Map}
        title="Carte des parcelles du commercial"
        subtitle="Localisation des parcelles affectées sur la carte"
        action={
          <Button
            onClick={() => navigate(-1)}
            startIcon={<ArrowBack />}
            variant="outlined"
            sx={{ borderColor: "rgba(255,255,255,0.6)", color: "white" }}
          >
            Retour
          </Button>
        }
      />

      {parcelles.length > 0 && (
        <TextField
          select
          label="Choisir une parcelle"
          value={selectedParcelleId}
          onChange={(e) => handleSelectParcelle(e.target.value)}
          fullWidth
          SelectProps={{ displayEmpty: true }}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        >
          <MenuItem value="" disabled>
            Sélectionnez une parcelle
          </MenuItem>
          {parcelles.map((p) => (
            <MenuItem key={p._id} value={p._id}>
              {p.numeroParcelle} (Îlot: {p.ilot?.numeroIlot || "-"})
            </MenuItem>
          ))}
        </TextField>
      )}

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : parcelles.length === 0 ? (
        <Alert severity="info">Aucune parcelle avec coordonnées</Alert>
      ) : (
        <Box
          sx={{
            height: "600px",
            width: "100%",
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #e3e8ef",
          }}
        >
          <MapContainer center={mapCenter} zoom={13} style={{ height: "100%" }}>
            <MapCentrer position={mapCenter} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            {parcelles.map((p) => (
              <Marker
                key={p._id}
                position={[p.localisation.lat, p.localisation.lng]}
              >
                <Popup>
                  <strong>{p.numeroParcelle}</strong>
                  <br />
                  Îlot : {p.ilot?.numeroIlot || "-"}
                  <br />
                  Superficie : {p.superficie} m²
                  <br />
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ mt: 1 }}
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${p.localisation.lat},${p.localisation.lng}`,
                        "_blank"
                      )
                    }
                  >
                    Itinéraire
                  </Button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Box>
      )}
    </Container>
  );
};

export default CommercialMapPage;
