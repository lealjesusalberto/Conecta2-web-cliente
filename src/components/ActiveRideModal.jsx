import React, { useState } from 'react';
import { Radar, Phone, Star, X, CheckCircle, MessageSquare, Car, MapPin, Navigation, Clock } from 'lucide-react';
import ChatModal from './ChatModal';

export default function ActiveRideModal({ rideData, user, onCancelRide }) {
  const [rating, setRating] = useState(5);
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (!rideData) return null;

  const estado = (rideData.estado_microservicio || rideData.estado || '').toString().toLowerCase();
  const isPending = estado === 'pendiente' || (rideData.disponible === true && estado !== 'aceptado' && estado !== 'proceso' && estado !== 'en_camino' && estado !== 'recoger_pasajero' && estado !== 'completado' && estado !== 'finalizado');
  const isAccepted = (estado === 'aceptado' || estado === 'proceso' || estado === 'en_camino' || estado === 'recoger_pasajero' || estado === 'activo') && estado !== 'completado' && estado !== 'finalizado';
  const isCompleted = estado === 'completado' || estado === 'finalizado';

  const conductorNombre = rideData.conductor_nombre || rideData.nombre_conductor || 'Conductor Conecta2';
  const conductorFoto = rideData.foto_conductor || rideData.conductor_foto;
  const conductorTelefono = rideData.telefono_conductor || rideData.conductor_telefono;
  const conductorPlaca = rideData.placa_vehiculo || rideData.conductor_placa || 'PLACA';
  const conductorModelo = rideData.modelo_vehiculo || rideData.conductor_vehiculo || (rideData.transporte?.includes('moto') ? 'Moto' : 'Auto');
  
  const precioUsd = rideData.precio || rideData.precio_usd || '0.00';
  const precioUsdNum = Number(precioUsd) || 0;
  const tasaBcvNum = Number(rideData.tasa_bcv) || 50;
  
  // Forzar cálculo exacto siempre (ignorar el valor de Firebase que puede venir erróneo desde Flutter)
  const precioBs = (precioUsdNum * tasaBcvNum).toFixed(2);

  // Configuración de estado idéntica a Flutter MicroservicioOverlaySuperior
  const getStatusConfig = () => {
    switch (estado) {
      case 'recoger_pasajero':
        return {
          texto: 'Llegó a tu ubicación',
          subtexto: `Conductor: ${conductorNombre}`,
          color: '#A855F7',
          bgColor: 'rgba(168, 85, 247, 0.18)',
          Icon: MapPin
        };
      case 'proceso':
      case 'en_camino':
        return {
          texto: 'En camino hacia tu destino',
          subtexto: `Conductor: ${conductorNombre}`,
          color: '#38BDF8',
          bgColor: 'rgba(56, 189, 248, 0.18)',
          Icon: Navigation
        };
      case 'aceptado':
      case 'activo':
      default:
        return {
          texto: 'Conductor asignado en camino',
          subtexto: `Conductor: ${conductorNombre}`,
          color: '#22C55E',
          bgColor: 'rgba(34, 197, 94, 0.18)',
          Icon: Car
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.Icon;

  return (
    <>
      {/* 1. ESTADO PENDIENTE: Radar Buscando Conductor */}
      {isPending && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="flutter-sheet animate-sheet-up" style={{
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            textAlign: 'center',
            borderRadius: '28px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(241, 95, 2, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: '2px solid var(--primary-orange)'
            }} className="pulse-glow">
              <Radar size={40} color="var(--primary-orange-light)" />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '6px', color: '#FFF' }}>
              Buscando conductor cercano...
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Notificando a la flota de conductores disponibles de Conecta2.
            </p>

            <div className="flutter-card" style={{ padding: '14px', fontSize: '13px', textAlign: 'left', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vehículo:</span>
                <strong style={{ textTransform: 'capitalize', color: '#FFF' }}>{rideData.transporte}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Monto a pagar:</span>
                <strong style={{ color: 'var(--accent-green)' }}>${precioUsd} ({precioBs} Bs)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Método de pago:</span>
                <strong style={{ color: '#FFF' }}>{rideData.metodo_pago || 'Efectivo'}</strong>
              </div>
            </div>

            <button
              onClick={onCancelRide}
              className="btn-flutter-secondary"
              style={{ borderColor: '#EF4444', color: '#EF4444' }}
            >
              <X size={16} />
              <span>Cancelar Solicitud</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. OVERLAY SUPERIOR E INFERIOR: Diseño Réplica Flutter */}
      {isAccepted && (
        <>
          {/* Overlay Superior Flotante Estilo Flutter (Placard debajo del Header) */}
          <div style={{
            position: 'fixed',
            top: '84px',
            left: '16px',
            right: '16px',
            zIndex: 1500,
            display: 'flex',
            justifyContent: 'center'
          }}>
            <div className="flutter-sheet animate-sheet-down" style={{
              width: '100%',
              maxWidth: '400px',
              padding: '12px 16px',
              borderRadius: '20px',
              background: '#0F172A',
              border: `1.5px solid ${statusConfig.color}`,
              boxShadow: `0 8px 24px rgba(0, 0, 0, 0.6), 0 0 15px ${statusConfig.color}40`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {/* Icono de Estado Tintado */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '14px',
                background: statusConfig.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: statusConfig.color,
                flexShrink: 0
              }}>
                <StatusIcon size={22} />
              </div>

              {/* Columna de Texto Estado y Subtítulo */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 900,
                  color: '#FFF',
                  lineHeight: '1.2',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {statusConfig.texto}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginTop: '2px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {statusConfig.subtexto}
                </div>
              </div>

              {/* Botón de Chat 💬 */}
              <button
                onClick={() => setIsChatOpen(true)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--primary-gradient)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  boxShadow: '0 4px 12px rgba(241, 95, 2, 0.4)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  position: 'relative'
                }}
                title="Abrir Chat con Conductor"
              >
                <MessageSquare size={18} />
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: 'var(--accent-green)',
                  border: '2px solid #0F172A'
                }}></span>
              </button>
            </div>
          </div>

          {/* Overlay Inferior Flotante (Conductor Asignado) */}
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1500,
            padding: '16px'
          }}>
            <div className="flutter-sheet animate-sheet-up" style={{
              width: '100%',
              maxWidth: '440px',
              margin: '0 auto',
              padding: '20px',
              borderRadius: '28px',
              boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.7)'
            }}>
              {/* Header Conductor */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <div style={{
                  position: 'relative',
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'var(--primary-gradient)',
                  padding: '2px',
                  boxShadow: 'var(--shadow-glow)',
                  flexShrink: 0
                }}>
                  {conductorFoto ? (
                    <img
                      src={conductorFoto}
                      alt={conductorNombre}
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
                      fontSize: '22px'
                    }}>
                      {conductorNombre.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#FFF' }}>
                      {conductorNombre}
                    </h3>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', color: '#FBBF24', fontWeight: 800 }}>
                      <Star size={13} fill="#FBBF24" /> 4.9
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {conductorModelo} • <span style={{ color: 'var(--primary-orange-light)', fontWeight: 800 }}>{conductorPlaca}</span>
                  </p>
                </div>

                {conductorTelefono && (
                  <a
                    href={`tel:${conductorTelefono}`}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(34, 197, 94, 0.18)',
                      border: '1.5px solid var(--accent-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-green)'
                    }}
                    title="Llamar Conductor"
                  >
                    <Phone size={20} />
                  </a>
                )}
              </div>

              {/* Detalle Ruta y Tarifa */}
              <div className="flutter-card" style={{ padding: '12px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Monto Acordado</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary-orange-light)' }}>
                    ${precioUsd} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({precioBs} Bs)</span>
                  </div>
                </div>
                <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-blue)', fontWeight: 800, padding: '4px 10px', borderRadius: '10px' }}>
                  {rideData.metodo_pago || 'Efectivo'}
                </span>
              </div>

              <button
                onClick={onCancelRide}
                className="btn-flutter-secondary"
                style={{ borderColor: '#EF4444', color: '#EF4444' }}
              >
                <span>Cancelar Viaje</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* 3. MODAL DE COMPLETADO: Diálogo Celebración Viaje Finalizado */}
      {isCompleted && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 14, 26, 0.92)',
          backdropFilter: 'blur(12px)',
          zIndex: 3500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="flutter-sheet animate-sheet-up" style={{
            width: '100%',
            maxWidth: '380px',
            padding: '24px',
            borderRadius: '28px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.18)',
              border: '2.5px solid var(--accent-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)'
            }}>
              <CheckCircle size={42} color="var(--accent-green)" />
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '6px', color: '#FFF' }}>
              ¡Viaje Completado!
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Has llegado a tu destino. Gracias por viajar con Conecta2.
            </p>

            <div className="flutter-card" style={{ padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Monto Total Pagado</div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--accent-green)' }}>
                ${precioUsd}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>
                {precioBs} Bs
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', color: '#FFF', fontWeight: 700, marginBottom: '8px' }}>
                Califica tu experiencia con {conductorNombre}:
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <Star
                      size={28}
                      fill={star <= rating ? '#FBBF24' : 'none'}
                      color={star <= rating ? '#FBBF24' : '#475569'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onCancelRide}
              className="btn-flutter-primary"
            >
              <span>Aceptar y Continuar</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de Chat en Vivo con Conductor */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        rideId={rideData.id || rideData.microservicio_id}
        activoId={rideData.activo_id || rideData.activoId}
        user={user}
        conductorNombre={conductorNombre}
      />
    </>
  );
}
