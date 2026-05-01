import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

const API = 'https://lototrack-backend.onrender.com';
const socket = io(API);

const carIcon = L.divIcon({ html: '🚗', className: 'emoji-icon', iconSize: [30, 30] });
const stolenIcon = L.divIcon({ html: '🚨', className: 'emoji-icon', iconSize: [30, 30] });
const policeIcon = L.divIcon({ html: '🚔', className: 'emoji-icon', iconSize: [30, 30] });
const ambulanceIcon = L.divIcon({ html: '🚑', className: 'emoji-icon', iconSize: [30, 30] });

function LiveMap() {
  const [vehicles, setVehicles] = useState({});
  const [policeTrail, setPoliceTrail] = useState([]);
  const [ambulanceTrail, setAmbulanceTrail] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('connect', () => socket.emit('get_positions'));
    socket.on('all_positions', (data) => setVehicles(data));
    socket.on('position_updated', (data) => {
      setVehicles(prev => ({ ...prev, [data.id]: data }));
    });
    socket.on('police_updated', (data) => {
      setPoliceTrail(prev => [...prev.slice(-20), [data.latitude, data.longitude]]);
    });
    socket.on('ambulance_updated', (data) => {
      setAmbulanceTrail(prev => [...prev.slice(-20), [data.latitude, data.longitude]]);
    });
    return () => socket.off();
  }, []);

  const simulatePolice = () => {
    let lat = 5.3599517 + (Math.random() - 0.5) * 0.05;
    let lng = -4.0082563 + (Math.random() - 0.5) * 0.05;
    const interval = setInterval(() => {
      lat += (Math.random() - 0.5) * 0.003;
      lng += (Math.random() - 0.5) * 0.003;
      socket.emit('police_position', { latitude: lat, longitude: lng });
    }, 2000);
    setTimeout(() => clearInterval(interval), 60000);
  };

  const simulateAmbulance = () => {
    let lat = 5.3599517 + (Math.random() - 0.5) * 0.05;
    let lng = -4.0082563 + (Math.random() - 0.5) * 0.05;
    const interval = setInterval(() => {
      lat += (Math.random() - 0.5) * 0.003;
      lng += (Math.random() - 0.5) * 0.003;
      socket.emit('ambulance_position', { latitude: lat, longitude: lng });
    }, 2000);
    setTimeout(() => clearInterval(interval), 60000);
  };

  const center = [5.3599517, -4.0082563];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📡 LotoTrack — Live</h1>
        <div style={styles.headerBtns}>
          <button style={styles.btnPolice} onClick={simulatePolice}>🚔 Simuler Police</button>
          <button style={styles.btnAmbulance} onClick={simulateAmbulance}>🚑 Simuler Ambulance</button>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
        </div>
      </div>

      <div style={styles.legend}>
        <span style={styles.legendItem}>🚗 Véhicule actif</span>
        <span style={styles.legendItem}>🚨 Véhicule volé</span>
        <span style={styles.legendItem}>🚔 Police</span>
        <span style={styles.legendItem}>🚑 Ambulance</span>
      </div>

      <MapContainer center={center} zoom={13} style={styles.map}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {Object.values(vehicles).map(v => v.latitude && (
          <Marker
            key={v.id}
            position={[v.latitude, v.longitude]}
            icon={v.statut === 'vole' ? stolenIcon : carIcon}
          >
            <Popup>
              <strong>{v.immatriculation}</strong><br />
              Statut : {v.statut}<br />
              Mis à jour : {new Date(v.timestamp).toLocaleTimeString()}
            </Popup>
          </Marker>
        ))}

        {policeTrail.length > 1 && (
          <Polyline positions={policeTrail} color="blue" weight={3} dashArray="10,5" />
        )}
        {policeTrail.length > 0 && (
          <Marker position={policeTrail[policeTrail.length - 1]} icon={policeIcon}>
            <Popup>🚔 Police en intervention</Popup>
          </Marker>
        )}

        {ambulanceTrail.length > 1 && (
          <Polyline positions={ambulanceTrail} color="red" weight={3} dashArray="10,5" />
        )}
        {ambulanceTrail.length > 0 && (
          <Marker position={ambulanceTrail[ambulanceTrail.length - 1]} icon={ambulanceIcon}>
            <Popup>🚑 Ambulance en route</Popup>
          </Marker>
        )}
      </MapContainer>

      <div style={styles.info}>
        <div style={styles.infoCard}>
          <span style={styles.infoNumber}>{Object.keys(vehicles).length}</span>
          <span style={styles.infoLabel}>Véhicules trackés</span>
        </div>
        <div style={styles.infoCard}>
          <span style={styles.infoNumber}>{policeTrail.length > 0 ? 1 : 0}</span>
          <span style={styles.infoLabel}>Policiers actifs</span>
        </div>
        <div style={styles.infoCard}>
          <span style={styles.infoNumber}>{ambulanceTrail.length > 0 ? 1 : 0}</span>
          <span style={styles.infoLabel}>Ambulances actives</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { height: '100vh', backgroundColor: '#1a1a2e', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', backgroundColor: '#16213e' },
  title: { color: '#e94560', margin: 0, fontSize: '20px' },
  headerBtns: { display: 'flex', gap: '12px' },
  backBtn: { padding: '8px 16px', backgroundColor: '#0f3460', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  btnPolice: { padding: '8px 16px', backgroundColor: '#1565c0', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  btnAmbulance: { padding: '8px 16px', backgroundColor: '#c62828', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  legend: { display: 'flex', gap: '16px', padding: '8px 32px', backgroundColor: '#16213e', borderTop: '1px solid #0f3460', flexWrap: 'wrap' },
  legendItem: { color: '#aaa', fontSize: '13px' },
  map: { flex: 1 },
  info: { display: 'flex', gap: '16px', padding: '12px 32px', backgroundColor: '#16213e', borderTop: '1px solid #0f3460' },
  infoCard: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  infoNumber: { color: '#e94560', fontSize: '24px', fontWeight: 'bold' },
  infoLabel: { color: '#aaa', fontSize: '12px' },
};

export default LiveMap;