import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  CircularProgress,
  Box,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useAuth } from "../../../contexts/AuthContext";
import ClientLayout from "../../../components/client/ClientLayout";
import AgencePageHeader from "../../../components/agence/AgencePageHeader";
import api from "../../../services/api";

const ClientDashboardPage = () => {
  const { user } = useAuth();
  const [parcelles, setParcelles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchParcellesAchetees = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/client/parcelles/${user._id}`);
      setParcelles(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcellesAchetees();
  }, [user._id]);

  return (
    <ClientLayout>
      <Container sx={{ mt: 4 }}>
        <AgencePageHeader
          icon={DashboardIcon}
          title="Tableau de bord - Client"
          subtitle="Vue d'ensemble de vos parcelles achetées"
        />

        <Typography variant="body1" sx={{ mb: 3 }}>
          Bienvenue <strong>{user?.fullName || "Client"}</strong>. Voici vos parcelles achetées.
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : parcelles.length === 0 ? (
          <Typography variant="body2">Aucune parcelle achetée pour le moment.</Typography>
        ) : (
          <Grid container spacing={3}>
            {parcelles.map((p) => (
              <Grid item xs={12} md={4} key={p._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      Parcelle {p.numeroParcelle}
                    </Typography>
                    <Typography>Îlot : {p.ilot?.numeroIlot}</Typography>
                    <Typography>Superficie : {p.superficie} m²</Typography>
                    <Typography>Prix : {p.prix?.toLocaleString()} FCFA</Typography>
                    <Chip
                      label={p.statut === "vendue" ? "Vendu" : "En attente"}
                      color={p.statut === "vendue" ? "success" : "warning"}
                      sx={{ mt: 1 }}
                    />
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      Date d’achat :{" "}
                      {p.dateVente
                        ? new Date(p.dateVente).toLocaleDateString()
                        : "N/A"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </ClientLayout>
  );
};

export default ClientDashboardPage;
