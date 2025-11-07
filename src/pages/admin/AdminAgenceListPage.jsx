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
  Switch,
  IconButton,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import API from "../../api";

const AdminAgenceListPage = () => {
  const [agences, setAgences] = useState([]);

  const fetchAgences = async () => {
    try {
      const res = await API.get("/admin/agences");
      setAgences(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des agences :", err);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "actif" ? "suspendu" : "actif";
      await API.patch(`/admin/agences/${id}/statut`, { statut: newStatus });
      fetchAgences();
    } catch (err) {
      console.error("Erreur lors du changement de statut :", err);
    }
  };

  useEffect(() => {
    fetchAgences();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Liste des agences immobilières
      </Typography>

      <Paper elevation={3} sx={{ mt: 4, borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Ville</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agences.map((agence) => (
              <TableRow key={agence._id}>
                <TableCell>{agence.nom}</TableCell>
                <TableCell>{agence.ville}</TableCell>
                <TableCell>{agence.telephone}</TableCell>
                <TableCell>{agence.email}</TableCell>
                <TableCell>{agence.statut}</TableCell>
                <TableCell align="center">
                  <Switch
                    checked={agence.statut === "actif"}
                    onChange={() => toggleStatus(agence._id, agence.statut)}
                    color="primary"
                  />
                  <IconButton color="primary">
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default AdminAgenceListPage;
