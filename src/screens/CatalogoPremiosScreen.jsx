import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Tag, Gift, Check, Search, History, Star } from 'lucide-react';
import { ref, onValue, get, update, push } from 'firebase/database';
import { database } from '../config/firebase';

export default function CatalogoPremiosScreen({ user, onGoBack }) {
  const [premios, setPremios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState('Todos');
  const [misCanjes, setMisCanjes] = useState([]);
  const [tab, setTab] = useState('catalogo');
  const [canjeando, setCanjeando] = useState(false);

  const categorias = ['Todos', 'Comida', 'Accesorios', 'Descuentos', 'Servicios', 'Otros'];
  const userPuntos = user?.puntos || 0;

  // Escuchar premios desde Firebase RTDB /catalogo_premios filtrando exclusivamente los premios para CLIENTES
  useEffect(() => {
    const premiosRef = ref(database, 'catalogo_premios');
    const unsubscribe = onValue(premiosRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loaded = [];

        Object.keys(data).forEach((key) => {
          const p = data[key];
          
          // Extraer propiedad de visibilidad (Flutter usa visible_for / visibleFor)
          const visibleFor = (
            p.visible_for || 
            p.visibleFor || 
            p.visible_para || 
            p.para || 
            p.rol_destino || 
            p.rol || 
            'ambos'
          ).toString().toLowerCase().trim();

          // 1. Exclusión estricta si está asignado a 'conductor' o 'conductores'
          if (visibleFor === 'conductor' || visibleFor === 'conductores') {
            return;
          }

          // 2. Filtro adicional de seguridad sobre título, descripción y categoría
          const textCheck = (
            (p.titulo || '') + ' ' + 
            (p.nombre || '') + ' ' + 
            (p.descripcion || '') + ' ' + 
            (p.categoria || '')
          ).toLowerCase();

          if (textCheck.includes('conductor') || textCheck.includes('chofer') || textCheck.includes('membresia conductor')) {
            return; // No incluir si es de conductor
          }

          // El premio es válido para el cliente ('cliente', 'ambos' o general)
          if (p.activo !== false) {
            loaded.push({
              id: key,
              ...p
            });
          }
        });

        setPremios(loaded);
      } else {
        // Fallback demostrativo de premios exclusivos para clientes
        setPremios([
          {
            id: 'mock_1',
            titulo: '1 Viaje Gratis (Hasta $3.00)',
            descripcion: 'Canjea tus puntos por un viaje completo gratis en Conecta2 Auto o Moto.',
            costo_puntos: 200,
            puntos_requeridos: 200,
            categoria: 'Descuentos',
            imagen_url: '/assets/c2_launch.png',
            visible_for: 'cliente'
          },
          {
            id: 'mock_2',
            titulo: 'Descuento $1.50 en tu próximo viaje',
            descripcion: 'Aplica un cupón de $1.50 de descuento directo en la tarifa de tu viaje.',
            costo_puntos: 100,
            puntos_requeridos: 100,
            categoria: 'Descuentos',
            imagen_url: '/assets/c2_launch.png',
            visible_for: 'cliente'
          },
          {
            id: 'mock_3',
            titulo: 'Combo Conecta2 Snack & Bebida',
            descripcion: 'Reclama tu snack y bebida en comercios aliados presentando tu código de canje.',
            costo_puntos: 150,
            puntos_requeridos: 150,
            categoria: 'Comida',
            imagen_url: '/assets/c2_launch.png',
            visible_for: 'ambos'
          }
        ]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Escuchar mis canjes en Firebase RTDB
  useEffect(() => {
    if (!user || !user.uid) return;
    const canjesRef = ref(database, `canjes_premios/${user.uid}`);
    const unsubscribe = onValue(canjesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key]
        }));
        setMisCanjes(list.reverse());
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleCanjear = async (premio) => {
    if (!user || !user.uid) {
      alert('Debes iniciar sesión para canjear premios.');
      return;
    }

    const reqPuntos = Number(premio.costo_puntos || premio.puntos_requeridos || premio.puntos || 0);

    if (userPuntos < reqPuntos) {
      alert(`No tienes suficientes puntos. Necesitas ${reqPuntos} Pts y tienes ${userPuntos} Pts.`);
      return;
    }

    setCanjeando(true);
    try {
      const nuevosPuntos = userPuntos - reqPuntos;
      const codigoCanje = 'C2-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      // 1. Descontar puntos del cliente en /users/{uid}
      const updates = {};
      updates[`users/${user.uid}/puntos_actuales`] = nuevosPuntos;
      updates[`users/${user.uid}/puntos`] = nuevosPuntos;

      // 2. Registrar canje en /canjes_premios/{uid}
      const canjeRef = push(ref(database, `canjes_premios/${user.uid}`));
      const canjeData = {
        canje_id: canjeRef.key,
        premio_id: premio.id,
        titulo: premio.titulo || premio.nombre,
        puntos: reqPuntos,
        codigo_canje: codigoCanje,
        estado: 'pendiente',
        timestamp: Date.now()
      };

      await update(ref(database), updates);
      await canjeRef.set(canjeData);

      alert(`🎉 ¡Canje Exitoso!\nTu código de canje es: ${codigoCanje}\nSe descontaron ${reqPuntos} Pts.`);
    } catch (error) {
      console.error('Error al canjear premio:', error);
      alert('No se pudo completar el canje: ' + error.message);
    } finally {
      setCanjeando(false);
    }
  };

  const filteredPremios = categoria === 'Todos'
    ? premios
    : premios.filter((p) => p.categoria === categoria);

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
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#0F172A',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onGoBack}
            style={{
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
          <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#FFF' }}>
            Premios para Clientes
          </h1>
        </div>

        {/* Puntos Disponibles Badge */}
        <div style={{
          background: 'rgba(251, 191, 36, 0.15)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '16px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: '#FBBF24',
          fontWeight: 800,
          fontSize: '13px'
        }}>
          <Trophy size={16} />
          <span>{userPuntos} Pts</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', padding: '12px 20px 0 20px', gap: '10px' }}>
        <button
          onClick={() => setTab('catalogo')}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '14px',
            border: 'none',
            background: tab === 'catalogo' ? 'var(--primary-orange)' : 'rgba(255,255,255,0.06)',
            color: '#FFF',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Gift size={16} />
          <span>Premios de Clientes</span>
        </button>

        <button
          onClick={() => setTab('mis_canjes')}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '14px',
            border: 'none',
            background: tab === 'mis_canjes' ? 'var(--primary-orange)' : 'rgba(255,255,255,0.06)',
            color: '#FFF',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <History size={16} />
          <span>Mis Canjes ({misCanjes.length})</span>
        </button>
      </div>

      {tab === 'catalogo' ? (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Categorías Filter */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingBottom: '4px' }}>
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                style={{
                  background: categoria === cat ? 'var(--primary-gradient)' : '#1E293B',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  color: '#FFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid de Premios Exclusivos de Clientes */}
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
              Cargando catálogo de clientes...
            </div>
          ) : filteredPremios.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
              No hay premios disponibles para clientes en esta categoría.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
              {filteredPremios.map((premio) => {
                const reqPuntos = Number(premio.costo_puntos || premio.puntos_requeridos || premio.puntos || 0);
                const tieneSuficiente = userPuntos >= reqPuntos;

                return (
                  <div
                    key={premio.id}
                    className="flutter-card"
                    style={{
                      height: '140px',
                      display: 'flex',
                      alignItems: 'stretch',
                      background: 'rgba(30, 41, 59, 0.7)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      width: '40%',
                      background: 'transparent',
                      display: 'flex',
                      flexShrink: 0
                    }}>
                      <img
                        src={premio.imagen_url || premio.imagenUrl || '/assets/c2_launch.png'}
                        alt={premio.titulo}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{ width: '60%', padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-blue)', fontWeight: 800, padding: '2px 6px', borderRadius: '6px' }}>
                          {premio.categoria || 'Cliente'}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#FFF', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {premio.titulo || premio.nombre}
                      </h3>

                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.2', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {premio.descripcion}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 900, color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Trophy size={12} color="#FBBF24" /> {reqPuntos} Pts
                        </span>

                        <button
                          onClick={() => handleCanjear(premio)}
                          disabled={!tieneSuficiente || canjeando}
                          style={{
                            background: tieneSuficiente ? 'var(--primary-gradient)' : '#334155',
                            opacity: tieneSuficiente ? 1 : 0.6,
                            border: 'none',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            color: '#FFF',
                            fontSize: '10px',
                            fontWeight: 800,
                            cursor: tieneSuficiente ? 'pointer' : 'not-allowed'
                          }}
                        >
                          {tieneSuficiente ? 'Canjear' : 'Faltan Puntos'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Mis Canjes View */
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {misCanjes.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
              No has canjeado ningún premio aún.
            </div>
          ) : (
            misCanjes.map((canje) => (
              <div key={canje.id} className="flutter-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#FFF' }}>{canje.titulo}</h4>
                  <span style={{ fontSize: '11px', background: 'rgba(34, 197, 94, 0.15)', color: 'var(--accent-green)', fontWeight: 800, padding: '3px 8px', borderRadius: '8px' }}>
                    {canje.estado || 'Canjeado'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--primary-orange-light)', fontWeight: 800, marginTop: '6px' }}>
                  Código: {canje.codigo_canje}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Descontados: {canje.puntos} Pts • {new Date(canje.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
