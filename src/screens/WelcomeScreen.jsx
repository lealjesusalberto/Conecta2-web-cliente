import React from 'react';
import { Navigation, UserCheck, ArrowRight } from 'lucide-react';

export default function WelcomeScreen({ onGoToRegister, onGoToLogin }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: '#0A0E1A',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 20px',
      overflowY: 'auto'
    }}>
      {/* Background Glowing Orbs */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-80px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(241, 95, 2, 0.25) 0%, rgba(241, 95, 2, 0) 70%)',
        pointerEvents: 'none'
      }}></div>

      <div style={{
        position: 'absolute',
        bottom: '-120px',
        left: '-80px',
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(95, 56, 134, 0.3) 0%, rgba(95, 56, 134, 0) 70%)',
        pointerEvents: 'none'
      }}></div>

      {/* Header Logo con Contenedor Naranja Transparente (Glassmorphism Naranja) */}
      <div style={{ textAlign: 'center', marginTop: '20px', zIndex: 10 }}>
        <div style={{
          margin: '0 auto 16px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img
            src="/assets/c2_launch_2.png"
            alt="Conecta2 Logo"
            style={{
              width: '90px',
              height: '90px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(241, 95, 2, 0.3))'
            }}
          />
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.5px', color: '#FFF' }}>
          ¡Bienvenido!
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '6px' }}>
          ¿Cómo deseas iniciar en Conecta2?
        </p>
      </div>

      {/* Hero Action Card: Quiero Viajar */}
      <div style={{ zIndex: 10, margin: '24px 0' }}>
        <div
          onClick={onGoToRegister}
          className="flutter-card"
          style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(241, 95, 2, 0.22) 0%, rgba(30, 41, 59, 0.8) 100%)',
            border: '1.5px solid var(--primary-orange)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <Navigation size={26} color="#FFF" />
            </div>
            <span style={{
              background: 'var(--primary-orange)',
              color: '#FFF',
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '12px',
              textTransform: 'uppercase'
            }}>
              Clientes
            </span>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#FFF', marginBottom: '6px' }}>
            Pedir un Viaje
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '16px' }}>
            Solicita tu traslado seguro en Auto Express o Moto Express en segundos.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-orange-light)', fontWeight: 800, fontSize: '14px' }}>
            <span>Crear cuenta y comenzar</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </div>

      {/* Footer Options */}
      <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={onGoToLogin}
          className="btn-flutter-secondary"
          style={{ width: '100%' }}
        >
          <UserCheck size={18} />
          <span>Ya tengo una cuenta (Iniciar Sesión)</span>
        </button>
      </div>
    </div>
  );
}
