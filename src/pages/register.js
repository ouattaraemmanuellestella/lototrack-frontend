import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [form, setForm] = useState({ nom: '', email: '', password: '', telephone: '', role: 'proprietaire' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://lototrack-backend.onrender.com/api/auth/register', form);
      setSuccess('Compte créé ! Redirection...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur serveur');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🚗 LotoTrack</h1>
        <h2 style={styles.subtitle}>Créer un compte</h2>
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="text" name="nom" placeholder="Nom complet" onChange={handleChange} required />
          <input style={styles.input} type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input style={styles.input} type="password" name="password" placeholder="Mot de passe" onChange={handleChange} required />
          <input style={styles.input} type="text" name="telephone" placeholder="Téléphone" onChange={handleChange} />
          <select style={styles.input} name="role" onChange={handleChange}>
            <option value="proprietaire">Propriétaire</option>
            <option value="chauffeur">Chauffeur</option>
          </select>
          <button style={styles.button} type="submit">S'inscrire</button>
        </form>
        <p style={styles.link}>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a1a2e' },
  card: { backgroundColor: '#16213e', padding: '40px', borderRadius: '12px', width: '360px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  title: { color: '#e94560', textAlign: 'center', marginBottom: '8px' },
  subtitle: { color: '#fff', textAlign: 'center', marginBottom: '24px' },
  input: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #0f3460', backgroundColor: '#0f3460', color: '#fff', fontSize: '14px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', backgroundColor: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' },
  error: { color: '#e94560', textAlign: 'center', marginBottom: '16px' },
  success: { color: '#4caf50', textAlign: 'center', marginBottom: '16px' },
  link: { color: '#aaa', textAlign: 'center', marginTop: '16px' }
};

export default Register;