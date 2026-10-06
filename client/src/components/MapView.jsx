import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import CITIES from '../cities';

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
});

export default function MapView({ origin, destination, stops = [], height = 300 }) {
  const pts = [origin, ...stops, destination].map(c => CITIES[c]).filter(Boolean);
  const center = pts[0] || [53.9, 27.56];
  return (
    <MapContainer center={center} zoom={6} style={{ height, width: '100%', borderRadius: 12 }}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="© CARTO" />
      {[origin, ...stops, destination].filter(c => CITIES[c]).map((c, i) => (
        <Marker key={i} position={CITIES[c]} icon={icon}><Popup>{c}</Popup></Marker>
      ))}
      {pts.length > 1 && <Polyline positions={pts} color="#FF0000" weight={3} />}
    </MapContainer>
  );
}
