import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${token}` };

  const [form, setForm] = useState({ nom: user?.nom, telephone: '' });
  const [password, setPassword] = useState({ ancien: '', nouveau: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('https://lototrack-backend.onrender.com/api/auth/profile', form, { headers });
      const updatedUser = { ...user, nom: form.nom };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess('Profil mis à jour !');
    } catch (err) {
      setError('Erreur mise à jour profil');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🚗 LotoTrack</h1>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>👤 Mon Profil</h2>
          <div style={styles.infoBox}>
            <p style={styles.infoLabel}>Email</p>
            <p style={styles.infoValue}>{user?.email}</p>
          </div>
          <div style={styles.infoBox}>
            <p style={styles.infoLabel}>Rôle</p>
            <p style={styles.infoValue}>{user?.role}</p>
          </div>

          {success && <p style={styles.success}>{success}</p>}
          {error && <p style={styles.error}>{error}</p>}

          <form onSubmit={handleUpdate}>
            <input
              style={styles.input}
              type="text"
              placeholder="Nom complet"
              value={form.nom}
              onChange={e => setForm({...form, nom: e.target.value})}
            />
            <input
              style={styles.input}
              type="text"
              placeholder="Téléphone"
              value={form.telephone}
              onChange={e => setForm({...form, telephone: e.target.value})}
            />
            <button style={styles.button} type="submit">💾 Mettre à jour</button>
          </form>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📊 Statistiques</h2>
          <div style={styles.statBox}>
            <span style={styles.statIcon}>🚗</span>
            <span style={styles.statLabel}>Véhicules enregistrés</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statIcon}>📍</span>
            <span style={styles.statLabel}>Positions mises à jour</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statIcon}>🚨</span>
            <span style={styles.statLabel}>Alertes envoyées</span>
          </div>

          <div style={styles.dangerZone}>
            <h3 style={styles.dangerTitle}>⚠️ Zone dangereuse</h3>
            <button style={styles.btnLogout} onClick={() => { localStorage.clear(); navigate('/login'); }}>
              🚪 Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#1a1a2e', color: '#fff' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', backgroundColor: '#16213e' },
  title: { color: '#e94560', margin: 0 },
  backBtn: { padding: '8px 16px', backgroundColor: '#0f3460', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  content: { display: 'flex', gap: '24px', padding: '32px', flexWrap: 'wrap' },
  card: { backgroundColor: '#16213e', borderRadius: '12px', padding: '24px', flex: '1', minWidth: '300px' },
  cardTitle: { color: '#e94560', marginBottom: '20px' },
  infoBox: { backgroundColor: '#0f3460', borderRadius: '8px', padding: '12px 16px', marginBottom: '12px' },
  infoLabel: { color: '#aaa', fontSize: '12px', margin: 0 },
  infoValue: { color: '#fff', fontWeight: 'bold', margin: '4px 0 0 0' },
  input: { width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #0f3460', backgroundColor: '#0f3460', color: '#fff', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  success: { color: '#4caf50', marginBottom: '12px' },
  error: { color: '#e94560', marginBottom: '12px' },
  statBox: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#0f3460', borderRadius: '8px', padding: '12px 16px', marginBottom: '12px' },
  statIcon: { fontSize: '24px' },
  statLabel: { color: '#fff' },
  dangerZone: { marginTop: '24px', borderTop: '1px solid #e94560', paddingTop: '16px' },
  dangerTitle: { color: '#e94560', marginBottom: '12px' },
  btnLogout: { width: '100%', padding: '12px', backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
};

export default Profile;