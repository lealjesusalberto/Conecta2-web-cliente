import React, { useState, useEffect } from 'react';
import { ArrowLeft, Navigation, Gift } from 'lucide-react';
import Header from '../components/Header';
import MapView from '../components/MapView';
import AddressSearch from '../components/AddressSearch';
import VehicleSelector from '../components/VehicleSelector';
import ActiveRideModal from '../components/ActiveRideModal';

import { 
  getRidePricingConfig, 
  calculateHaversineDistance, 
  requestRide, 
  listenToRideStatus, 
  cancelRide,
  createRidePreview,
  deleteRidePreview
} from '../services/rideService';

export default function MainMicrotrabajosScreen({ user, onOpenAuth, onOpenRewards, onOpenInstall, isPwaInstalled }) {
  const [modalStep, setModalStep] = useState(1);

  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState('auto');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [activeSelectionMode, setActiveSelectionMode] = useState(null);

  const [pricingConfig, setPricingConfig] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [activeRideId, setActiveRideId] = useState(null);
  const [activeNodeName, setActiveNodeName] = useState(null);
  const [activePreviewId, setActivePreviewId] = useState(null);

  useEffect(() => {
    getRidePricingConfig().then((config) => {
      setPricingConfig(config);
    });
  }, []);

  const distanciaKm = (origen && destino)
    ? calculateHaversineDistance(origen.lat, origen.lng, destino.lat, destino.lng)
    : 1.0;

  const handleLocationSelectedFromMap = (mode, location) => {
    if (mode === 'origen') setOrigen(location);
    else if (mode === 'destino') setDestino(location);
    setActiveSelectionMode(null);
  };

  const handleContinueToVehicles = async () => {
    if (!origen || !destino) {
      alert('Por favor selecciona el Origen (Punto A) y el Destino (Punto B)');
      return;
    }
    setModalStep(2);

    if (user) {
      const previewId = await createRidePreview({
        user,
        transporteType: selectedVehicleType,
        origen,
        destino,
        distanciaKm
      });
      setActivePreviewId(previewId);
    }
  };

  const handleBackToAddresses = () => {
    if (activePreviewId) {
      deleteRidePreview(activePreviewId);
      setActivePreviewId(null);
    }
    setModalStep(1);
  };

  const handleConfirmRide = async (precioUsd) => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!origen || !destino) {
      alert('Por favor selecciona la ubicación de Origen y Destino');
      return;
    }

    try {
      const { rideId, nodeName, tipo } = await requestRide({
        user,
        transporteType: selectedVehicleType,
        origen,
        destino,
        precioUsd,
        tasaBcv: pricingConfig?.tasaBcv || 50.0,
        distanciaKm,
        metodoPago,
        previewId: activePreviewId
      });

      setActivePreviewId(null);
      setActiveRideId(rideId);
      setActiveNodeName(nodeName);

      // Escuchador en vivo multi-nodo
      listenToRideStatus(
        nodeName, 
        rideId, 
        (updatedData) => {
          setActiveRide(updatedData);
        },
        user?.uid
      );
    } catch (error) {
      console.error('❌ Error al solicitar viaje:', error);
      alert('No se pudo procesar la solicitud de viaje: ' + error.message);
    }
  };

  const handleCancelRide = () => {
    if (activePreviewId) {
      deleteRidePreview(activePreviewId);
      setActivePreviewId(null);
    }
    if (activeRideId) {
      cancelRide(activeNodeName, activeRideId, user?.uid, selectedVehicleType);
    }
    setActiveRide(null);
    setActiveRideId(null);
    setActiveNodeName(null);
    setModalStep(1);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* 1. Fullscreen Map */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <MapView
          origen={origen}
          destino={destino}
          conductorLocation={activeRide?.conductor_lat && activeRide?.conductor_lng ? { lat: activeRide.conductor_lat, lng: activeRide.conductor_lng } : null}
          conductorType={selectedVehicleType}
          activeSelectionMode={activeSelectionMode}
          onLocationSelected={handleLocationSelectedFromMap}
        />
      </div>

      {/* 2. Top Floating App Bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <Header
          user={user}
          pricingConfig={pricingConfig}
          onOpenAuth={onOpenAuth}
          onOpenRewards={onOpenRewards}
          onOpenInstall={onOpenInstall}
          isPwaInstalled={isPwaInstalled}
        />
      </div>

      {/* 3. Floating Rewards Button (Solo cuando no hay viaje activo) */}
      {!activeRide && (
        <button
          onClick={onOpenRewards}
          style={{
            position: 'absolute',
            right: '16px',
            bottom: modalStep === 2 ? 'calc(55vh + 10px)' : 'calc(35vh + 10px)',
            zIndex: 1000,
            background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
            border: '2px solid #FFF',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.5)',
            color: '#0A0E1A',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          title="Catálogo de Premios"
        >
          <Gift size={24} color="#0F172A" />
        </button>
      )}

      {/* 4. Bottom Search Sheet (Solo cuando NO hay un viaje activo) */}
      {!activeRide && (
        <div className="flutter-sheet animate-sheet-up" style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000, 
          maxHeight: '75vh', 
          overflowY: 'auto',
          background: '#1E293B',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.6)',
          paddingBottom: '24px'
        }}>
          {/* PASO 1: Ingresar Origen y Destino */}
          {modalStep === 1 && (
            <div>
              <AddressSearch
                origen={origen}
                destino={destino}
                onSelectOrigen={setOrigen}
                onSelectDestino={setDestino}
                activeSelectionMode={activeSelectionMode}
                setActiveSelectionMode={setActiveSelectionMode}
              />

              <div style={{ padding: '0 16px' }}>
                <button
                  onClick={handleContinueToVehicles}
                  disabled={!origen || !destino}
                  className="btn-flutter-primary"
                  style={{
                    opacity: (!origen || !destino) ? 0.6 : 1,
                    cursor: (!origen || !destino) ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Navigation size={18} />
                  <span>{origen && destino ? 'Confirmar Destino y Cotizar ➔' : 'Ingresa Origen y Destino'}</span>
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: Cotizar Tarifas y Elegir Vehículo */}
          {modalStep === 2 && (
            <div>
              <div style={{ padding: '12px 16px 4px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  onClick={handleBackToAddresses}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-orange-light)',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Modificar Direcciones</span>
                </button>

                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Paso 2 de 2
                </span>
              </div>

              <VehicleSelector
                selectedType={selectedVehicleType}
                onSelectType={setSelectedVehicleType}
                distanciaKm={distanciaKm}
                pricingConfig={pricingConfig}
                metodoPago={metodoPago}
                setMetodoPago={setMetodoPago}
                onConfirmRide={handleConfirmRide}
                disabled={!origen || !destino}
                hasLocations={Boolean(origen && destino)}
              />
            </div>
          )}
        </div>
      )}

      {/* 5. Active Ride Overlays (Superior, Inferior y Live Chat Modal) */}
      <ActiveRideModal
        rideData={activeRide}
        user={user}
        onCancelRide={handleCancelRide}
      />
    </div>
  );
}
