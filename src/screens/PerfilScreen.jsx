import React, { useState } from 'react';
import { ArrowLeft, User, Phone, Mail, Trophy, Star, Car, Edit3, LogOut, Camera } from 'lucide-react';
import { ref, update } from 'firebase/database';
import { database } from '../config/firebase';

export default function PerfilScreen({ user, onGoBack, onUpdateUser, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || user?.phoneNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (user && user.uid) {
        const userRef = ref(database, `users/${user.uid}`);
        await update(userRef, {
          nombre: displayName,
          name: displayName,
          displayName: displayName,
          telefono: phone,
          phone: phone,
          email: email
        });
      }

      const updated = {
        ...user,
        displayName,
        phone,
        phoneNumber: phone,
        email
      };
      onUpdateUser(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar perfil en Firebase:', error);
      alert('Error al guardar cambios: ' + error.message);
    } finally {
      setIsSaving(false);
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
      overflowY: 'auto'
    }}>
      {/* App Bar Header */}
      <div style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#0F172A',
        sticky: 'top',
        zIndex: 10
      }}>
        <button
          onClick={onGoBack}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#FFF' }}>
          Mi Perfil
        </h1>

        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            background: isEditing ? 'var(--primary-orange)' : 'rgba(255,255,255,0.08)',
            border: 'none',
            borderRadius: '12px',
            padding: '8px 12px',
            color: '#FFF',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <Edit3 size={15} />
          <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
        </button>
      </div>

      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Large Avatar Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            position: 'relative',
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            background: 'var(--primary-gradient)',
            padding: '3px',
            boxShadow: 'var(--shadow-glow)',
            marginBottom: '14px'
          }}>
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
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
                fontSize: '36px',
                fontWeight: 900,
                color: '#FFF'
              }}>
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'C'}
              </div>
            )}

            <button style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: 'var(--primary-orange)',
              border: '2px solid #0A0E1A',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              cursor: 'pointer'
            }}>
              <Camera size={16} />
            </button>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#FFF' }}>
            {user?.displayName || 'Cliente Conecta2'}
          </h2>
          <span style={{
            background: 'rgba(241, 95, 2, 0.15)',
            color: 'var(--primary-orange-light)',
            fontSize: '12px',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '12px',
            marginTop: '6px',
            display: 'inline-block'
          }}>
            Pasajero Oficial
          </span>
        </div>

        {/* User Stats Grid Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div className="flutter-card" style={{ padding: '14px 10px', textAlign: 'center' }}>
            <Trophy size={20} color="#FBBF24" style={{ margin: '0 auto 6px auto' }} />
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#FFF' }}>{user?.puntos || 0}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Puntos</div>
          </div>

          <div className="flutter-card" style={{ padding: '14px 10px', textAlign: 'center' }}>
            <Star size={20} color="#FBBF24" style={{ margin: '0 auto 6px auto' }} />
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#FFF' }}>{user?.rating || 5.0} ★</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Calificación</div>
          </div>

          <div className="flutter-card" style={{ padding: '14px 10px', textAlign: 'center' }}>
            <Car size={20} color="var(--accent-blue)" style={{ margin: '0 auto 6px auto' }} />
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#FFF' }}>{user?.nivel || 'Nivel 1'}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nivel</div>
          </div>
        </div>

        {/* Profile Info Fields / Edit Mode */}
        {isEditing ? (
          <form onSubmit={handleSave} className="flutter-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px', color: 'var(--primary-orange-light)' }}>
              Actualizar Datos Reales
            </h3>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Nombre</label>
              <input
                type="text"
                className="flutter-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Teléfono</label>
              <input
                type="tel"
                className="flutter-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Correo</label>
              <input
                type="email"
                className="flutter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-flutter-primary" style={{ marginTop: '8px' }} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Cambios en Firebase'}
            </button>
          </form>
        ) : (
          <div className="flutter-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} color="var(--primary-orange-light)" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nombre Completo</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>{user?.displayName || 'No especificado'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={18} color="var(--accent-green)" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Teléfono Móvil</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>{user?.phone || user?.phoneNumber || 'No especificado'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={18} color="var(--accent-blue)" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Correo Electrónico</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFF' }}>{user?.email || 'No especificado'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="btn-flutter-secondary"
          style={{ borderColor: '#EF4444', color: '#EF4444', marginTop: '12px' }}
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
