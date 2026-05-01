import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

const API = 'https://lototrack-backend.onrender.com';

// Icônes personnalisées
const carIcon = L.divIcon({ html: '🚗', className: 'emoji-icon', iconSize: [30, 30] });
const stolenIcon = L.divIcon({ html: '🚨', className: 'emoji-icon', iconSize: [30, 30] });
const policeIcon = L.divIcon({ html: '🚔', className: 'emoji-icon', iconSize: [30, 30] });
const ambulanceIcon = L.divIcon({ html: '🚑', className: 'emoji-icon', iconSize: [30, 30] });

function LiveMap() {
  const [vehicles, setVehicles] = useState({});
  const [police, setPolice] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const s = io(API);
    setSocket(s);

    s.on('connect', () => {
      console.log('✅ Connecté au serveur temps réel');
      s.emit('get_positions');
    });

    s.on('all_positions', (data) => setVehicles(data));
    s.on('position_updated', (data) => {
      setVehicles(prev => ({ ...prev, [data.id]: data }));
    });
    s.on('police_updated', (data) => {
      setPolice(prev => [...prev.slice(-10), data]);
    });
    s.on('ambulance_updated', (data) => {
      setAmbulances(prev => [...prev.slice(-10), data]);
    });

    return () => s.disconnect();
  }, []);

  const center = [5.3599517, -4.0082563];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📡 LotoTrack — Suivi en temps réel</h1>
        <div style={styles.headerBtns}>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
        </div>
      </div>

      <div style={styles.legend}>
        <span style={styles.legendItem}>🚗 Véhicule actif</span>
        <span style={styles.legendItem}>🚨 Véhicule volé</span>
        <span style={styles.legendItem}>🚔 Police</span>
        <span style={styles.legendItem}>🚑 Ambulance</span>
        <span style={styles.legendItem}>— Trajectoire police</span>
        <span style={styles.legendItem}>— Trajectoire ambulance</span>
      </div>

      <MapContainer center={center} zoom={13} style={styles.map}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Véhicules */}
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

        {/* Trajectoire police */}
        {police.length > 1 && (
          <Polyline
            positions={police.map(p => [p.latitude, p.longitude])}
            color="blue"
            weight={3}
            dashArray="10,5"
          />
        )}
        {police.length > 0 && (
          <Marker position={[police[police.length-1].latitude, police[police.length-1].longitude]} icon={policeIcon}>
            <Popup>🚔 Police en intervention</Popup>
          </Marker>
        )}

        {/* Trajectoire ambulance */}
        {ambulances.length > 1 && (
          <Polyline
            positions={ambulances.map(a => [a.latitude, a.longitude])}
            color="red"
            weight={3}
            dashArray="10,5"
          />
        )}
        {ambulances.length > 0 && (
          <Marker position={[ambulances[ambulances.length-1].latitude, ambulances[ambulances.length-1].longitude]} icon={ambulanceIcon}>
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
          <span style={styles.infoNumber}>{police.length > 0 ? 1 : 0}</span>
          <span style={styles.infoLabel}>Policiers actifs</span>
        </div>
        <div style={styles.infoCard}>
          <span style={styles.infoNumber}>{ambulances.length > 0 ? 1 : 0}</span>
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
  legend: { display: 'flex', gap: '16px', padding: '8px 32px', backgroundColor: '#16213e', borderTop: '1px solid #0f3460', flexWrap: 'wrap' },
  legendItem: { color: '#aaa', fontSize: '13px' },
  map: { flex: 1 },
  info: { display: 'flex', gap: '16px', padding: '12px 32px', backgroundColor: '#16213e', borderTop: '1px solid #0f3460' },
  infoCard: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  infoNumber: { color: '#e94560', fontSize: '24px', fontWeight: 'bold' },
  infoLabel: { color: '#aaa', fontSize: '12px' },
};

export default LiveMap;