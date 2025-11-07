import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Checkbox,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  TextField, 
  MenuItem,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import api from "../../services/api"; // ✅ remplace axios + BASE_URL

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
    fetchIlots(); // 👈 ajoute ceci
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
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        🧩 Affecter des parcelles au commercial
      </Typography>

      {success && <Alert severity="success">{success}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}


      <TextField
            select
            label="Sélectionner un îlot"
            value={ilotSelected}
            onChange={(e) => setIlotSelected(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
            >
            {ilots.map((ilot) => (
                <MenuItem key={ilot._id} value={ilot._id}>
                {ilot.numeroIlot}
                </MenuItem>
            ))}
            </TextField>

      <Paper sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Numéro</TableCell>
              <TableCell>Îlot</TableCell>
              <TableCell>Superficie</TableCell>
              <TableCell>Prix</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parcelles.map((p) => (
              <TableRow key={p._id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.includes(p._id)}
                    onChange={() => handleSelect(p._id)}
                  />
                </TableCell>
                <TableCell>{p.numeroParcelle}</TableCell>
                <TableCell>{p.ilot?.numeroIlot || "-"}</TableCell>
                <TableCell>{p.superficie}</TableCell>
                <TableCell>{p.prix}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Button
        variant="outlined"
        color="secondary"
        sx={{ mt: 2, ml: 2, mr:3 }}
        onClick={() => navigate("/agence/create-commercial")} // 🔁 Redirection ici
        >
        ⬅️ Retour creation commercial
        </Button>


      <Button
        variant="contained"
        onClick={handleAffecter}
        sx={{ mt: 3 }}
        disabled={selected.length === 0}
      >
        ✅ Affecter les parcelles sélectionnées
      </Button>
    </Container>
  );
};

export default AffecterCommercialPage;
