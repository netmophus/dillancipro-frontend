
// import React, { useEffect, useState } from "react";
// import {
//   Drawer,
//   Box,
//   Typography,
//   Divider,
//   List,
//   ListItem,
//   ListItemText,
//   CircularProgress,
//   Alert,
//   Button,
//   Chip,
//   Stack,
// } from "@mui/material";
// import api from "../../services/api";

// const DrawerPartielPaiements = ({ open, onClose, paiement }) => {
//   const [paiementsPartiels, setPaiementsPartiels] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");



// useEffect(() => {
//     if (!paiement) return;
  
//     const fetchPartiels = async () => {
//       setLoading(true);
//       try {
//         const res = await api.get(`/agence/commerciaux/partiels/${paiement._id}`);
//         setPaiementsPartiels(res.data);
//       } catch {
//         setError("Erreur lors du chargement des paiements partiels");
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchPartiels();
//   }, [paiement, paiement?._id]); // ✅ ajoute le paiementId comme dépendance
  

//   return (
//     <Drawer anchor="right" open={open} onClose={onClose}>
//       <Box sx={{ width: 420, p: 3 }}>
//         <Typography variant="h6" gutterBottom>
//           💳 Paiements partiels – Parcelle {paiement?.parcelle?.numeroParcelle}
//         </Typography>

//         {/* Détails globaux */}
//         <Stack spacing={1} sx={{ mb: 2 }}>
//           <Typography variant="body2">
//             Montant total : <strong>{paiement?.montantTotal?.toLocaleString()} FCFA</strong>
//           </Typography>
//           <Typography variant="body2">
//             Montant payé : <strong>{paiement?.montantPaye?.toLocaleString()} FCFA</strong>
//           </Typography>
//           <Typography variant="body2">
//             Montant restant :{" "}
//             <strong>
//               {paiement?.montantRestant > 0
//                 ? `${paiement?.montantRestant.toLocaleString()} FCFA`
//                 : "0 FCFA"}
//             </strong>
//           </Typography>
//           <Chip
//             label={paiement?.statut === "paid" ? "Payé" : "Impayé"}
//             color={paiement?.statut === "paid" ? "success" : "warning"}
//             size="small"
//             sx={{ width: "fit-content" }}
//           />
//         </Stack>

//         <Divider sx={{ my: 2 }} />

//         {/* Liste des paiements partiels */}
//         {loading ? (
//           <CircularProgress />
//         ) : error ? (
//           <Alert severity="error">{error}</Alert>
//         ) : paiementsPartiels.length === 0 ? (
//           <Alert severity="info">Aucun paiement partiel enregistré</Alert>
//         ) : (
//           <List>
//             {paiementsPartiels.map((p) => (
//               <ListItem key={p._id} divider>
//                 <ListItemText
//                   primary={`${p.montant.toLocaleString()} FCFA`}
//                   secondary={new Date(p.datePaiement).toLocaleDateString()}
//                 />
//                 {p.recuUrl ? (
//                   <Button
//                     size="small"
//                     variant="outlined"
//                     href={`/${p.recuUrl}`}
//                     target="_blank"
//                     rel="noopener"
//                   >
//                     📥 Reçu
//                   </Button>
//                 ) : (
//                   <Typography variant="caption" color="text.secondary">
//                     Aucun reçu
//                   </Typography>
//                 )}
//               </ListItem>
//             ))}
//           </List>
//         )}
//       </Box>
//     </Drawer>
//   );
// };

// export default DrawerPartielPaiements;




import React, { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import api from "../../services/api";

const DrawerPartielPaiements = ({ open, onClose, paiement }) => {
  const [paiementsPartiels, setPaiementsPartiels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !paiement?._id) return;

    const fetchPartiels = async () => {
      setError("");
      setLoading(true);
      try {
        const res = await api.get(`/agence/paiements/partiels/${paiement._id}`);
        const data = res.data;
        const items = Array.isArray(data) ? data : data.items || [];
        setPaiementsPartiels(items);
      } catch {
        setError("Erreur lors du chargement des paiements partiels");
      } finally {
        setLoading(false);
      }
    };

    fetchPartiels();
  }, [open, paiement?._id]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 420, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          💳 Paiements partiels – Parcelle {paiement?.parcelle?.numeroParcelle}
        </Typography>

        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography variant="body2">
            Montant total :{" "}
            <strong>
              {paiement?.montantTotal
                ? `${paiement.montantTotal.toLocaleString()} FCFA`
                : "-"}
            </strong>
          </Typography>
          <Typography variant="body2">
            Montant payé :{" "}
            <strong>
              {paiement?.montantPaye
                ? `${paiement.montantPaye.toLocaleString()} FCFA`
                : "0 FCFA"}
            </strong>
          </Typography>
          <Typography variant="body2">
            Montant restant :{" "}
            <strong>
              {typeof paiement?.montantRestant === "number"
                ? `${paiement.montantRestant.toLocaleString()} FCFA`
                : "0 FCFA"}
            </strong>
          </Typography>
          <Chip
            label={paiement?.statut === "paid" ? "Payé" : "Impayé"}
            color={paiement?.statut === "paid" ? "success" : "warning"}
            size="small"
            sx={{ width: "fit-content" }}
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : paiementsPartiels.length === 0 ? (
          <Alert severity="info">Aucun paiement partiel enregistré</Alert>
        ) : (
          <List>
            {paiementsPartiels.map((p, index) => (
              <ListItem 
                key={p._id || index} 
                divider={index < paiementsPartiels.length - 1}
              >
                <ListItemText
                  primary={`${(p.montant || 0).toLocaleString()} FCFA`}
                  secondary={new Date(
                    p.datePaiement || p.createdAt
                  ).toLocaleDateString()}
                />
                {p.recuUrl ? (
                  <Button
                    size="small"
                    variant="outlined"
                    href={p.recuUrl.startsWith("http") ? p.recuUrl : `/${p.recuUrl}`}
                    target="_blank"
                    rel="noopener"
                  >
                    📥 Reçu
                  </Button>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Aucun reçu
                  </Typography>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default DrawerPartielPaiements;
