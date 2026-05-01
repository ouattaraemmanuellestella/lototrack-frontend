import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ immatriculation: '', marque: '', modele: '', couleur: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const headers = { Authorization: `Bearer ${token}` };
  <button style={styles.mapBtn} onClick={() => navigate('/profile')}>👤 Profil</button>

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/vehicles', { headers });
      setVehicles(res.data);
    } catch (err) {
      setError('Erreur lors du chargement');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/vehicles', form, { headers });
      setForm({ immatriculation: '', marque: '', modele: '', couleur: '' });
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur serveur');
    }
  };

  const [alerte, setAlerte] = useState(null);

  const handleStatut = async (id, statut) => {
  try {
    await axios.put(`http://localhost:5000/api/vehicles/${id}/statut`, { statut }, { headers });
    fetchVehicles();
    if (statut === 'vole') {
      setAlerte({ type: 'vole', vehicleId: id });
    } else if (statut === 'accident') {
      setAlerte({ type: 'accident', vehicleId: id });
    } else {
      setAlerte(null);
    }
  } catch (err) {
    setError('Erreur mise à jour statut');
  }
  };

  const handlePosition = async (id) => {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      await axios.put(`http://localhost:5000/api/vehicles/${id}/position`, {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      }, { headers });
      fetchVehicles();
      alert('Position mise à jour ! 📍');
    } catch (err) {
      setError('Erreur mise à jour position');
    }
  });
};

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {alerte && (
  <div style={styles.alerteBanner}>
    <div style={styles.alerteContent}>
      <h2 style={styles.alerteTitle}>
        {alerte.type === 'vole' ? '🚨 VÉHICULE VOLÉ !' : '⚠️ ACCIDENT SIGNALÉ !'}
      </h2>
      <p style={styles.alerteText}>Contactez immédiatement les secours :</p>
      <div style={styles.urgenceButtons}>
        <a href="tel:110" style={styles.btnPolice}>🚔 Police — 110</a>
        <a href="tel:185" style={styles.btnSamu}>🚑 SAMU — 185</a>
        <a href="tel:180" style={styles.btnPompiers}>🚒 Pompiers — 180</a>
        {alerte.type === 'vole' && (
          <a href="tel:111" style={styles.btnGendarmerie}>👮 Gendarmerie — 111</a>
        )}
      </div>
      <button style={styles.alerteClose} onClick={() => setAlerte(null)}>✕ Fermer</button>
    </div>
  </div>
)}
        <h1 style={styles.title}>🚗 LotoTrack</h1>
        <div style={styles.userInfo}>
          <span style={styles.userName}>👤 {user?.nom}</span>
          <button style={styles.mapBtn} onClick={() => navigate('/map')}>🗺️ Voir la carte</button>
          <button style={styles.mapBtn} onClick={() => navigate('/profile')}>👤 Profil</button>
          <button style={styles.logoutBtn} onClick={handleLogout}>Déconnexion</button>
        </div>
      </div>

      <div style={styles.content}>
        {/* Formulaire ajout véhicule */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>➕ Ajouter un véhicule</h2>
          {error && <p style={styles.error}>{error}</p>}
          <form onSubmit={handleAdd}>
            <input style={styles.input} placeholder="Immatriculation" value={form.immatriculation} onChange={e => setForm({...form, immatriculation: e.target.value})} required />
            <input style={styles.input} placeholder="Marque" value={form.marque} onChange={e => setForm({...form, marque: e.target.value})} required />
            <input style={styles.input} placeholder="Modèle" value={form.modele} onChange={e => setForm({...form, modele: e.target.value})} required />
            <input style={styles.input} placeholder="Couleur" value={form.couleur} onChange={e => setForm({...form, couleur: e.target.value})} />
            <button style={styles.button} type="submit">Ajouter</button>
          </form>
        </div>

        {/* Liste véhicules */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🚘 Mes véhicules ({vehicles.length})</h2>
          {vehicles.length === 0 ? (
            <p style={styles.empty}>Aucun véhicule enregistré</p>
          ) : (
            vehicles.map(v => (
              <div key={v._id} style={styles.vehicleCard}>
                <div style={styles.vehicleInfo}>
                  <span style={styles.immat}>{v.immatriculation}</span>
                  <span style={styles.vehicleName}>{v.marque} {v.modele} - {v.couleur}</span>
                  <span style={{...styles.statut, backgroundColor: v.statut === 'actif' ? '#4caf50' : v.statut === 'vole' ? '#e94560' : '#ff9800'}}>
                    {v.statut}
                  </span>
                </div>
                <div style={styles.actions}>
                  <button style={styles.btnVole} onClick={() => handleStatut(v._id, 'vole')}>🚨 Volé</button>
                  <button style={styles.btnAccident} onClick={() => handleStatut(v._id, 'accident')}>⚠️ Accident</button>
                  <button style={styles.btnActif} onClick={() => handleStatut(v._id, 'actif')}>✅ Actif</button>
                  <button style={styles.btnPosition} onClick={() => handlePosition(v._id)}>📍 Position</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#1a1a2e', color: '#fff' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', backgroundColor: '#16213e', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  title: { color: '#e94560', margin: 0 },
  userInfo: { display: 'flex', alignItems: 'center', gap: '16px' },
  userName: { color: '#aaa' },
  logoutBtn: { padding: '8px 16px', backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  content: { display: 'flex', gap: '24px', padding: '32px', flexWrap: 'wrap' },
  card: { backgroundColor: '#16213e', borderRadius: '12px', padding: '24px', flex: '1', minWidth: '300px' },
  cardTitle: { color: '#e94560', marginBottom: '20px' },
  input: { width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #0f3460', backgroundColor: '#0f3460', color: '#fff', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  vehicleCard: { backgroundColor: '#0f3460', borderRadius: '8px', padding: '16px', marginBottom: '12px' },
  vehicleInfo: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' },
  immat: { color: '#e94560', fontWeight: 'bold', fontSize: '18px' },
  vehicleName: { color: '#fff' },
  statut: { display: 'inline-block', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', color: '#fff', width: 'fit-content' },
  actions: { display: 'flex', gap: '8px' },
  btnVole: { padding: '6px 12px', backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  btnAccident: { padding: '6px 12px', backgroundColor: '#ff9800', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  btnActif: { padding: '6px 12px', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  error: { color: '#e94560', marginBottom: '12px' },
  empty: { color: '#aaa', textAlign: 'center' },
  mapBtn: { padding: '8px 16px', backgroundColor: '#0f3460', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  btnPosition: { padding: '6px 12px', backgroundColor: '#2196f3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  alerteBanner: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' },
alerteContent: { backgroundColor: '#16213e', borderRadius: '16px', padding: '40px', textAlign: 'center', maxWidth: '500px', border: '2px solid #e94560' },
alerteTitle: { color: '#e94560', fontSize: '28px', marginBottom: '16px' },
alerteText: { color: '#fff', marginBottom: '24px' },
urgenceButtons: { display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '24px' },
btnPolice: { padding: '12px 20px', backgroundColor: '#1565c0', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' },
btnSamu: { padding: '12px 20px', backgroundColor: '#c62828', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' },
btnPompiers: { padding: '12px 20px', backgroundColor: '#e65100', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' },
btnGendarmerie: { padding: '12px 20px', backgroundColor: '#2e7d32', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' },
alerteClose: { padding: '10px 24px', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
};

export default Dashboard;