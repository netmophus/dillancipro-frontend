import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Table, TableHead, TableRow, TableCell, TableBody,
  TablePagination,
  Box,
  Skeleton,
  Alert,
} from "@mui/material";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip } from "@mui/material";

import PageLayout from "../../../components/shared/PageLayout";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";

const CommercialMesIlotsPage = () => {
  const { user } = useAuth();
  const [ilots, setIlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);


  const [openParcelles, setOpenParcelles] = useState(false);
const [ilotSelected, setIlotSelected] = useState(null);
const [parcellesIlot, setParcellesIlot] = useState([]);
const [loadingParcelles, setLoadingParcelles] = useState(false);


const showParcellesOfIlot = async (ilot) => {
  setIlotSelected(ilot);
  setOpenParcelles(true);
  setLoadingParcelles(true);
  try {
    // Endpoint côté backend: GET /api/agence/ilots/:id/parcelles
    const res = await api.get(`/agence/ilots/${ilot._id}/parcelles`);
    setParcellesIlot(Array.isArray(res.data) ? res.data : []);
  } catch {
    setParcellesIlot([]);
  } finally {
    setLoadingParcelles(false);
  }
};


  const fetchIlots = async () => {
    if (!user?._id) return;
    setLoading(true);
    setErr("");
    try {
      // Endpoint: GET /api/agence/commerciaux/:id/ilots
      const res = await api.get(`/agence/commerciaux/${user._id}/ilots`);
      setIlots(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(e.response?.data?.message || "Erreur lors du chargement des îlots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const handleChangePage = (_, newPage) => setPage(newPage);

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Mes îlots affectés
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Liste des îlots qui vous sont assignés.
        </Typography>

        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

        <Paper sx={{ p: 2 }}>
          {loading ? (
            <Box sx={{ p: 2 }}>
              <Skeleton variant="rounded" height={56} sx={{ mb: 1 }} />
              <Skeleton variant="rounded" height={56} sx={{ mb: 1 }} />
              <Skeleton variant="rounded" height={56} sx={{ mb: 1 }} />
            </Box>
          ) : ilots.length === 0 ? (
            <Box sx={{ p: 3, color: "text.secondary" }}>
              Aucun îlot affecté pour le moment.
            </Box>
          ) : (
            <>
              <Table>
              <TableHead>
  <TableRow>
    <TableCell>Numéro d’îlot</TableCell>
    <TableCell>Zone</TableCell>
    <TableCell>Quartier</TableCell>
    <TableCell>Surface totale (m²)</TableCell>
  </TableRow>
</TableHead>

<TableBody>
  {ilots
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .map((ilot) => (
      <TableRow
        key={ilot._id}
        hover
        onClick={() => showParcellesOfIlot(ilot)}
        sx={{ cursor: "pointer" }}
      >
        <TableCell>{ilot.numeroIlot}</TableCell>
        <TableCell>{ilot.zone?.nom || "-"}</TableCell>
        <TableCell>{ilot.quartier?.nom || "-"}</TableCell>
        <TableCell>{ilot.surfaceTotale ?? "-"}</TableCell>
      </TableRow>
    ))}
</TableBody>

              </Table>
              <TablePagination
                component="div"
                count={ilots.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[]}
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              />
            </>
          )}
        </Paper>


        <Dialog open={openParcelles} onClose={() => setOpenParcelles(false)} fullWidth maxWidth="md">
  <DialogTitle>
    Parcelles — Îlot {ilotSelected?.numeroIlot || ""}
  </DialogTitle>
  <DialogContent dividers>
    {loadingParcelles ? (
      <Typography>Chargement…</Typography>
    ) : parcellesIlot.length === 0 ? (
      <Typography>Aucune parcelle trouvée pour cet îlot.</Typography>
    ) : (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Numéro</TableCell>
            <TableCell>Superficie</TableCell>
            <TableCell>Prix</TableCell>
            <TableCell>Statut</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {parcellesIlot.map((p) => (
            <TableRow key={p._id}>
              <TableCell>{p.numeroParcelle}</TableCell>
              <TableCell>{p.superficie ?? "-"}</TableCell>
              <TableCell>
                {typeof p.prix === "number"
                  ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(p.prix)
                  : "-"}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={p.statut || "-"}
                  color={
                    p.statut === "vendue"
                      ? "success"
                      : p.statut === "avendre"
                      ? "warning"
                      : "default"
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenParcelles(false)}>Fermer</Button>
  </DialogActions>
</Dialog>

      </Container>
    </PageLayout>
  );
};

export default CommercialMesIlotsPage;
