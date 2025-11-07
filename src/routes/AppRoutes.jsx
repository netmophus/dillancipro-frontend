import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "../pages/home/HomePage";
import LoginPage from "../pages/shared/LoginPage";
import RegisterPage from "../pages/shared/RegisterPage";
import ProfilePage from "../pages/shared/ProfilePage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import UserDashboardPage from "../pages/user/UserDashboardPage";
import MesAchatsAgencePage from "../pages/user/MesAchatsAgencePage";
import BanqueDashboardPage from "../pages/banque/BanqueDashboardPage";
import AgenceDashboardPage from "../pages/agence/AgenceDashboardPage";
import MinistereDashboardPage from "../pages/ministere/MinistereDashboardPage";
import CommercialDashboardPage from "../pages/agence/commercial/CommercialDashboardPage";
import MesBiensCommercialPage from "../pages/agence/commercial/MesBiensCommercialPage";
import ProtectRoute from "./ProtectRoute";



// Pages de création géographique supprimées - gérées par l'admin
import CreateIlotPage from "../pages/agence/CreateIlotPage";
import CreateParcellePage from "../pages/agence/CreateParcellePage";
import CreateParcelleMultiplePage from "../pages/agence/CreateParcelleMultiplePage";
import EnrollerCommercialPage from "../pages/agence/EnrollerCommercialPage"; // ✅ Import du composant
import CreateBienPage from "../pages/agence/CreateBienPage";
import MesBiensPage from "../pages/agence/MesBiensPage";
import CreateLocationPage from "../pages/agence/CreateLocationPage";
import LocationsPage from "../pages/agence/LocationsPage";

import AffecterCommercialPage from "../pages/agence/AffecterCommercialPage";
import MesParcellesPage from "../pages/agence/MesParcellesPage";

import CommercialMapPage from "../pages/agence/CommercialMapPage";
import ParcellesNonVenduesPage from "../pages/agence/commercial/ParcellesNonVenduesPage";
import VenteParcellePage from "../pages/agence/commercial/VenteParcellePage";
import InscrireClientPage from "../pages/agence/commercial/InscrireClientPage";
import PaiementsPartielsPage from "../pages/agence/commercial/PaiementsPartielsPage";
import ClientDashboardPage from "../pages/agence/client/ClientDashboardPage";
import ParcellesVenduesPage from "../pages/agence/commercial/ParcellesVenduesPage";
import AdminUserManagementPage from "../pages/admin/AdminUserManagementPage";
import AdminAgenceManagementPage from "../pages/admin/AdminAgenceManagementPage";
import AdminLocationsPage from "../pages/admin/AdminLocationsPage";
import AdminCreateLocationPage from "../pages/admin/CreateLocationPage";
import AdminEditLocationPage from "../pages/admin/EditLocationPage";
import AdminGeographicPage from "../pages/admin/AdminGeographicPage";
import CommercialIlotsAffectationsPage from "../pages/agence/CommercialIlotsAffectationsPage";
import CommercialMesIlotsPage from "../pages/agence/commercial/CommercialMesIlotsPage";
import CommercialProfilPage from "../pages/agence/commercial/CommercialProfilPage";

import MonProfil from "../pages/agence/commercial/CommercialMonProfilPage";
import MonPatrimoinePage from "../pages/user/MonPatrimoinePage";
import CartePatrimoinePage from "../pages/user/CartePatrimoinePage";
import GestionAbonnementsPage from "../pages/admin/GestionAbonnementsPage";
import GestionTarifsPage from "../pages/admin/GestionTarifsPage";
import VerificationBiensPage from "../pages/admin/VerificationBiensPage";
import GestionVentesPage from "../pages/admin/GestionVentesPage";
import AdminNotaireManagementPage from "../pages/admin/AdminNotaireManagementPage";
import NotaireDashboardPage from "../pages/notaire/NotaireDashboardPage";
import MesVentesPage from "../pages/notaire/MesVentesPage";
import PaiementEnregistrementPage from "../pages/user/PaiementEnregistrementPage";
import MesVentesCommercialPage from "../pages/agence/commercial/MesVentesCommercialPage";
import MesVentesClientPage from "../pages/user/MesVentesClientPage";
import MesVentesAgencePage from "../pages/agence/MesVentesAgencePage";
import EcheanciersAgencePage from "../pages/agence/EcheanciersAgencePage";
import RenouvelerAbonnementPage from "../pages/user/RenouvelerAbonnementPage";
import SoumettreVentePage from "../pages/user/SoumettreVentePage";




const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* 🔓 Pages publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 🔒 Pages protégées */}
        <Route
          path="/profile"
          element={
            <ProtectRoute>
              <ProfilePage />
            </ProtectRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectRoute>
              <AdminDashboardPage />
            </ProtectRoute>
          }
        />

      

      <Route
        path="/admin/utilisateurs"
        element={
          <ProtectRoute allowedRoles={["Admin"]}>
            <AdminUserManagementPage />
          </ProtectRoute>
        }
      />


