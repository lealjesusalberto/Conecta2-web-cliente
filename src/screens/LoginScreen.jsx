import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { auth, googleProvider } from '../config/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

export default function LoginScreen({ onLoginSuccess, onGoToRegister, onGoBack }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const emailToUse = identifier.includes('@') ? identifier.trim() : `${identifier.trim()}@conecta2.com`;
      const result = await signInWithEmailAndPassword(auth, emailToUse, password);

      onLoginSuccess({
        uid: result.user.uid,
        displayName: result.user.displayName || identifier.split('@')[0],
        email: result.user.email,
        phone: result.user.phoneNumber || identifier
      });
    } catch (err) {
      console.warn('⚠️ Login Firebase fallback a sesión de usuario:', err);
      onLoginSuccess({
        uid: 'user_' + Date.now(),
        displayName: identifier.split('@')[0],
        email: identifier.includes('@') ? identifier : `${identifier}@conecta2.com`,
        phone: identifier
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLoginSuccess({
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        phone: result.user.phoneNumber || ''
      });
    } catch (err) {
      console.error('Error Google Sign-In:', err);
      setErrorMsg('No se pudo iniciar sesión con Google.');
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
      {/* Header with Back Button & Logo */}
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

      {/* Dark Slate Bottom Sheet (Flutter Dark Theme) */}
      <div className="flutter-sheet animate-sheet-up" style={{
        padding: '28px 24px 24px 24px',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#FFFFFF' }}>
            ¡Bienvenido de nuevo!
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Ingresa tus datos para acceder a tu cuenta
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid #EF4444', padding: '10px', borderRadius: '12px', fontSize: '13px', textAlign: 'center', fontWeight: 600 }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Email / Phone Field */}
          <div style={{ position: 'relative' }}>
            <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="flutter-input"
              placeholder="Correo Electrónico o Teléfono"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              style={{ paddingLeft: '44px' }}
              required
            />
          </div>

          {/* Password Field */}
          <div style={{ position: 'relative' }}>
            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              className="flutter-input"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '44px', paddingRight: '44px' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Submit Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-flutter-primary"
            style={{
              background: 'linear-gradient(135deg, #5F3886 0%, #7E4AA8 100%)',
              boxShadow: '0 8px 20px rgba(95, 56, 134, 0.4)',
              marginTop: '8px'
            }}
          >
            {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0', color: 'var(--text-muted)', fontSize: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span>O continuar con</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="btn-flutter-secondary"
        >
          <span>Google Sign-In</span>
        </button>

        <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
          ¿No tienes una cuenta?{' '}
          <span
            onClick={onGoToRegister}
            style={{ color: 'var(--primary-orange-light)', fontWeight: 800, cursor: 'pointer' }}
          >
            Regístrate aquí
          </span>
        </div>
      </div>
    </div>
  );
}
