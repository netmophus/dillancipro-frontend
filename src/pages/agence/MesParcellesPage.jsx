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
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const MesParcellesPage = () => {
  const { id } = useParams(); // ID du commercial
  const navigate = useNavigate();

  const [parcelles, setParcelles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchParcelles = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/agence/commerciaux/${id}/parcelles`);
        setParcelles(res.data);
      } catch (err) {
        setError("Erreur lors du chargement des parcelles");
      } finally {
        setLoading(false);
      }
    };

    fetchParcelles();
  }, [id]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        🧱 Parcelles affectées au commercial
      </Typography>

      <Button onClick={() => navigate("/agence/create-commercial")} sx={{ mb: 2 }}>
        ⬅️ Retour creation commercial
      </Button>

      <Button
  variant="contained"
  color="primary"
  onClick={() => navigate(`/agence/carte-commercial/${id}`)}
  sx={{ mb: 2, ml: 2 }}
>
  🗺️ Voir sur la carte
</Button>


      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : parcelles.length === 0 ? (
        <Alert severity="info">Aucune parcelle affectée</Alert>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Numéro</TableCell>
                <TableCell>Îlot</TableCell>
                <TableCell>Superficie</TableCell>
                <TableCell>Prix</TableCell>
                <TableCell>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parcelles.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>{p.numeroParcelle}</TableCell>
                  <TableCell>{p.ilot?.numeroIlot || "-"}</TableCell>
                  <TableCell>{p.superficie} m²</TableCell>
                  <TableCell>{p.prix} FCFA</TableCell>
                  <TableCell>{p.statut}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
};

export default MesParcellesPage;
