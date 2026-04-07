import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  Divider,
  Chip,
  Skeleton,
  Button,
  Paper,
} from "@mui/material";
import {
  Person,
  AccountBalance,
  Badge,
  LocationOn,
  Phone,
  Description,
  Assignment,
} from "@mui/icons-material";
import PageLayout from "../../../components/shared/PageLayout";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";

const labelPiece = (t) => {
  if (!t) return "-";
  switch (t) {
    case "CNI": return "Carte Nationale d’Identité";
    case "PASSPORT": return "Passeport";
    case "PERMIS": return "Permis de conduire";
    default: return "Autre";
  }
};

const MonProfil = () => {
  const { user } = useAuth();
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);




useEffect(() => {
  const fetchProfil = async () => {
    setLoading(true);
    try {
      const res = await api.get("/agence/commerciaux/me/profil"); // ✅ bonne route
      setProfil(res.data || null);
    } catch {
      setProfil(null);
    } finally {
      setLoading(false);
    }
  };
  fetchProfil();
}, []);

const photoSrc = useMemo(() => {
  const p = profil?.photoUrl;
  if (!p) return undefined;
  return p.startsWith("http") ? p : `/${p}`; // ✅ ok pour Cloudinary + local
}, [profil]);

const pieceHref = useMemo(() => {
  const f = profil?.pieceIdentite?.fichierUrl;
  if (!f) return undefined;
  return f.startsWith("http") ? f : `/${f}`; // ✅ évite "/https://..."
}, [profil]);


  const commissionText = useMemo(() => {
    const c = profil?.commission;
    if (!c) return "-";
    if (c.mode === "pourcentage") return `${c.valeur ?? 0}%`;
    return `${(c.valeur ?? 0).toLocaleString()} ${c.devise || "XOF"}`;
  }, [profil]);

  const pieceIsValid = useMemo(() => {
    const exp = profil?.pieceIdentite?.dateExpiration
      ? new Date(profil.pieceIdentite.dateExpiration)
      : null;
    if (!exp) return null;
    const today = new Date();
    return exp.getTime() >= new Date(today.toDateString()).getTime();
  }, [profil]);

  return (
    <PageLayout>
      <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#f5f7fa" }}>
        {/* En-tête modernisé */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            py: 6,
            mb: 4,
            width: "100%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              filter: "blur(80px)",
            }}
          />
          <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
            <Box display="flex" alignItems="center" gap={3}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Person sx={{ fontSize: 48, color: "white" }} />
              </Box>
              <Box>
                <Typography 
                  variant="h3" 
                  fontWeight={700}
                  sx={{
                    color: "white",
                    mb: 1,
                  }}
                >
                  Mon profil
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontWeight: 400,
                  }}
                >
                  Informations personnelles et paramètres de commission
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ mb: 6 }}>

        {loading ? (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rounded" height={260} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Skeleton variant="rounded" height={260} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="rounded" height={200} />
            </Grid>
          </Grid>
        ) : !profil ? (
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(0, 0, 0, 0.08)",
              background: "white",
            }}
          >
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h5" gutterBottom fontWeight={700}>
                Aucun profil trouvé
              </Typography>
              <Typography color="text.secondary">
                Votre profil n'est pas encore complété. Merci de le renseigner auprès de l'agence.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {/* Carte identité + photo */}
            <Grid item xs={12} md={4}>
              <Card 
                elevation={0} 
                sx={{ 
                  borderRadius: 3,
                  border: "1px solid rgba(102, 126, 234, 0.2)",
                  background: "white",
                  boxShadow: "0 8px 32px rgba(102, 126, 234, 0.15)",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 40px rgba(102, 126, 234, 0.2)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
                    <Avatar
                      src={photoSrc}
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        fontSize: 36,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "4px solid white",
                        boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
                      }}
                      alt={profil.fullName || user?.fullName || "Photo"}
                    >
                      {(profil.fullName || user?.fullName || "U").slice(0, 1).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {profil.fullName || user?.fullName || "Nom non renseigné"}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Phone sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {user?.phone || "-"}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          label={profil.commission?.actif ? "Commission active" : "Commission inactive"}
                          sx={{
                            background: profil.commission?.actif 
                              ? "linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(56, 142, 60, 0.15) 100%)"
                              : "rgba(158, 158, 158, 0.15)",
                            color: profil.commission?.actif ? "#2e7d32" : "#616161",
                            fontWeight: 600,
                            border: profil.commission?.actif 
                              ? "1px solid rgba(76, 175, 80, 0.3)"
                              : "1px solid rgba(158, 158, 158, 0.3)",
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2, borderColor: "rgba(102, 126, 234, 0.1)" }} />

                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
                    <LocationOn sx={{ color: "primary.main", mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                        Adresse
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {profil.adresse?.ligne1 || "-"}
                        {profil.adresse?.ligne2 ? `, ${profil.adresse.ligne2}` : ""}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {profil.adresse?.ville || "-"}{profil.adresse?.region ? `, ${profil.adresse.region}` : ""}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {profil.adresse?.codePostal || "-"} {profil.adresse?.pays || ""}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Détails commission + pièce d'identité */}
            <Grid item xs={12} md={8}>
              <Card 
                elevation={0} 
                sx={{ 
                  borderRadius: 3,
                  border: "1px solid rgba(102, 126, 234, 0.2)",
                  background: "white",
                  boxShadow: "0 8px 32px rgba(102, 126, 234, 0.15)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                    p: 2.5,
                    borderBottom: "1px solid rgba(102, 126, 234, 0.1)",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)",
                      }}
                    >
                      <AccountBalance sx={{ color: "primary.main" }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Commission
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rémunération sur ventes
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                          border: "1px solid rgba(102, 126, 234, 0.1)",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Mode
                        </Typography>
                        <Typography variant="body1" fontWeight={700} mt={0.5}>
                          {profil.commission?.mode === "fixe" ? "Montant fixe" : "Pourcentage"}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                          border: "1px solid rgba(102, 126, 234, 0.1)",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Valeur
                        </Typography>
                        <Typography 
                          variant="body1" 
                          fontWeight={700} 
                          mt={0.5}
                          sx={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          {commissionText}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                          border: "1px solid rgba(102, 126, 234, 0.1)",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Devise
                        </Typography>
                        <Typography variant="body1" fontWeight={700} mt={0.5}>
                          {profil.commission?.devise || "XOF"}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>

                <Divider sx={{ borderColor: "rgba(102, 126, 234, 0.1)" }} />

                <Box
                  sx={{
                    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                    p: 2.5,
                    borderBottom: "1px solid rgba(102, 126, 234, 0.1)",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)",
                      }}
                    >
                      <Badge sx={{ color: "primary.main" }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Pièce d'identité
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Informations documentaires
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                          border: "1px solid rgba(102, 126, 234, 0.1)",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Type
                        </Typography>
                        <Typography variant="body1" fontWeight={700} mt={0.5}>
                          {labelPiece(profil.pieceIdentite?.typePiece)}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                          border: "1px solid rgba(102, 126, 234, 0.1)",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Numéro
                        </Typography>
                        <Typography variant="body1" fontWeight={700} mt={0.5}>
                          {profil.pieceIdentite?.numero || "-"}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                          border: "1px solid rgba(102, 126, 234, 0.1)",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Délivrée le
                        </Typography>
                        <Typography variant="body1" fontWeight={700} mt={0.5}>
                          {profil.pieceIdentite?.dateDelivrance
                            ? new Date(profil.pieceIdentite.dateDelivrance).toLocaleDateString()
                            : "-"}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                          border: "1px solid rgba(102, 126, 234, 0.1)",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Expire le
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                          <Typography variant="body1" fontWeight={700}>
                            {profil.pieceIdentite?.dateExpiration
                              ? new Date(profil.pieceIdentite.dateExpiration).toLocaleDateString()
                              : "-"}
                          </Typography>
                          {pieceIsValid !== null && (
                            <Chip
                              size="small"
                              label={pieceIsValid ? "Valide" : "Expirée"}
                              sx={{
                                background: pieceIsValid
                                  ? "linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(56, 142, 60, 0.15) 100%)"
                                  : "linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(245, 124, 0, 0.15) 100%)",
                                color: pieceIsValid ? "#2e7d32" : "#e65100",
                                fontWeight: 600,
                                border: pieceIsValid
                                  ? "1px solid rgba(76, 175, 80, 0.3)"
                                  : "1px solid rgba(255, 152, 0, 0.3)",
                              }}
                            />
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                    {pieceHref && (
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          href={pieceHref}
                          target="_blank"
                          rel="noopener"
                          startIcon={<Description />}
                          sx={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 700,
                            px: 3,
                            "&:hover": {
                              background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                              boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
                              transform: "translateY(-2px)",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          Voir la pièce jointe
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Récap affectations (optionnel) */}
            <Grid item xs={12}>
              <Card 
                elevation={0} 
                sx={{ 
                  borderRadius: 3,
                  border: "1px solid rgba(102, 126, 234, 0.2)",
                  background: "white",
                  boxShadow: "0 8px 32px rgba(102, 126, 234, 0.15)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                    p: 2.5,
                    borderBottom: "1px solid rgba(102, 126, 234, 0.1)",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)",
                      }}
                    >
                      <Assignment sx={{ color: "primary.main" }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Affectations
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Récapitulatif
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                          border: "1px solid rgba(102, 126, 234, 0.1)",
                          textAlign: "center",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 24px rgba(102, 126, 234, 0.15)",
                          },
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Îlots
                        </Typography>
                        <Typography 
                          variant="h4" 
                          fontWeight={700}
                          sx={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            mt: 1,
                          }}
                        >
                          {profil.assignedIlots?.length ?? 0}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                          border: "1px solid rgba(102, 126, 234, 0.1)",
                          textAlign: "center",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 24px rgba(102, 126, 234, 0.15)",
                          },
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Parcelles
                        </Typography>
                        <Typography 
                          variant="h4" 
                          fontWeight={700}
                          sx={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            mt: 1,
                          }}
                        >
                          {profil.assignedParcelles?.length ?? 0}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        </Container>
      </Box>
    </PageLayout>
  );
};

export default MonProfil;
