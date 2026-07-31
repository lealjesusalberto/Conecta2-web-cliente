import React from 'react';
import { Wallet, CheckCircle2, Navigation, Clock } from 'lucide-react';

export default function VehicleSelector({ 
  selectedType, 
  onSelectType, 
  distanciaKm, 
  pricingConfig, 
  metodoPago, 
  setMetodoPago, 
  onConfirmRide,
  disabled,
  hasLocations 
}) {
  const tasaBcv = pricingConfig?.tasaBcv || 50.0;

  // Calculo Tarifas según la app Flutter (incrementos de 500mts)
  const calcularPrecio = (tipo) => {
    const precioBase = tipo === 'auto' ? (pricingConfig?.precioBaseAuto ?? 2.5) : (pricingConfig?.precioBaseMoto ?? 1.2);
    const distanciaMinima = tipo === 'auto' ? 1.5 : 1.0;
    
    let precioTotal = precioBase;

    if (distanciaKm > distanciaMinima) {
      const metrosAdicionales = (distanciaKm - distanciaMinima) * 1000;
      const incrementos = Math.ceil(metrosAdicionales / 500);
      const precioPorIncremento = tipo === 'auto' 
        ? (pricingConfig?.precioAutoExpress ?? 0.40) 
        : (pricingConfig?.precioMotoExpress ?? 0.11);
      
      precioTotal += incrementos * precioPorIncremento;
    }

    return parseFloat(precioTotal.toFixed(2));
  };

  const autoUsd = calcularPrecio('auto');
  const autoBs = autoUsd * tasaBcv;

  const motoUsd = calcularPrecio('moto');
  const motoBs = motoUsd * tasaBcv;


  const currentUsd = selectedType === 'auto' ? autoUsd : motoUsd;

  return (
    <div style={{
      padding: '0 16px 16px 16px',
      margin: '0',
      width: '100%'
    }}>
      {/* Header Tarifas & BCV */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} color="var(--primary-orange-light)" />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>
            {hasLocations ? `Distancia: ${distanciaKm.toFixed(1)} km` : 'Selecciona el transporte'}
          </span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--accent-blue)', background: 'rgba(56, 189, 248, 0.12)', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
          Tasa BCV: {tasaBcv.toFixed(2)} Bs/$
        </span>
      </div>

      {/* Vehicle Options Cards (Exact Flutter Design) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
        {/* Option 1: Auto Express */}
        <div
          onClick={() => onSelectType('auto')}
          className="flutter-card"
          style={{
            padding: '16px',
            cursor: 'pointer',
            border: selectedType === 'auto' ? '2px solid var(--primary-orange)' : '1px solid rgba(255,255,255,0.08)',
            background: selectedType === 'auto' ? 'rgba(241, 95, 2, 0.15)' : 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'rgba(241, 95, 2, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img 
                src="/assets/car-v.png" 
                alt="Auto Express" 
                style={{ width: '42px', height: '42px', objectFit: 'contain' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#FFF' }}>Auto Express</h3>
                <span style={{ fontSize: '10px', background: 'rgba(34, 197, 94, 0.15)', color: 'var(--accent-green)', fontWeight: 800, padding: '2px 6px', borderRadius: '6px' }}>
                  ~ 4 min
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Cómodo y climatizado (4 puestos)
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary-orange-light)' }}>
              ${autoUsd.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
              {autoBs.toFixed(2)} Bs
            </div>
          </div>
        </div>

        {/* Option 2: Moto Express */}
        <div
          onClick={() => onSelectType('moto')}
          className="flutter-card"
          style={{
            padding: '16px',
            cursor: 'pointer',
            border: selectedType === 'moto' ? '2px solid var(--primary-orange)' : '1px solid rgba(255,255,255,0.08)',
            background: selectedType === 'moto' ? 'rgba(241, 95, 2, 0.15)' : 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'rgba(241, 95, 2, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img 
                src="/assets/moto-v.png" 
                alt="Moto Express" 
                style={{ width: '42px', height: '42px', objectFit: 'contain' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#FFF' }}>Moto Express</h3>
                <span style={{ fontSize: '10px', background: 'rgba(34, 197, 94, 0.15)', color: 'var(--accent-green)', fontWeight: 800, padding: '2px 6px', borderRadius: '6px' }}>
                  ~ 2 min
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Rápido y económico (1 puesto)
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary-orange-light)' }}>
              ${motoUsd.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
              {motoBs.toFixed(2)} Bs
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Método de Pago */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', background: '#0F172A', padding: '10px 14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
          <Wallet size={16} color="var(--primary-orange-light)" />
          <span>Método de Pago:</span>
        </div>
        <select
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
          className="flutter-input"
          style={{ width: 'auto', padding: '6px 12px', fontSize: '13px', background: '#1E293B' }}
        >
          <option value="Efectivo">💵 Efectivo</option>
          <option value="Pago Móvil">📱 Pago Móvil</option>
        </select>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={() => onConfirmRide(currentUsd)}
        disabled={disabled}
        className="btn-flutter-primary"
        style={{
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      >
        {hasLocations ? (
          <>
            <Navigation size={18} />
            <span>Pedir {selectedType === 'auto' ? 'Auto Express' : 'Moto Express'}</span>
            <span style={{ background: 'rgba(255,255,255,0.22)', padding: '2px 10px', borderRadius: '10px', fontSize: '15px', fontWeight: 900 }}>
              ${currentUsd.toFixed(2)}
            </span>
          </>
        ) : (
          <span>Ingresa Origen y Destino</span>
        )}
      </button>
    </div>
  );
}
