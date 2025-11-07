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
} from "@mui/material";
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
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        📦 Parcelles disponibles à la vente
      </Typography>

      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }} variant="outlined">
        ⬅️ Retour
      </Button>

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
                      >
                        🧾 Vendre
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
  );
};

export default ParcellesNonVenduesPage;
