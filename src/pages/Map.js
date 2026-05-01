import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Map() {
  const [vehicles, setVehicles] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get('https://lototrack-backend.onrender.com/api/vehicles', { headers });
        setVehicles(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVehicles();
    const interval = setInterval(fetchVehicles, 10000);
    return () => clearInterval(interval);
  }, []);

  // Abidjan comme centre par défaut
  const center = [5.3599517, -4.0082563];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🚗 LotoTrack — Carte</h1>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
      </div>
      <MapContainer center={center} zoom={13} style={styles.map}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {vehicles.map(v => v.position?.latitude && (
          <Marker key={v._id} position={[v.position.latitude, v.position.longitude]}>
            <Popup>
              <strong>{v.immatriculation}</strong><br />
              {v.marque} {v.modele}<br />
              Statut : {v.statut}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div style={styles.legend}>
        <h3 style={styles.legendTitle}>🚘 Véhicules ({vehicles.length})</h3>
        {vehicles.map(v => (
          <div key={v._id} style={styles.vehicleItem}>
            <span style={styles.immat}>{v.immatriculation}</span>
            <span style={{...styles.statut, backgroundColor: v.statut === 'actif' ? '#4caf50' : v.statut === 'vole' ? '#e94560' : '#ff9800'}}>
              {v.statut}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { height: '100vh', backgroundColor: '#1a1a2e', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', backgroundColor: '#16213e' },
  title: { color: '#e94560', margin: 0 },
  backBtn: { padding: '8px 16px', backgroundColor: '#0f3460', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  map: { flex: 1 },
  legend: { backgroundColor: '#16213e', padding: '16px 32px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' },
  legendTitle: { color: '#fff', margin: 0 },
  vehicleItem: { display: 'flex', alignItems: 'center', gap: '8px' },
  immat: { color: '#fff', fontWeight: 'bold' },
  statut: { padding: '2px 10px', borderRadius: '12px', fontSize: '12px', color: '#fff' }
};

export default Map;