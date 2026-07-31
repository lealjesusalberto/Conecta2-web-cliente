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
          margin: '12px 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img
            src="/assets/c2_launch_2.png"
            alt="Conecta2 Logo"
            style={{
              width: '140px',
              height: '140px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 10px rgba(241, 95, 2, 0.3))'
            }}
          />
        </div>
      </div>

      {/* Dark Slate Sheet for Login Form */}
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
            Iniciar Sesión
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Ingresa tu correo o teléfono registrado
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

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Identificador / Email */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Correo o Teléfono
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="flutter-input"
                placeholder="ejemplo@correo.com o +58412..."
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Clave */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="flutter-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
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
            {isLoading ? 'Iniciando sesión...' : 'Ingresar a Conecta2 ➔'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>O continúa con</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="btn-flutter-secondary"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
          <span>Continuar con Google</span>
        </button>

        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>¿No tienes una cuenta aún? </span>
          <button
            onClick={onGoToRegister}
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
            Regístrate
          </button>
        </div>
      </div>
    </div>
  );
}
