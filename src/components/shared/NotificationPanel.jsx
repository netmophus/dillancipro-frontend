import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Avatar,
  Badge,
  Tooltip,
  Button,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  Notifications,
  Close,
  Home,
  Business,
  AttachMoney,
  LocationOn,
  CheckCircle,
  Schedule,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../../api";

const NotificationPanel = ({ open, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/agence/notifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "AFFECTATION_PARCELLE":
        return <Home color="primary" />;
      case "AFFECTATION_BIEN":
        return <Business color="success" />;
      case "VENTE":
        return <AttachMoney color="warning" />;
      default:
        return <Notifications color="action" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "AFFECTATION_PARCELLE":
        return "primary";
      case "AFFECTATION_BIEN":
        return "success";
      case "VENTE":
        return "warning";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "À l'instant";
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return "Hier";
    return date.toLocaleDateString("fr-FR");
  };

  const handleNotificationClick = (notification) => {
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 400, maxWidth: "90vw" },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            🔔 Notifications
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Typography color="text.secondary" textAlign="center" py={4}>
            Chargement...
          </Typography>
        ) : notifications.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Notifications sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <Typography color="text.secondary">
              Aucune notification
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                <ListItem
                  sx={{
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                    borderRadius: 1,
                    mb: 1,
                  }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor: `${getNotificationColor(notification.type)}.light`,
                        width: 40,
                        height: 40,
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.type.replace("_", " ")}
                          size="small"
                          color={getNotificationColor(notification.type)}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            whiteSpace: "pre-line",
                            mb: 1,
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Schedule sx={{ fontSize: 14 }} color="action" />
                          <Typography variant="caption" color="text.disabled">
                            {formatDate(notification.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {notifications.length > 0 && (
          <Box mt={2} textAlign="center">
            <Button
              variant="outlined"
              size="small"
              onClick={fetchNotifications}
              disabled={loading}
            >
              Actualiser
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default NotificationPanel;
