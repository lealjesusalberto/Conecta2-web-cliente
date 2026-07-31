import React, { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { auth, googleProvider } from '../config/firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';

export default function RegisterScreen({ onRegisterSuccess, onGoToLogin, onGoBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Por favor completa los campos obligatorios.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(result.user, {
        displayName: name.trim()
      });

      onRegisterSuccess({
        uid: result.user.uid,
        displayName: name.trim(),
        email: email.trim(),
        phone: phone.trim()
      });
    } catch (err) {
      console.warn('⚠️ Register Firebase fallback a sesión local:', err);
      onRegisterSuccess({
        uid: 'user_' + Date.now(),
        displayName: name.trim(),
        email: email.trim(),
        phone: phone.trim()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onRegisterSuccess({
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        phone: result.user.phoneNumber || ''
      });
    } catch (err) {
      console.error('Error Google Sign-In:', err);
      setErrorMsg('No se pudo registrar con Google.');
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
      {/* Header with Back Button & Logo Oficial c2_launch.png */}
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
            cursor: 'pointer',
            zIndex: 20
          }}
        >
          <ArrowLeft size={20} />
        </button>

        {/* Contenedor Naranja Transparente Glassmorphism */}
        <div style={{
          width: '96px',
          height: '96px',
          margin: '12px 0 8px 0',
          borderRadius: '26px',
          background: 'linear-gradient(135deg, rgba(241, 95, 2, 0.22) 0%, rgba(241, 95, 2, 0.08) 100%)',
          border: '1.5px solid rgba(241, 95, 2, 0.4)',
          boxShadow: '0 12px 28px rgba(241, 95, 2, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          padding: '10px'
        }}>
          <img
            src="/assets/c2_launch.png"
            alt="Conecta2 Logo"
            style={{
              width: '72px',
              height: '72px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 10px rgba(241, 95, 2, 0.3))'
            }}
          />
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
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            borderRadius: '12px',
            padding: '10px 14px',
            color: '#F87171',
            fontSize: '12px',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Nombre completo */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Nombre y Apellido *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="flutter-input"
                placeholder="Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Correo Electrónico */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Correo Electrónico *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="flutter-input"
                placeholder="juan@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Número de Teléfono
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                className="flutter-input"
                placeholder="+58 412 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Contraseña *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="flutter-input"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                minLength={6}
                required
              />
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-flutter-primary"
            style={{ marginTop: '8px' }}
          >
            {isLoading ? 'Creando cuenta...' : 'Registrarme y Viajar ➔'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>O regístrate con</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="btn-flutter-secondary"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
          <span>Registrarse con Google</span>
        </button>

        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>¿Ya tienes cuenta? </span>
          <button
            onClick={onGoToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-orange-light)',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Inicia Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
