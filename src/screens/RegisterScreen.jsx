import React, { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowLeft, Eye, EyeOff, UploadCloud } from 'lucide-react';
import { auth, googleProvider, storage } from '../config/firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function RegisterScreen({ onRegisterSuccess, onGoToLogin, onGoBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pais, setPais] = useState('Venezuela (+58)');
  const [fotoCedula, setFotoCedula] = useState(null);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Por favor completa los campos obligatorios.');
      return;
    }

    if (!fotoCedula) {
      setErrorMsg('Por favor sube una foto clara de tu cédula.');
      return;
    }

    if (!fotoPerfil) {
      setErrorMsg('Por favor sube una foto de perfil.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      let cedulaUrl = '';
      if (fotoCedula) {
        const extension = fotoCedula.name.split('.').pop();
        const fileName = `cedula_cliente_${Date.now()}.${extension}`;
        const storageRef = ref(storage, `cedulas/${fileName}`);
        await uploadBytes(storageRef, fotoCedula);
        cedulaUrl = await getDownloadURL(storageRef);
      }

      let perfilUrl = '';
      if (fotoPerfil) {
        const pExt = fotoPerfil.name.split('.').pop();
        const pName = `perfil_cliente_${Date.now()}.${pExt}`;
        const pRef = ref(storage, `perfiles/${pName}`);
        await uploadBytes(pRef, fotoPerfil);
        perfilUrl = await getDownloadURL(pRef);
      }

      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(result.user, {
        displayName: name.trim()
      });

      const userData = {
        uid: result.user.uid,
        displayName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        email: email.trim(),
        phone: phone.trim(),
        pais: pais,
        cedulaUrl: cedulaUrl,
        fotoPerfilUrl: perfilUrl
      };

      setIsLoading(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        onRegisterSuccess(userData);
      }, 2500); // Dar 2.5 segundos para que vea el mensaje de éxito
    } catch (err) {
      console.error('⚠️ Error al registrar en Firebase:', err);
      setIsLoading(false);
      
      // Manejo de errores comunes de Firebase
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Este correo ya está registrado. Por favor, inicia sesión.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('La contraseña es muy débil. Usa al menos 6 caracteres.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('El correo electrónico no es válido.');
      } else {
        setErrorMsg('Hubo un error al crear la cuenta. Inténtalo de nuevo.');
      }
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

      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: '#0A0E1A',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFF'
        }}>
          <div style={{ marginBottom: '20px', width: '40px', height: '40px', border: '3px solid rgba(241, 95, 2, 0.2)', borderTopColor: '#F15F02', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Creando tu cuenta...</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '13px' }}>Estamos configurando tu perfil</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Success Overlay */}
      {isSuccess && (
        <div className="animate-fade-in" style={{
          position: 'fixed',
          inset: 0,
          background: '#0A0E1A',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFF',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 900 }}>¡Cuenta creada exitosamente!</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '14px' }}>Te estamos redirigiendo...</p>
        </div>
      )}

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

          {/* Teléfono */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Número de Teléfono
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                className="flutter-input"
                style={{ width: '130px', paddingLeft: '8px', paddingRight: '8px' }}
                value={pais}
                onChange={(e) => setPais(e.target.value)}
              >
                <option value="Venezuela (+58)">VE (+58)</option>
                <option value="Colombia (+57)">CO (+57)</option>
                <option value="Peru (+51)">PE (+51)</option>
                <option value="Chile (+56)">CL (+56)</option>
                <option value="Ecuador (+593)">EC (+593)</option>
              </select>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="tel"
                  className="flutter-input"
                  placeholder="412 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
                <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>

          {/* Foto de Cédula */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Cédula de Identidad (Foto) *
            </label>
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              border: '2px dashed rgba(255,255,255,0.15)',
              borderRadius: '12px',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.03)'
            }}>
              <UploadCloud size={24} color={fotoCedula ? '#10B981' : 'var(--text-muted)'} style={{ marginBottom: '8px' }} />
              <span style={{ fontSize: '12px', color: fotoCedula ? '#10B981' : 'var(--text-muted)', fontWeight: fotoCedula ? 700 : 400, textAlign: 'center' }}>
                {fotoCedula ? `Seleccionada: ${fotoCedula.name}` : 'Toca para subir tu Cédula'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFotoCedula(e.target.files[0]);
                  }
                }}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Foto de Perfil */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Foto de Perfil *
            </label>
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              border: '2px dashed rgba(255,255,255,0.15)',
              borderRadius: '12px',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.03)'
            }}>
              <User size={24} color={fotoPerfil ? '#10B981' : 'var(--text-muted)'} style={{ marginBottom: '8px' }} />
              <span style={{ fontSize: '12px', color: fotoPerfil ? '#10B981' : 'var(--text-muted)', fontWeight: fotoPerfil ? 700 : 400, textAlign: 'center' }}>
                {fotoPerfil ? `Seleccionada: ${fotoPerfil.name}` : 'Toca para subir tu Foto de Perfil'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFotoPerfil(e.target.files[0]);
                  }
                }}
                style={{ display: 'none' }}
              />
            </label>
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
