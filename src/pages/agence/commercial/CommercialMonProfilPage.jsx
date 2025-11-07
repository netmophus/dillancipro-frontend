import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Typography,
  Divider,
  Chip,
  Skeleton,
  Button,
} from "@mui/material";
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={800}>Mon profil</Typography>
          <Typography variant="body1" color="text.secondary">
            Informations personnelles et paramètres de commission
          </Typography>
        </Box>

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
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Aucun profil trouvé</Typography>
              <Typography color="text.secondary">
                Votre profil n’est pas encore complété. Merci de le renseigner auprès de l’agence.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {/* Carte identité + photo */}
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={photoSrc}
                      sx={{ width: 84, height: 84, fontSize: 28 }}
                      alt={profil.fullName || user?.fullName || "Photo"}
                    >
                      {(profil.fullName || user?.fullName || "U").slice(0, 1).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {profil.fullName || user?.fullName || "Nom non renseigné"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.phone || "-"}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          color={profil.commission?.actif ? "success" : "default"}
                          label={profil.commission?.actif ? "Commission active" : "Commission inactive"}
                        />
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" gutterBottom>Adresse</Typography>
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
                </CardContent>
              </Card>
            </Grid>

            {/* Détails commission + pièce d'identité */}
            <Grid item xs={12} md={8}>
              <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 3 }}>
                <CardHeader title="Commission" subheader="Rémunération sur ventes" />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">Mode</Typography>
                      <Typography variant="body1">
                        {profil.commission?.mode === "fixe" ? "Montant fixe" : "Pourcentage"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">Valeur</Typography>
                      <Typography variant="body1">{commissionText}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">Devise</Typography>
                      <Typography variant="body1">{profil.commission?.devise || "XOF"}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>

                <Divider />

                <CardHeader title="Pièce d’identité" subheader="Informations documentaires" />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Type</Typography>
                      <Typography variant="body1">{labelPiece(profil.pieceIdentite?.typePiece)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Numéro</Typography>
                      <Typography variant="body1">{profil.pieceIdentite?.numero || "-"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Délivrée le</Typography>
                      <Typography variant="body1">
                        {profil.pieceIdentite?.dateDelivrance
                          ? new Date(profil.pieceIdentite.dateDelivrance).toLocaleDateString()
                          : "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">Expire le</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body1">
                          {profil.pieceIdentite?.dateExpiration
                            ? new Date(profil.pieceIdentite.dateExpiration).toLocaleDateString()
                            : "-"}
                        </Typography>
                        {pieceIsValid !== null && (
                          <Chip
                            size="small"
                            color={pieceIsValid ? "success" : "warning"}
                            label={pieceIsValid ? "Valide" : "Expirée"}
                          />
                        )}
                      </Box>
                    </Grid>
                   {pieceHref && (
  <Grid item xs={12}>
    <Button
      variant="outlined"
      href={pieceHref}    // ✅ utilise l'URL telle quelle si Cloudinary
      target="_blank"
      rel="noopener"
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
              <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 3 }}>
                <CardHeader title="Affectations" subheader="Récapitulatif" />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Îlots</Typography>
                      <Typography variant="h6">{profil.assignedIlots?.length ?? 0}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Parcelles</Typography>
                      <Typography variant="h6">{profil.assignedParcelles?.length ?? 0}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </PageLayout>
  );
};

export default MonProfil;
