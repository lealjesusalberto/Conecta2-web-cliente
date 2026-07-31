import React, { useState } from 'react';
import { User, Phone, X, ShieldCheck } from 'lucide-react';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';

export default function AuthModal({ isOpen, onClose, onSaveProfile, currentUser }) {
  if (!isOpen) return null;

  const [nombre, setNombre] = useState(currentUser?.displayName || '');
  const [telefono, setTelefono] = useState(currentUser?.phone || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) {
      alert('Por favor ingresa tu nombre y número de teléfono');
      return;
    }
    onSaveProfile({
      uid: currentUser?.uid || 'guest_' + Date.now(),
      displayName: nombre,
      phoneNumber: telefono,
      phone: telefono
    });
    onClose();
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onSaveProfile({
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        phoneNumber: result.user.phoneNumber || telefono || '',
        phone: result.user.phoneNumber || telefono || ''
      });
      onClose();
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div className="glass-panel animate-slide-up" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '24px',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>
            Tu Perfil de Pasajero
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Necesario para que el conductor pueda contactarte al aceptar tu viaje.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Nombre Completo
            </label>
            <input
              type="text"
              className="custom-input"
              placeholder="Ej: Alberto Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Número de Teléfono
            </label>
            <input
              type="tel"
              className="custom-input"
              placeholder="Ej: 04121234567"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '6px' }}>
            Guardar Perfil
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0', color: 'var(--text-muted)', fontSize: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span>o usa Google</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <button onClick={handleGoogleSignIn} className="btn-secondary" style={{ width: '100%' }}>
          Google Sign-In
        </button>
      </div>
    </div>
  );
}
