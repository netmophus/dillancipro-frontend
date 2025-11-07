import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapComponent = () => {
  const position = [13.5127, 2.1123]; // Niamey, Niger

  return (
    <MapContainer center={position} zoom={12} style={{ height: "100vh", width: "100%" }}>
      <TileLayer
        url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`}
      />
      <Marker position={position}>
        <Popup>Bienvenue à Niamey !</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;
