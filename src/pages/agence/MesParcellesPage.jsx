import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { ArrowBack, Map, Landscape } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import AgencePageHeader from "../../components/agence/AgencePageHeader";

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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <AgencePageHeader
        icon={Landscape}
        title="Parcelles affectées au commercial"
        subtitle={`${parcelles.length} parcelle${parcelles.length > 1 ? "s" : ""} assignée${parcelles.length > 1 ? "s" : ""}`}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              startIcon={<ArrowBack />}
              variant="outlined"
              onClick={() => navigate("/agence/create-commercial")}
              sx={{ borderColor: "rgba(255,255,255,0.6)", color: "white" }}
            >
              Retour
            </Button>
            <Button
              startIcon={<Map />}
              variant="contained"
              onClick={() => navigate(`/agence/carte-commercial/${id}`)}
              sx={{ bgcolor: "white", color: "#0D2B4E", fontWeight: "bold", "&:hover": { bgcolor: "#e3e8ef" } }}
            >
              Voir sur la carte
            </Button>
          </Stack>
        }
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : parcelles.length === 0 ? (
        <Alert severity="info">Aucune parcelle affectée à ce commercial</Alert>
      ) : (
        <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e3e8ef" }}>
          <TableContainer>
            <Table>
              <TableHead
                sx={{
                  "& th": {
                    bgcolor: "#f6f8fb",
                    color: "text.secondary",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    borderBottom: "2px solid #e3e8ef",
                  },
                }}
              >
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
                  <TableRow key={p._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{p.numeroParcelle}</Typography>
                    </TableCell>
                    <TableCell>{p.ilot?.numeroIlot || "-"}</TableCell>
                    <TableCell>{p.superficie ? `${p.superficie} m²` : "-"}</TableCell>
                    <TableCell>
                      {p.prix ? new Intl.NumberFormat("fr-FR").format(p.prix) + " FCFA" : "-"}
                    </TableCell>
                    <TableCell>
                      <Chip label={p.statut} size="small" variant="outlined" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Container>
  );
};

export default MesParcellesPage;
