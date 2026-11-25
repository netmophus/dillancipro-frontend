import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Tooltip,
  Box,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";
import DrawerPartielPaiements from "../../../components/commercial/DrawerPartielPaiements";
import AjouterPaiementPartielModal from "../../../components/commercial/AjouterPaiementPartielModal";
import TransférerAuNotaireModal from "../../../components/commercial/TransférerAuNotaireModal";
import CreerEcheancierModal from "../../../components/commercial/CreerEcheancierModal";
import EcheancierDrawer from "../../../components/commercial/EcheancierDrawer";
import { useNavigate } from "react-router-dom";
import { Gavel, CalendarToday } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CommercialLayout from "../../../components/commercial/CommercialLayout";
import AgencePageHeader from "../../../components/agence/AgencePageHeader";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

const ParcellesVenduesPage = () => {
  const { user } = useAuth();
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPaiement, setSelectedPaiement] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [openModal, setOpenModal] = useState(false);
  const [paiementSelectionne, setPaiementSelectionne] = useState(null);
  const [openTransférerModal, setOpenTransférerModal] = useState(false);
  const [paiementPourTransfert, setPaiementPourTransfert] = useState(null);
  const [openEcheancierModal, setOpenEcheancierModal] = useState(false);
  const [paiementPourEcheancier, setPaiementPourEcheancier] = useState(null);
  const [echeancierDrawerOpen, setEcheancierDrawerOpen] = useState(false);
  const [paiementPourEcheancierDrawer, setPaiementPourEcheancierDrawer] = useState(null);
  const [echeanciersMap, setEcheanciersMap] = useState({}); // Map paiementId -> echeancier
  const navigate = useNavigate();


