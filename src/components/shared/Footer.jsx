import React from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import {
  Phone,
  Email,
  LocationOn,
  ChevronRight,
  HomeWork,
  AccountBalance,
  Balance,
  Groups,
  SupportAgentOutlined,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  SendOutlined,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import LogoDillanci from "./LogoDillanci";
import { CONTACT, SOCIAL_LINKS } from "../../config/contact";

const BG = "#003D30";
const BG_DARK = "#002E25";
const LIME = "#84CC16";
const LIGHT_GREEN = "#A3E635";
const TEXT = "#E2E8E5";
const LINE = "rgba(255,255,255,0.15)";
const FONT = '"Manrope", "Plus Jakarta Sans", "DM Sans", system-ui, Arial, sans-serif';

const SOCIALS = [
  { key: "facebook", label: "Facebook", Icon: Facebook, color: "#1877F2" },
  { key: "twitter", label: "Twitter", Icon: Twitter, color: "#1DA1F2" },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedIn, color: "#0A66C2" },
  { key: "instagram", label: "Instagram", Icon: Instagram, color: "#E4405F" },
];

// Uniquement des routes existantes
const USEFUL_LINKS = [
  { label: "Accueil", to: "/" },
  { label: "Parcelles à vendre", to: "/parcelles" },
  { label: "Locations", to: "/locations" },
  { label: "Biens à vendre", to: "/biens" },
  { label: "Contact", href: `mailto:${CONTACT.email}` },
];

// Les inscriptions de tous les profils passent par la page d'inscription existante
const PROFILES = [
  { label: "Agences immobilières", Icon: HomeWork },
  { label: "Banques partenaires", Icon: AccountBalance },
  { label: "Notaires et services compétents", Icon: Balance },
  { label: "Particuliers et clients", Icon: Groups },
];

const linkSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: 1,
  color: TEXT,
  fontFamily: FONT,
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 1.7,
  textDecoration: "none",
  transition: "color 0.2s ease, transform 0.2s ease",
  "&:hover": { color: "#fff", transform: "translateX(3px)" },
};