<Route
  path="/admin/geographic"
  element={
    <ProtectRoute allowedRoles={["Admin"]}>
      <AdminGeographicPage />
    </ProtectRoute>
  }
/>

<Route
  path="/admin/agences"
  element={
    <ProtectRoute>
      <AdminAgenceManagementPage />
    </ProtectRoute>
  }
/>

<Route
  path="/admin/gestion-abonnements"
  element={
    <ProtectRoute allowedRoles={["Admin"]}>
      <GestionAbonnementsPage />
    </ProtectRoute>
  }
/>

<Route
  path="/admin/gestion-tarifs"
  element={
    <ProtectRoute allowedRoles={["Admin"]}>
      <GestionTarifsPage />
    </ProtectRoute>
  }
/>

<Route
  path="/admin/verification-biens"
  element={
    <ProtectRoute allowedRoles={["Admin"]}>
      <VerificationBiensPage />
    </ProtectRoute>
  }
/>

<Route
  path="/admin/gestion-ventes"
  element={
    <ProtectRoute allowedRoles={["Admin"]}>
      <GestionVentesPage />
    </ProtectRoute>
  }
/>

        <Route
          path="/admin/notaires"
          element={
            <ProtectRoute allowedRoles={["Admin"]}>
              <AdminNotaireManagementPage />
            </ProtectRoute>
          }
        />

        {/* Routes Notaire */}
        <Route
          path="/notaire/dashboard"
          element={
            <ProtectRoute allowedRoles={["Notaire"]}>
              <NotaireDashboardPage />
            </ProtectRoute>
          }
        />
        <Route
          path="/notaire/ventes"
          element={
            <ProtectRoute allowedRoles={["Notaire"]}>
              <MesVentesPage />
            </ProtectRoute>
          }
        />

<Route
  path="/admin/locations"
  element={
    <ProtectRoute allowedRoles={["Admin"]}>
      <AdminLocationsPage />
    </ProtectRoute>
  }
/>

<Route
  path="/admin/locations/create"
  element={
    <ProtectRoute allowedRoles={["Admin"]}>
      <AdminCreateLocationPage />
    </ProtectRoute>
  }
/>

<Route
  path="/agence/locations/edit/:id"
  element={
    <ProtectRoute allowedRoles={["Admin", "Agence"]}>
      <AdminEditLocationPage />
    </ProtectRoute>
  }
/>


        <Route
          path="/user/dashboard"
          element={
            <ProtectRoute>
              <UserDashboardPage />
            </ProtectRoute>
          }
        />

        <Route
          path="/user/mes-achats-agence"
          element={
            <ProtectRoute>
              <MesAchatsAgencePage />
            </ProtectRoute>
          }
        />

        <Route
          path="/user/mon-patrimoine"
          element={
            <ProtectRoute allowedRoles={["User", "Client"]}>
              <MonPatrimoinePage />
            </ProtectRoute>
          }
        />

        <Route
          path="/user/carte-patrimoine"
          element={
            <ProtectRoute allowedRoles={["User", "Client"]}>
              <CartePatrimoinePage />
            </ProtectRoute>
          }
        />

        <Route
          path="/user/paiement-enregistrement/:id"
          element={
            <ProtectRoute allowedRoles={["User", "Client"]}>
              <PaiementEnregistrementPage />
            </ProtectRoute>
          }
        />

        <Route
          path="/user/renouveler-abonnement/:id"
          element={
            <ProtectRoute allowedRoles={["User", "Client"]}>
              <RenouvelerAbonnementPage />
            </ProtectRoute>
          }
        />

        <Route
          path="/user/soumettre-vente/:id"
          element={
            <ProtectRoute allowedRoles={["User", "Client"]}>
              <SoumettreVentePage />
            </ProtectRoute>
          }
        />

<Route
  path="/banque/dashboard"
  element={
    <ProtectRoute>
      <BanqueDashboardPage />
    </ProtectRoute>
  }
/>

<Route
  path="/agence/dashboard"
  element={
    <ProtectRoute>
      <AgenceDashboardPage />
    </ProtectRoute>
  }
/>

<Route
  path="/ministere/dashboard"
  element={
    <ProtectRoute>
      <MinistereDashboardPage />
    </ProtectRoute>
  }
/>




// Routes de création géographique supprimées - gérées par l'admin


<Route
  path="/agence/create-ilot"
  element={
    <ProtectRoute allowedRoles={["Agence"]}>
      <CreateIlotPage />
    </ProtectRoute>
  }
/>


<Route
  path="/agence/create-parcelle"
  element={
    <ProtectRoute allowedRoles={["Agence"]}>
      <CreateParcellePage />
    </ProtectRoute>
  }
/>

<Route
  path="/agence/create-parcelle-multiple"
  element={
    <ProtectRoute allowedRoles={["Agence"]}>
      <CreateParcelleMultiplePage />
    </ProtectRoute>
  }
/>

<Route
  path="/agence/create-bien"
  element={
    <ProtectRoute allowedRoles={["Agence"]}>
      <CreateBienPage />
    </ProtectRoute>
  }
