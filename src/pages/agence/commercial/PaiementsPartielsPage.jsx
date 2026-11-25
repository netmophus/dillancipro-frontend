import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  LinearProgress,
  Stack,
  Divider,
  Grid,
} from "@mui/material";
import {
  ArrowBack,
  Payment,
  CheckCircle,
  HourglassEmpty,
  Visibility,
  Receipt,
  TrendingUp,
} from "@mui/icons-material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useNavigate } from "react-router-dom";
import CommercialLayout from "../../../components/commercial/CommercialLayout";
import AgencePageHeader from "../../../components/agence/AgencePageHeader";
import api from "../../../services/api";

const PaiementsPartielsPage = () => {
  const navigate = useNavigate();
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPaiements();
  }, []);

  const fetchPaiements = async () => {
    setLoading(true);
    try {
      // Récupérer les stats qui contiennent les infos sur les paiements partiels
      const statsRes = await api.get("/agence/commerciaux/stats");
      
      // Pour avoir la liste détaillée, on doit créer un endpoint dédié
      // Pour l'instant, on affiche les stats
      console.log("Paiements stats:", statsRes.data);
      
      // TODO: Créer un endpoint /agence/paiements/partiels/me pour la liste complète
      
    } catch (err) {
      setError("Erreur lors du chargement des paiements");
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  };

  return (
    <CommercialLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <AgencePageHeader
          icon={Payment}
          title="Paiements Partiels"
          subtitle="Suivi des échéanciers de vos clients"
          action={
            <Button startIcon={<ArrowBack />} variant="outlined"
              onClick={() => navigate("/agence/commercial/dashboard")}
              sx={{ borderColor: "rgba(255,255,255,0.6)", color: "white" }}>
              Retour au dashboard
            </Button>
          }
        />

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Fonctionnalité en développement</strong>
            <br />
            Cette page affichera bientôt la liste détaillée de tous les paiements partiels avec :
            • Informations du client
            • Parcelle concernée
            • Montant total, payé et restant
            • Historique des versements
            • Prochaine échéance
          </Typography>
        </Alert>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : (
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e3e8ef" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <AssessmentIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Vue d'ensemble des paiements partiels
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Typography variant="body2" color="text.secondary" textAlign="center" py={6}>
                Aucun paiement partiel à afficher pour le moment.
                <br />
                Les paiements partiels apparaîtront ici lorsque des clients achèteront avec échéancier.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>
    </CommercialLayout>
  );
};

export default PaiementsPartielsPage;

