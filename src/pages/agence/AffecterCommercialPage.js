import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Checkbox,
  Button,
  Card,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Alert,
  TextField,
  MenuItem,
} from "@mui/material";
import { ArrowBack, CheckCircle, AssignmentInd } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AgencePageHeader from "../../components/agence/AgencePageHeader";

import api from "../../services/api"; // remplace axios + BASE_URL

const AffecterCommercialPage = () => {
  const { id } = useParams(); // ID du commercial
  const navigate = useNavigate();


  const [parcelles, setParcelles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");


  const [ilots, setIlots] = useState([]);
const [ilotSelected, setIlotSelected] = useState("");


const fetchIlots = async () => {
    try {
      const res = await api.get("/agence/ilots");
      setIlots(res.data);
    } catch (err) {
      setError("Erreur de chargement des îlots");
    }
  };

  
  useEffect(() => {
    fetchIlots(); // ajoute ceci
  }, []);
  


  const fetchParcelles = async (ilotId) => {
    try {
      const res = await api.get("/agence/parcelles");
      const filtered = res.data.filter(
        (p) => p.statut === "avendre" && p.ilot?._id === ilotId
      );
      setParcelles(filtered);
    } catch (err) {
      setError("Erreur de chargement des parcelles");
    }
  };
  
  useEffect(() => {
    if (ilotSelected) {
      fetchParcelles(ilotSelected);
    }
  }, [ilotSelected]);
  


  const handleSelect = (idParcelle) => {
    setSelected((prev) =>
      prev.includes(idParcelle)
        ? prev.filter((p) => p !== idParcelle)
        : [...prev, idParcelle]
    );
  };

  const handleAffecter = async () => {
    try {
        await api.put(`/agence/commerciaux/${id}/affecter`, {
        parcelles: selected,
      });
      setSuccess("Parcelles affectées avec succès !");
      setSelected([]);
      fetchParcelles();
    } catch (err) {
      setError("Erreur lors de l'affectation");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <AgencePageHeader
        icon={AssignmentInd}
        title="Affecter des parcelles au commercial"
        subtitle="Sélectionnez un îlot, cochez les parcelles puis affectez"
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/agence/create-commercial")}
            sx={{ borderColor: "rgba(255,255,255,0.6)", color: "white" }}
          >
            Retour
          </Button>
        }
      />

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        select
        label="Îlot"
        value={ilotSelected}
        onChange={(e) => setIlotSelected(e.target.value)}
        fullWidth
        SelectProps={{ displayEmpty: true }}
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
      >
        <MenuItem value="" disabled>
          Sélectionnez un îlot
        </MenuItem>
        {ilots.map((ilot) => (
          <MenuItem key={ilot._id} value={ilot._id}>
            {ilot.numeroIlot}
          </MenuItem>
        ))}
      </TextField>

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
                <TableCell padding="checkbox" />
                <TableCell>Numéro</TableCell>
                <TableCell>Îlot</TableCell>
                <TableCell>Superficie</TableCell>
                <TableCell>Prix</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parcelles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    {ilotSelected
                      ? "Aucune parcelle à vendre dans cet îlot"
                      : "Sélectionnez un îlot pour afficher ses parcelles"}
                  </TableCell>
                </TableRow>
              ) : (
                parcelles.map((p) => (
                  <TableRow key={p._id} hover selected={selected.includes(p._id)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(p._id)}
                        onChange={() => handleSelect(p._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{p.numeroParcelle}</Typography>
                    </TableCell>
                    <TableCell>{p.ilot?.numeroIlot || "-"}</TableCell>
                    <TableCell>{p.superficie ? `${p.superficie} m²` : "-"}</TableCell>
                    <TableCell>
                      {p.prix ? new Intl.NumberFormat("fr-FR").format(p.prix) + " FCFA" : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Button
          variant="contained"
          onClick={handleAffecter}
          startIcon={<CheckCircle />}
          disabled={selected.length === 0}
          sx={{ minWidth: 220, py: 1.2, fontWeight: "bold" }}
        >
          {selected.length > 0 ? `Affecter (${selected.length})` : "Affecter les parcelles"}
        </Button>
      </Box>
    </Container>
  );
};

export default AffecterCommercialPage;