/>

<Route
  path="/agence/mes-biens"
  element={
    <ProtectRoute allowedRoles={["Agence"]}>
      <MesBiensPage />
    </ProtectRoute>
  }
/>

<Route
  path="/agence/locations"
  element={
    <ProtectRoute allowedRoles={["Agence"]}>
      <LocationsPage />
    </ProtectRoute>
  }
/>

<Route
  path="/agence/locations/create"
  element={
    <ProtectRoute allowedRoles={["Agence"]}>
      <CreateLocationPage />
    </ProtectRoute>
  }
/>

<Route
  path="/agence/create-commercial"
  element={
    <ProtectRoute allowedRoles={["Agence"]}>
      <EnrollerCommercialPage />
    </ProtectRoute>
  }
/>

<Route
  path="/agence/enroller-commercial"
  element={
    <ProtectRoute allowedRoles={["Agence"]}>
      <EnrollerCommercialPage />
    </ProtectRoute>
  }
/>


<Route
  path="/agence/commerciaux/:id/profil"
  element={
    <ProtectRoute allowedRoles={["Agence"]}>
      <CommercialProfilPage />
    </ProtectRoute>
  }
/>



<Route
  path="/agence/affectations/ilots"
  element={
    <ProtectRoute allowedRoles={["Agence"]}>
      <CommercialIlotsAffectationsPage />
    </ProtectRoute>
  }
/>


<Route
  path="/agence/affecter-commercial/:id"
  element={
    <ProtectRoute allowedRoles={["Agence"]}>
      <AffecterCommercialPage />
    </ProtectRoute>
  }
/>

<Route
  path="/agence/commerciaux/:id/parcelles"
  element={
    <ProtectRoute allowedRoles={["Agence"]}>
      <MesParcellesPage />
    </ProtectRoute>
  }
/>


<Route
  path="/agence/carte-commercial/:id"
  element={
    <ProtectRoute allowedRoles={["Agence"]}>
      <CommercialMapPage />
    </ProtectRoute>
  }
/>


<Route
  path="/agence/commercial/dashboard"
  element={
    <ProtectRoute allowedRoles={["Commercial"]}>
      <CommercialDashboardPage />
    </ProtectRoute>
  }
/>


<Route
  path="/commercial/mon-profil"
  element={
    <ProtectRoute allowedRoles={["Commercial"]}>
      <MonProfil />
    </ProtectRoute>
  }
/>


<Route
  path="/commercial/parcelles-non-vendues"
  element={
    <ProtectRoute allowedRoles={["Commercial"]}>
      <ParcellesNonVenduesPage />
    </ProtectRoute>
  }
/>


<Route
  path="/commercial/vendre-parcelle/:parcelleId"
  element={
    <ProtectRoute allowedRoles={["Commercial"]}>
      <VenteParcellePage />
    </ProtectRoute>
  }
/>

<Route
  path="/commercial/inscrire-client"
  element={
    <ProtectRoute allowedRoles={["Commercial"]}>
      <InscrireClientPage />
    </ProtectRoute>
  }
/>


<Route
  path="/commercial/mes-ilots"
  element={
    <ProtectRoute allowedRoles={["Commercial"]}>
      <CommercialMesIlotsPage />
    </ProtectRoute>
  }
/>

<Route
  path="/commercial/mes-biens"
  element={
    <ProtectRoute allowedRoles={["Commercial"]}>
      <MesBiensCommercialPage />
    </ProtectRoute>
  }
/>

<Route
  path="/client/dashboard"
  element={
    <ProtectRoute allowedRoles={["User"]}>
      <ClientDashboardPage />
    </ProtectRoute>
  }
/>



<Route
  path="/commercial/parcelles-vendues"
  element={
    <ProtectRoute allowedRoles={["Commercial"]}>
      <ParcellesVenduesPage />
    </ProtectRoute>
  }
/>

<Route
  path="/commercial/paiements-partiels"
  element={
    <ProtectRoute allowedRoles={["Commercial"]}>
      <PaiementsPartielsPage />
    </ProtectRoute>
  }
/>

{/* Routes pour suivre les ventes avec le notaire */}
<Route
  path="/commercial/mes-ventes"
  element={
    <ProtectRoute allowedRoles={["Commercial"]}>
      <MesVentesCommercialPage />
    </ProtectRoute>
  }
/>

<Route
  path="/user/mes-ventes"
  element={
    <ProtectRoute allowedRoles={["User"]}>
      <MesVentesClientPage />
    </ProtectRoute>
  }
/>

        <Route
          path="/agence/mes-ventes"
          element={
            <ProtectRoute allowedRoles={["Agence", "Admin"]}>
              <MesVentesAgencePage />
            </ProtectRoute>
          }
        />
        <Route
          path="/agence/echeanciers"
          element={
            <ProtectRoute allowedRoles={["Agence", "Admin"]}>
              <EcheanciersAgencePage />
            </ProtectRoute>
          }
        />

      </Routes>
    </Router>
  );
};

export default AppRoutes;
