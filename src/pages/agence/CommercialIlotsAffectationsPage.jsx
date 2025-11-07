import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PageLayout from "../../components/shared/PageLayout";
import api from "../../services/api";

const CommercialIlotsAffectationsPage = () => {
  const [commerciaux, setCommerciaux] = useState([]);
  const [commercialId, setCommercialId] = useState("");
  const [ilots, setIlots] = useState([]);
  const [parcelles, setParcelles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const fetchCommerciaux = async () => {
    try {
      const res = await api.get("/agence/commerciaux");
      setCommerciaux(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Erreur lors du chargement des commerciaux");
    }
  };

  const fetchAffectations = async (id) => {
    setLoading(true);
    setErr("");
    try {
      const [ilotsRes, parcellesRes] = await Promise.all([
        api.get(`/agence/commerciaux/${id}/ilots`),       // îlots affectés
        api.get(`/agence/commerciaux/${id}/parcelles`),   // parcelles affectées
      ]);
      setIlots(ilotsRes.data || []);
      setParcelles(parcellesRes.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "Erreur lors du chargement des affectations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommerciaux();
  }, []);

  useEffect(() => {
    if (commercialId) fetchAffectations(commercialId);
  }, [commercialId]);

  // Regroupe les parcelles (affectées à ce commercial) par îlot
  const parcellesByIlot = useMemo(() => {
    const map = new Map();
    for (const p of parcelles) {
      const key = p.ilot?._id || p.ilot; // selon populate
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    }
    return map;
  }, [parcelles]);

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Îlots & parcelles affectés à un commercial
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            select
            label="Commercial"
            value={commercialId}
            onChange={(e) => setCommercialId(e.target.value)}
            sx={{ minWidth: 420 }}
          >
            {commerciaux.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {(c.fullName && c.fullName.trim()) || "Nom non renseigné"} — {c.phone}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

        {!commercialId ? (
          <Alert severity="info">Sélectionnez un commercial pour voir ses affectations.</Alert>
        ) : loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper variant="outlined">
            {ilots.length === 0 ? (
              <Box sx={{ p: 3 }}>
                <Typography>Aucun îlot affecté à ce commercial.</Typography>
              </Box>
            ) : (
              ilots.map((ilot) => {
                const list = parcellesByIlot.get(ilot._id) || [];
                return (
                  <Accordion key={ilot._id} disableGutters>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Îlot {ilot.numeroIlot}
                        </Typography>
                        <Chip size="small" label={`Zone: ${ilot.zone?.nom || "-"}`} />
                        <Chip size="small" label={`Quartier: ${ilot.quartier?.nom || "-"}`} />
                        <Chip size="small" label={`Surface: ${ilot.surfaceTotale || 0} m²`} />
                        <Chip
                          size="small"
                          color={list.length > 0 ? "primary" : "default"}
                          label={`${list.length} parcelle(s) affectée(s)`}
                        />
                      </Box>
                    </AccordionSummary>
                    <Divider />
                    <AccordionDetails>
                      {list.length === 0 ? (
                        <Typography>Aucune parcelle de cet îlot n'est affectée à ce commercial.</Typography>
                      ) : (
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Parcelle</TableCell>
                              <TableCell>Superficie</TableCell>
                              <TableCell>Prix</TableCell>
                              <TableCell>Statut</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {list.map((p) => (
                              <TableRow key={p._id}>
                                <TableCell>{p.numeroParcelle}</TableCell>
                                <TableCell>{p.superficie ? `${p.superficie} m²` : "-"}</TableCell>
                                <TableCell>
                                  {p.prix
                                    ? new Intl.NumberFormat("fr-FR", {
                                        style: "currency",
                                        currency: "XOF",
                                      }).format(p.prix)
                                    : "-"}
                                </TableCell>
                                <TableCell>{p.statut}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </AccordionDetails>
                  </Accordion>
                );
              })
            )}
          </Paper>
        )}
      </Container>
    </PageLayout>
  );
};

export default CommercialIlotsAffectationsPage;