const ColumnTitle = ({ children }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography sx={{ fontFamily: FONT, fontSize: 21, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
      {children}
    </Typography>
    <Box sx={{ width: 36, height: 3, borderRadius: "2px", bgcolor: LIME, mt: 1 }} />
  </Box>
);

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <Box component="footer" sx={{ position: "relative", bgcolor: BG, color: TEXT, overflow: "hidden", fontFamily: FONT }}>
      {/* Courbes décoratives : coin supérieur gauche et inférieur droit */}
      <Box
        component="svg"
        viewBox="0 0 200 200"
        aria-hidden="true"
        sx={{ display: { xs: "none", md: "block" }, position: "absolute", top: 0, left: 0, width: 170, height: 170, pointerEvents: "none" }}
      >
        <path d="M0 0 H200 C 120 10, 40 70, 0 200 Z" fill={LIME} fillOpacity="0.55" />
        <path d="M0 0 H120 C 75 10, 28 48, 0 120 Z" fill={LIME} fillOpacity="0.5" />
      </Box>
      <Box
        component="svg"
        viewBox="0 0 300 220"
        aria-hidden="true"
        sx={{ display: { xs: "none", md: "block" }, position: "absolute", right: 0, bottom: 56, width: 280, height: 200, pointerEvents: "none" }}
      >
        <path d="M300 0 C 290 110, 180 210, 40 220 H300 Z" fill={LIME} fillOpacity="0.14" />
      </Box>

      {/* Silhouette discrète de Niamey (immeubles, habitations, végétation) */}
      <Box
        component="svg"
        viewBox="0 0 1200 90"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        sx={{ display: { xs: "none", md: "block" }, position: "absolute", left: 0, right: 0, bottom: 56, width: "100%", height: 90, pointerEvents: "none", opacity: 0.12 }}
      >
        <g fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
          <path d="M0 90 V66 H30 V50 H58 V66 H80 V90 M110 90 V44 L130 26 L150 44 V90 M170 90 V58 H214 V90" />
          <path d="M240 90 V30 H262 V90 M246 30 V18 H256 V30 M280 90 V50 H318 V90 M296 50 V38 H304 V50" />
          <path d="M340 90 V66 C 350 52, 372 52, 382 66 V90 M392 90 V40 L408 22 L424 40 V90" />
          <path d="M450 90 V34 H488 V90 M458 34 V22 H480 V34 M458 46 H480 M458 58 H480 M458 70 H480" />
          <path d="M510 90 V62 H552 V90 M560 90 V48 C 572 28, 600 28, 612 48 V90" />
          <path d="M640 90 V26 H670 V90 M646 26 V14 H664 V26 M646 40 H664 M646 54 H664 M646 68 H664" />
          <path d="M690 90 V60 H730 V90 M742 90 V44 L760 28 L778 44 V90" />
          <path d="M800 90 V54 H842 V90 M852 90 V36 H882 V90 M858 36 V26 H876 V36" />
          <path d="M900 90 V64 C 910 50, 930 50, 940 64 V90 M950 90 V30 H984 V90 M956 44 H978 M956 58 H978 M956 72 H978" />
          <path d="M1000 90 V58 H1040 V90 M1052 90 V42 L1070 26 L1088 42 V90 M1100 90 V66 H1140 V90" />
          {/* Palmiers */}
          <path d="M1160 90 V62 M1160 62 C 1146 56, 1140 62, 1136 68 M1160 62 C 1174 56, 1180 62, 1184 68 M1160 62 C 1156 50, 1164 48, 1168 52" />
          <path d="M100 90 V72 M100 72 C 92 68, 88 72, 86 76 M100 72 C 108 68, 112 72, 114 76" />
        </g>
      </Box>

      <Box sx={{ position: "relative", zIndex: 1, boxSizing: "border-box", maxWidth: 1440, mx: "auto", px: { xs: 2.5, sm: 4, md: 5 }, pt: "50px", pb: 5 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "1.25fr 1fr 1.15fr 1fr 1.2fr" },
            columnGap: { sm: 4, lg: 0 },
            rowGap: 5,
          }}
        >
          {/* 1. Présentation */}
          <Box sx={{ pr: { lg: 4 } }}>
            <LogoDillanci color="#fff" subtitle="La plateforme immobilière du Niger" />
            <Typography sx={{ fontFamily: FONT, fontSize: 15, lineHeight: 1.7, color: TEXT, mt: 2.5, mb: 3, maxWidth: 300 }}>
              Achetez, vendez, louez et valorisez vos biens immobiliers en toute confiance.
            </Typography>
            <Box sx={{ display: "flex", gap: "12px" }}>
              {SOCIALS.map(({ key, label, Icon, color }) => {
                const href = SOCIAL_LINKS[key];
                const linkProps = href ? { component: "a", href, target: "_blank", rel: "noopener noreferrer" } : {};
                return (
                  <IconButton
                    key={key}
                    aria-label={label}
                    {...linkProps}
                    sx={{
                      width: 40,
                      height: 40,
                      p: 0,
                      bgcolor: "#fff",
                      color,
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": { bgcolor: "#fff", transform: "translateY(-3px)", boxShadow: "0 6px 14px rgba(0,0,0,0.3)" },
                    }}
                  >
                    <Icon sx={{ fontSize: 23 }} />
                  </IconButton>
                );
              })}
            </Box>
          </Box>

          {/* 2. Liens utiles */}
          <Box sx={{ borderLeft: { lg: `1px solid ${LINE}` }, pl: { lg: 4 }, pr: { lg: 2 } }}>
            <ColumnTitle>Liens utiles</ColumnTitle>
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
              {USEFUL_LINKS.map((l) => (
                <Box component="li" key={l.label}>
                  <Box component={l.to ? Link : "a"} {...(l.to ? { to: l.to } : { href: l.href })} sx={linkSx}>
                    <ChevronRight sx={{ fontSize: 20, color: LIGHT_GREEN, ml: -0.5 }} />
                    {l.label}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* 3. Profils */}
          <Box sx={{ borderLeft: { lg: `1px solid ${LINE}` }, pl: { lg: 4 }, pr: { lg: 2 } }}>
            <ColumnTitle>Profils</ColumnTitle>
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
              {PROFILES.map(({ label, Icon }) => (
                <Box component="li" key={label} sx={{ mb: 0.5 }}>
                  <Box component={Link} to="/register" sx={linkSx}>
                    <Icon sx={{ fontSize: 22, color: "#fff" }} />
                    {label}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* 4. Assistance */}
          <Box sx={{ borderLeft: { lg: `1px solid ${LINE}` }, pl: { lg: 4 }, pr: { lg: 2 } }}>
            <ColumnTitle>Assistance</ColumnTitle>
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
              <Box component="li">
                <Box component="a" href={`mailto:${CONTACT.email}`} sx={linkSx}>
                  <SupportAgentOutlined sx={{ fontSize: 22, color: LIGHT_GREEN }} />
                  Support
                </Box>
              </Box>
              <Box component="li">
                <Box component="a" href={`tel:${CONTACT.telephoneHref}`} sx={linkSx}>
                  <Phone sx={{ fontSize: 20, color: LIGHT_GREEN }} />
                  Nous appeler
                </Box>
              </Box>
            </Box>
          </Box>

          {/* 5. Contactez-nous */}
          <Box sx={{ borderLeft: { lg: `1px solid ${LINE}` }, pl: { lg: 4 } }}>
            <ColumnTitle>Contactez-nous</ColumnTitle>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
              {[
                { Icon: LocationOn, text: CONTACT.ville },
                { Icon: Phone, text: CONTACT.telephone, href: `tel:${CONTACT.telephoneHref}` },
                { Icon: Email, text: CONTACT.email, href: `mailto:${CONTACT.email}` },
              ].map(({ Icon, text, href }) => (
                <Box
                  key={text}
                  component={href ? "a" : "div"}
                  {...(href ? { href } : {})}
                  sx={{ display: "flex", alignItems: "center", gap: 1.5, color: TEXT, textDecoration: "none", fontFamily: FONT, fontSize: 15, fontWeight: 500, wordBreak: "break-word", "&:hover": href ? { color: "#fff" } : undefined }}
                >
                  <Icon sx={{ fontSize: 28, color: LIGHT_GREEN, flexShrink: 0 }} />
                  {text}
                </Box>
              ))}
            </Box>
            <Button
              component="a"
              href={`mailto:${CONTACT.email}`}
              startIcon={<SendOutlined />}
              sx={{
                mt: 3,
                height: 44,
                px: 2.5,
                borderRadius: "12px",
                border: `2px solid ${LIME}`,
                color: "#fff",
                fontFamily: FONT,
                fontWeight: 600,
                fontSize: 15,
                textTransform: "none",
                "&:hover": { bgcolor: "rgba(132,204,22,0.16)", border: `2px solid ${LIME}` },
              }}
            >
              Nous écrire
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Barre inférieure */}
      <Box sx={{ position: "relative", zIndex: 1, bgcolor: BG_DARK, borderTop: `2px solid ${LIME}` }}>
        <Box
          sx={{
            boxSizing: "border-box",
            maxWidth: 1440,
            mx: "auto",
            px: { xs: 2.5, sm: 4, md: 5 },
            py: 2,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography sx={{ fontFamily: FONT, fontSize: 14, color: TEXT }}>
            © {year} Dillanci. Tous droits réservés.
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "center", gap: 1.25, fontFamily: FONT, fontSize: 14, color: TEXT }}>
            {["Immobilier", "Confiance", "Sécurité", "Opportunités"].map((w, i) => (
              <React.Fragment key={w}>
                {i > 0 && <Box aria-hidden="true" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: LIME }} />}
                <span>{w}</span>
              </React.Fragment>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
