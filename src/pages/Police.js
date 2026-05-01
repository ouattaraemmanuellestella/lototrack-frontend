import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';

const API = 'https://lototrack-backend.onrender.com';
const socket = io(API);

function Police() {
  const [alertes, setAlertes] = useState([]);
  const [enRoute, setEnRoute] = useState(null);
  const [tempsArrivee, setTempsArrivee] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    // Charger alertes actives
    fetchAlertes();

    // Écouter nouvelles alertes
    socket.on('alerte_vol', (data) => {
      setAlertes(prev => [data, ...prev]);
      // Notification sonore
      const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
      audio.play().catch(() => {});
    });

    return () => socket.off('alerte_vol');
  }, []);

  const fetchAlertes = async () => {
    try {
      const res = await axios.get(`${API}/api/alerts/actives`, { headers });
      setAlertes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const accepterAlerte = (alerte) => {
    setEnRoute(alerte);
    
    // Simuler déplacement vers le véhicule
    let lat = 5.3599517 + (Math.random() - 0.5) * 0.05;
    let lng = -4.0082563 + (Math.random() - 0.5) * 0.05;
    
    // Calculer temps d'arrivée estimé (simulation)
    const distance = Math.random() * 5 + 1; // 1-6 km
    const temps = Math.round(distance / 0.5); // ~2 min par km
    setTempsArrivee(temps);

    // Émettre position police en temps réel
    const interval = setInterval(() => {
      lat += (Math.random() - 0.5) * 0.003;
      lng += (Math.random() - 0.5) * 0.003;
      socket.emit('police_position', { latitude: lat, longitude: lng });
      socket.emit('accept_alert', { 
        ...alerte, 
        policeLat: lat, 
        policeLng: lng,
        tempsArrivee: temps
      });
    }, 2000);

    setTimeout(() => {
      clearInterval(interval);
      setTempsArrivee(0);
    }, temps * 60 * 1000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🚔 Centre de Commandement</h1>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
      </div>

      {enRoute && (
        <div style={styles.enRouteBanner}>
          <h2 style={styles.enRouteTitle}>🚔 EN ROUTE !</h2>
          <p style={styles.enRouteText}>Intervention : {enRoute.immatriculation}</p>
          {tempsArrivee > 0 && (
            <div style={styles.tempsBox}>
              <span style={styles.tempsNumber}>{tempsArrivee}</span>
              <span style={styles.tempsLabel}>min d'arrivée</span>
            </div>
          )}
          {tempsArrivee === 0 && <p style={styles.arrive}>✅ Arrivé sur place !</p>}
          <button style={styles.annulerBtn} onClick={() => { setEnRoute(null); setTempsArrivee(null); }}>
            Terminer l'intervention
          </button>
        </div>
      )}

      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>🚨 Alertes actives ({alertes.length})</h2>
        {alertes.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>✅ Aucune alerte active</p>
            <p style={styles.emptyHint}>Les alertes de vol apparaîtront ici en temps réel</p>
          </div>
        ) : (
          alertes.map((alerte, i) => (
            <div key={i} style={styles.alerteCard}>
              <div style={styles.alerteHeader}>
                <span style={styles.alerteIcon}>🚨</span>
                <div>
                  <h3 style={styles.alerteImmat}>{alerte.immatriculation}</h3>
                  <p style={styles.alerteInfo}>{alerte.marque} {alerte.modele}</p>
                  <p style={styles.alerteTime}>
                    🕐 {new Date(alerte.timestamp || alerte.createdAt).toLocaleTimeString()}
                  </p>
                  {alerte.position?.latitude && (
                    <p style={styles.alerteCoords}>
                      📍 {alerte.position.latitude.toFixed(4)}, {alerte.position.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
              <button 
                style={styles.intervenirBtn} 
                onClick={() => accepterAlerte(alerte)}
                disabled={enRoute !== null}>
                {enRoute ? '🚔 Déjà en intervention' : '🚔 Intervenir'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#1a1a2e', color: '#fff' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', backgroundColor: '#16213e' },
  title: { color: '#1565c0', margin: 0 },
  backBtn: { padding: '8px 16px', backgroundColor: '#0f3460', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  enRouteBanner: { backgroundColor: '#1565c0', padding: '24px 32px', textAlign: 'center' },
  enRouteTitle: { color: '#fff', margin: '0 0 8px 0', fontSize: '24px' },
  enRouteText: { color: '#fff', margin: '0 0 16px 0' },
  tempsBox: { display: 'inline-flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#fff', borderRadius: '12px', padding: '12px 24px', margin: '0 0 16px 0' },
  tempsNumber: { color: '#1565c0', fontSize: '48px', fontWeight: 'bold', lineHeight: 1 },
  tempsLabel: { color: '#666', fontSize: '14px' },
  arrive: { color: '#4caf50', fontSize: '20px', fontWeight: 'bold' },
  annulerBtn: { padding: '10px 24px', backgroundColor: '#fff', color: '#1565c0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  content: { padding: '32px' },
  sectionTitle: { color: '#fff', marginBottom: '20px' },
  empty: { textAlign: 'center', padding: '60px' },
  emptyText: { color: '#4caf50', fontSize: '18px' },
  emptyHint: { color: '#aaa', fontSize: '14px' },
  alerteCard: { backgroundColor: '#16213e', borderRadius: '12px', padding: '20px', marginBottom: '16px', border: '2px solid #e94560' },
  alerteHeader: { display: 'flex', gap: '16px', marginBottom: '16px' },
  alerteIcon: { fontSize: '40px' },
  alerteImmat: { color: '#e94560', margin: '0 0 4px 0', fontSize: '20px' },
  alerteInfo: { color: '#fff', margin: '0 0 4px 0' },
  alerteTime: { color: '#aaa', margin: '0 0 4px 0', fontSize: '13px' },
  alerteCoords: { color: '#aaa', margin: 0, fontSize: '13px' },
  intervenirBtn: { width: '100%', padding: '12px', backgroundColor: '#1565c0', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
};

export default Police;