const handleRefresh = () => {
  setRefreshKey((prev) => prev + 1);
};


  useEffect(() => {
    const fetchPaiements = async () => {
      setLoading(true);
      try {
        // const res = await api.get(`/agence/commerciaux/parcelles-vendues`);
        const res = await api.get("/agence/paiements/parcelles-vendues");
        setPaiements(res.data);
        
        // Charger les échéanciers pour chaque paiement
        const echeanciersMapTemp = {};
        await Promise.all(
          res.data.map(async (p) => {
            try {
              const echeancierRes = await api.get(`/agence/echeanciers/paiement/${p._id}`);
              if (echeancierRes.data) {
                echeanciersMapTemp[p._id] = echeancierRes.data;
              }
            } catch (err) {
              // Pas d'échéancier pour ce paiement
            }
          })
        );
        setEcheanciersMap(echeanciersMapTemp);
      } catch {
        setError("Erreur lors du chargement des paiements");
      } finally {
        setLoading(false);
      }
    };
  
    if (user?._id) fetchPaiements();
  }, [user, refreshKey]);

  


  return (
    <CommercialLayout>
      <Container sx={{ mt: 4 }}>
        <AgencePageHeader
          icon={Gavel}
          title="Parcelles vendues"
          subtitle="Suivi des paiements et transferts au notaire"
          action={
            <Button variant="outlined" startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/agence/commercial/dashboard")}
              sx={{ borderColor: "rgba(255,255,255,0.6)", color: "white" }}>
              Retour
            </Button>
          }
        />

      {!loading && paiements.length > 0 && (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {[
            { label: "Total", value: paiements.length, icon: ReceiptLongIcon, color: "#1976d2" },
            { label: "Payés", value: paiements.filter((p) => p.statut === "paid").length, icon: CheckCircleIcon, color: "#2e7d32" },
            { label: "Encaissé", value: paiements.reduce((s, p) => s + (p.montantPaye || 0), 0).toLocaleString() + " FCFA", icon: AttachMoneyIcon, color: "#00897b" },
            { label: "Reste à percevoir", value: paiements.reduce((s, p) => s + (p.montantRestant || 0), 0).toLocaleString() + " FCFA", icon: HourglassEmptyIcon, color: "#ff9800" },
          ].map((kpi) => (
            <Grid item xs={6} md={3} key={kpi.label}>
              <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e3e8ef" }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" color="text.secondary">{kpi.label}</Typography>
                      <Typography variant="h5" fontWeight="bold" sx={{ color: kpi.color }} noWrap>{kpi.value}</Typography>
                    </Box>
                    <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: `${kpi.color}15`, color: kpi.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <kpi.icon />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : paiements.length === 0 ? (
        <Alert severity="info">Aucune parcelle vendue</Alert>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Parcelle</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Montant payé</TableCell>
                <TableCell>Montant restant</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paiements.map((p) => {
                // Debug: afficher les infos de vente
                const paiementPaye = p.statut === "paid";
                const venteExiste = p.vente && p.vente._id;
                const ventePaiementComplet = p.vente?.statut === "paiement_complet";
                const venteDejaTransferee = p.vente?.statut === "en_attente_notaire" || p.vente?.statut === "en_cours_notariat" || p.vente?.statut === "formalites_completes" || p.vente?.statut === "en_attente_signature" || p.vente?.statut === "signee" || p.vente?.statut === "finalisee";
                const peutTransférer = paiementPaye && venteExiste && ventePaiementComplet && !venteDejaTransferee;

                return (
                  <TableRow key={p._id}>
                    <TableCell>{p.parcelle?.numeroParcelle || "-"}</TableCell>
                    <TableCell>
                      {p.client?.fullName || "-"} <br />
                      {p.client?.phone}
                    </TableCell>
                    <TableCell>{p.montantPaye?.toLocaleString() || 0} FCFA</TableCell>
                    <TableCell>
                      {p.montantRestant > 0
                        ? `${p.montantRestant.toLocaleString()} FCFA`
                        : "0 FCFA"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={p.statut === "paid" ? "Payé" : "Impayé"}
                        color={p.statut === "paid" ? "success" : "warning"}
                      />
                      {p.vente && (
                        <Chip
                          label={`Vente: ${p.vente.statut || "N/A"}`}
                          color="secondary"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {p.statut === "unpaid" && (
                          <>
                            <Tooltip title="Suivre les paiements">
                              <Button
                                variant="outlined"
                                color="info"
                                size="small"
                                onClick={() => {
                                  setSelectedPaiement(p);
                                  setDrawerOpen(true);
                                }}
                              >
                                Suivi
                              </Button>
                            </Tooltip>
                            <Tooltip title={echeanciersMap[p._id] ? "Échéancier déjà créé" : "Créer un échéancier"}>
                              <span>
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  size="small"
                                  startIcon={<CalendarToday />}
                                  onClick={() => {
                                    setPaiementPourEcheancier(p);
                                    setOpenEcheancierModal(true);
                                  }}
                                  disabled={!!echeanciersMap[p._id]}
                                >
                                  Échéancier
                                </Button>
                              </span>
                            </Tooltip>
                            {echeanciersMap[p._id] && (
                              <Tooltip title="Voir l'échéancier">
                                <Button
                                  variant="outlined"
                                  color="secondary"
                                  size="small"
                                  startIcon={<CalendarToday />}
                                  onClick={() => {
                                    setPaiementPourEcheancierDrawer(p);
                                    setEcheancierDrawerOpen(true);
                                  }}
                                >
                                  Voir échéancier
                                </Button>
                              </Tooltip>
                            )}
                            <Button
                              variant="outlined"
                              color="warning"
                              size="small"
                              onClick={() => {
                                setPaiementSelectionne(p);
                                setOpenModal(true);
                              }}
                            >
                              Ajouter un paiement
                            </Button>
                          </>
                        )}
                        {peutTransférer && (
                          <Tooltip title="Transférer au notaire pour les formalités">
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<Gavel />}
                              onClick={() => {
                                setPaiementPourTransfert(p);
                                setOpenTransférerModal(true);
                              }}
                            >
                              Transférer au notaire
                            </Button>
                          </Tooltip>
                        )}
                        {p.statut === "paid" && !venteExiste && (
                          <Chip
                            label="Vente non créée"
                            color="warning"
                            size="small"
                          />
                        )}
                        {p.statut === "paid" && venteExiste && ventePaiementComplet && venteDejaTransferee && (
                          <Chip
                            label={`Déjà transféré (${p.vente.statut})`}
                            color="info"
                            size="small"
                          />
                        )}
                        {p.vente?.notaireId && (
                          <Chip
                            label={`Notaire: ${p.vente.notaireId.fullName || p.vente.notaireId.cabinetName || "N/A"}`}
                            color="info"
                            size="small"
                            icon={<Gavel />}
                          />
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Drawer pour paiements partiels */}
      {/* <DrawerPartielPaiements
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        paiement={selectedPaiement}
      /> */}


<DrawerPartielPaiements
  open={drawerOpen}
  onClose={() => {
    setDrawerOpen(false);
    // Facultatif : recharger la liste globale des paiements si besoin
  }}
  paiement={selectedPaiement}
/>


{/* 
<AjouterPaiementPartielModal
  open={openModal}
  onClose={() => setOpenModal(false)}
  paiement={paiementSelectionne}
 
/> */}


<AjouterPaiementPartielModal
  open={openModal}
  onClose={() => setOpenModal(false)}
  paiement={paiementSelectionne}
  onPaiementAjoute={handleRefresh}
/>

<TransférerAuNotaireModal
      open={openTransférerModal}
      onClose={() => {
        setOpenTransférerModal(false);
        setPaiementPourTransfert(null);
      }}
      paiement={paiementPourTransfert}
      onTransfertRéussi={handleRefresh}
    />

<CreerEcheancierModal
      open={openEcheancierModal}
      onClose={() => {
        setOpenEcheancierModal(false);
        setPaiementPourEcheancier(null);
      }}
      paiement={paiementPourEcheancier}
      onEcheancierCree={handleRefresh}
    />

<EcheancierDrawer
      open={echeancierDrawerOpen}
      onClose={() => {
        setEcheancierDrawerOpen(false);
        setPaiementPourEcheancierDrawer(null);
      }}
      paiement={paiementPourEcheancierDrawer}
    />

    </Container>
    </CommercialLayout>
  );
};

export default ParcellesVenduesPage;
