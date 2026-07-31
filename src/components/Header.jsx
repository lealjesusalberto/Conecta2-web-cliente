import React from 'react';
import { Smartphone, Trophy, Star, Signal, Wifi, Battery } from 'lucide-react';

export default function Header({ user, pricingConfig, onOpenAuth, onOpenRewards, onOpenInstall, isPwaInstalled }) {
  const tasaBcv = pricingConfig?.tasaBcv || 50.0;
  const userName = user ? (user.displayName || user.email?.split('@')[0] || 'Cliente') : 'Invitado';
  const userPhoto = user?.photoURL;
  const userPoints = user?.puntos || 0;
  const userLevel = user?.nivel || 'Bronce';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', zIndex: 1000 }}>
      {/* Flutter App Bar Principal */}
      <header className="flutter-sheet" style={{
        borderRadius: 0,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-glass)'
      }}>
        {/* Left: User Avatar & Profile Level */}
        <div 
          onClick={onOpenAuth}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--primary-gradient)',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
            flexShrink: 0
          }}>
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={userName}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: '#1E293B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                color: '#FFF',
                fontSize: '15px'
              }}>
                {userName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Online Status Dot */}
            <span style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              background: 'var(--accent-green)',
              border: '2px solid #1E293B'
            }}></span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 900, color: '#FFF', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '110px' }}>
                {userName}
              </h2>
              <span style={{
                background: 'rgba(241, 95, 2, 0.18)',
                color: 'var(--primary-orange-light)',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <Star size={10} fill="var(--primary-orange-light)" /> {userLevel}
              </span>
            </div>

            {/* Puntos & Tasa BCV */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontSize: '11px' }}>
              <span 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenRewards) onOpenRewards();
                }}
                style={{ color: '#FBBF24', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}
              >
                <Trophy size={11} color="#FBBF24" /> {userPoints} Pts
              </span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>
                BCV: {tasaBcv.toFixed(2)} Bs
              </span>
            </div>
          </div>
        </div>

        {/* Right: Install PWA Shortcut Only */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {!isPwaInstalled && (
            <button 
              onClick={onOpenInstall}
              className="btn-flutter-secondary"
              style={{ padding: '6px 10px', fontSize: '11px', borderColor: 'var(--primary-orange)', gap: '4px' }}
            >
              <Smartphone size={13} color="var(--primary-orange-light)" />
              <span>Instalar</span>
            </button>
          )}
        </div>
      </header>
    </div>
  );
}
