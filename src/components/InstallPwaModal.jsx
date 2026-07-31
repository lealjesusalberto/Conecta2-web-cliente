import React from 'react';
import { Smartphone, Download, Check, X, Shield } from 'lucide-react';

export default function InstallPwaModal({ isOpen, onClose, deferredPrompt }) {
  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('✅ Usuario instaló la PWA de Conecta2 Clientes');
      }
      onClose();
    } else {
      alert('Para instalar en Android / iPhone:\n1. Toca los tres puntos del navegador (o botón Compartir en Safari)\n2. Selecciona "Agregar a la pantalla de inicio"');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(10, 14, 26, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="flutter-sheet animate-sheet-up" style={{
        width: '100%',
        maxWidth: '380px',
        padding: '24px',
        borderRadius: '24px',
        textAlign: 'center',
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

        {/* App Icon c2_launch.png */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '22px',
          background: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto'
        }}>
          <img
            src="/assets/c2_launch.png"
            alt="Conecta2 App Icon"
            style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 8px 16px rgba(241, 95, 2, 0.4))' }}
          />
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '8px', color: '#FFF' }}>
          Instalar Conecta2 App
        </h3>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4', marginBottom: '20px' }}>
          Instala el acceso directo oficial en tu teléfono para abrir Conecta2 como una app nativa, rápida y sin barra de navegador.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', marginBottom: '20px', fontSize: '13px', color: 'var(--text-white)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={16} color="var(--accent-green)" />
            <span>Acceso directo instantáneo en el menú de tu celular</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={16} color="var(--accent-green)" />
            <span>Mayor velocidad y notificaciones de viaje</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={16} color="var(--accent-green)" />
            <span>No consume espacio adicional en tu dispositivo</span>
          </div>
        </div>

        <button
          onClick={handleInstallClick}
          className="btn-flutter-primary"
        >
          <Download size={18} />
          <span>Instalar Ahora</span>
        </button>
      </div>
    </div>
  );
}
