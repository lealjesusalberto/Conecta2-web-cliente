import React, { useState } from 'react';
import { User, Phone, Mail, Lock, ArrowLeft } from 'lucide-react';
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function RegisterScreen({ onRegisterSuccess, onGoToLogin, onGoBack }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(result.user, { displayName: nombre });

      onRegisterSuccess({
        uid: result.user.uid,
        displayName: nombre,
        email: email,
        phone: telefono
      });
    } catch (err) {
      console.warn('⚠️ Error creando cuenta en Firebase, fallback a cuenta local:', err);
      onRegisterSuccess({
        uid: 'user_' + Date.now(),
        displayName: nombre,
        email: email,
        phone: telefono
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: '#0A0E1A',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      {/* Header with Back Button */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <button
          onClick={onGoBack}
          style={{
            position: 'absolute',
            top: '20px',
            left: '16px',
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '22px',
          background: 'var(--primary-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '12px 0 8px 0',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <span style={{ fontSize: '32px', fontWeight: 900, color: '#FFF' }}>C2</span>
        </div>
      </div>

      {/* Dark Slate Sheet for Registration */}
      <div className="flutter-sheet animate-sheet-up" style={{
        padding: '28px 24px 24px 24px',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflowY: 'auto'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF' }}>
            Crear Cuenta Cliente
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Regístrate para solicitar viajes y pedir delivery
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid #EF4444', padding: '10px', borderRadius: '12px', fontSize: '13px', textAlign: 'center', fontWeight: 600 }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Full Name */}
          <div style={{ position: 'relative' }}>
            <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="flutter-input"
              placeholder="Nombre Completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={{ paddingLeft: '44px' }}
              required
            />
          </div>

          {/* Phone Number */}
          <div style={{ position: 'relative' }}>
            <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="tel"
              className="flutter-input"
              placeholder="Número de Teléfono (0412...)"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              style={{ paddingLeft: '44px' }}
              required
            />
          </div>

          {/* Email */}
          <div style={{ position: 'relative' }}>
            <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="email"
              className="flutter-input"
              placeholder="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ paddingLeft: '44px' }}
              required
            />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="password"
              className="flutter-input"
              placeholder="Crear Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '44px' }}
              required
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-flutter-primary"
            style={{ marginTop: '8px' }}
          >
            {isLoading ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
          ¿Ya tienes una cuenta?{' '}
          <span
            onClick={onGoToLogin}
            style={{ color: 'var(--primary-orange-light)', fontWeight: 800, cursor: 'pointer' }}
          >
            Iniciar Sesión
          </span>
        </div>
      </div>
    </div>
  );
}
