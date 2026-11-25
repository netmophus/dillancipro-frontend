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
  Tooltip,
  Grid,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CommercialLayout from "../../../components/commercial/CommercialLayout";
import AgencePageHeader from "../../../components/agence/AgencePageHeader";
import LandscapeIcon from "@mui/icons-material/Landscape";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

const ParcellesNonVenduesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [parcelles, setParcelles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchParcelles = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/agence/commerciaux/${user?._id}/parcelles`);
        const disponibles = res.data.filter(p => p.statut === "avendre");
        setParcelles(disponibles);
      } catch (err) {
        setError("Erreur lors du chargement des parcelles");
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchParcelles();
    }
  }, [user]);

  return (
    <CommercialLayout>
      <Container sx={{ mt: 4 }}>
      <AgencePageHeader
        icon={ReceiptLongIcon}
        title="Parcelles disponibles à la vente"
        subtitle="Sélectionnez une parcelle pour lancer une vente"
        action={
          <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} variant="outlined"
            sx={{ borderColor: "rgba(255,255,255,0.6)", color: "white" }}>
            Retour
          </Button>
        }
      />

      {!loading && parcelles.length > 0 && (
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {[
            { label: "Total disponibles", value: parcelles.length, icon: LandscapeIcon, color: "#2e7d32" },
            { label: "Superficie totale", value: parcelles.reduce((s, p) => s + (p.superficie || 0), 0).toLocaleString() + " m²", icon: SquareFootIcon, color: "#0288d1" },
            { label: "Valeur totale", value: parcelles.reduce((s, p) => s + (p.prix || 0), 0).toLocaleString() + " FCFA", icon: AttachMoneyIcon, color: "#f57c00" },
          ].map((kpi) => (
            <Grid item xs={12} sm={4} key={kpi.label}>
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
      ) : parcelles.length === 0 ? (
        <Alert severity="info">Aucune parcelle disponible à la vente</Alert>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Numéro</TableCell>
                <TableCell>Îlot</TableCell>
                <TableCell>Superficie</TableCell>
                <TableCell>Prix</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parcelles.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>{p.numeroParcelle}</TableCell>
                  <TableCell>{p.ilot?.numeroIlot || "-"}</TableCell>
                  <TableCell>{p.superficie} m²</TableCell>
                  <TableCell>{p.prix?.toLocaleString()} FCFA</TableCell>
                  <TableCell>
                    <Tooltip title="Vendre cette parcelle">
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => navigate(`/commercial/vendre-parcelle/${p._id}`)}
                        startIcon={<ReceiptLongIcon />}
                      >
                        Vendre
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
    </CommercialLayout>
  );
};

export default ParcellesNonVenduesPage;
