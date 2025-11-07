// components/admin/LinkAdminToAgenceModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import API from "../../api";

const LinkAdminToAgenceModal = ({ open, onClose, agenceId, onSuccess }) => {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await API.get("/admin/users?role=Agence");
        setAdmins(res.data.users || []);
      } catch (err) {
        console.error("Erreur lors du chargement des administrateurs :", err);
      }
    };

    if (open) fetchAdmins();
  }, [open]);

  const handleLink = async () => {
    try {
      setLoading(true);
      await API.post(`/admin/agence/${agenceId}/link-admin`, {
        adminId: selectedAdmin,
      });
      onSuccess(); // pour recharger la liste si besoin
      onClose();
    } catch (err) {
      console.error("Erreur lors de la liaison :", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Lier un admin à l'agence</DialogTitle>
      <DialogContent>
        <FormControl fullWidth>
          <InputLabel>Administrateur</InputLabel>
          <Select
            value={selectedAdmin}
            onChange={(e) => setSelectedAdmin(e.target.value)}
            label="Administrateur"
          >
            {admins.map((admin) => (
              <MenuItem key={admin._id} value={admin._id}>
                {admin.fullName || "Sans nom"} ({admin.phone}) — {admin.role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleLink} disabled={loading || !selectedAdmin}>
          {loading ? <CircularProgress size={24} /> : "Lier"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LinkAdminToAgenceModal;
