import React, { useState, useEffect } from 'react';
import { ArrowLeft, Navigation, Gift } from 'lucide-react';
import Header from '../components/Header';
import MapView from '../components/MapView';
import AddressSearch from '../components/AddressSearch';
import VehicleSelector from '../components/VehicleSelector';
import ActiveRideModal from '../components/ActiveRideModal';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';

import { 
  getRidePricingConfig, 
  calculateHaversineDistance, 
  requestRide, 
  listenToRideStatus, 
  cancelRide,
  createRidePreview,
  deleteRidePreview,
  checkActiveRideOnMount
} from '../services/rideService';

export default function MainMicrotrabajosScreen({ user, onOpenAuth, onOpenRewards, onOpenInstall, isPwaInstalled }) {
  const [modalStep, setModalStep] = useState(1);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

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
  const [availableDrivers, setAvailableDrivers] = useState([]);

  useEffect(() => {
    getRidePricingConfig().then((config) => {
      setPricingConfig(config);
    });
  }, []);

  // Verificar si hay un viaje activo al cargar la aplicación
  useEffect(() => {
    if (user && user.uid) {
      checkActiveRideOnMount(user.uid).then((rideInfo) => {
        if (rideInfo) {
          setActiveRideId(rideInfo.rideId);
          setActiveNodeName(rideInfo.nodeName);
          setSelectedVehicleType(rideInfo.tipo);
          setModalStep(2);
          
          if (rideInfo.data) {
            setActiveRide(rideInfo.data);
            
            // Restaurar origen y destino buscando todas las posibles variaciones de nombres de variables
            const oLat = Number(rideInfo.data.origen_lat || rideInfo.data.latitudOrigen || rideInfo.data.origenLat || rideInfo.data.origen_latitude || rideInfo.data.latitude || 0);
            const oLng = Number(rideInfo.data.origen_lng || rideInfo.data.longitudOrigen || rideInfo.data.origenLng || rideInfo.data.origen_longitude || rideInfo.data.longitude || 0);
            
            const dLat = Number(rideInfo.data.destino_lat || rideInfo.data.latitudDestino || rideInfo.data.destinoLat || rideInfo.data.destino_latitude || rideInfo.data.latitudeDestino || 0);
            const dLng = Number(rideInfo.data.destino_lng || rideInfo.data.longitudDestino || rideInfo.data.destinoLng || rideInfo.data.destino_longitude || rideInfo.data.longitudeDestino || 0);
            
            if (oLat !== 0 && oLng !== 0) {
              setOrigen({
                lat: oLat,
                lng: oLng,
                address: rideInfo.data.origen_nombre || rideInfo.data.ubicacionActual || 'Origen'
              });
            }
            if (dLat !== 0 && dLng !== 0) {
              setDestino({
                lat: dLat,
                lng: dLng,
                address: rideInfo.data.destino_nombre || rideInfo.data.ubicacionDestino || 'Destino'
              });
            }
          }

          listenToRideStatus(
            rideInfo.nodeName,
            rideInfo.rideId,
            (updatedData) => {
              setActiveRide(updatedData);
            },
            user.uid
          );
        }
      });
    }
  }, [user]);

  // Escuchar la ubicación en vivo del conductor asignado
  useEffect(() => {
    if (!activeRide) {
      setLiveDriverLocation(null);
      return;
    }
    const cid = activeRide.conductor_id || activeRide.idConductor || activeRide.id_conductor || activeRide.conductorId || activeRide.conductor;
    if (!cid) return;

    const driverRef = ref(database, `usuarios_activos_microservicios/${cid}`);
    const unsubscribe = onValue(driverRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.lat && data.lng) {
          setLiveDriverLocation({ lat: Number(data.lat), lng: Number(data.lng) });
        } else if (data.latitude && data.longitude) {
          setLiveDriverLocation({ lat: Number(data.latitude), lng: Number(data.longitude) });
        }
      }
    });

    return () => unsubscribe();
  }, [activeRide?.conductor_id, activeRide?.idConductor, activeRide?.id_conductor, activeRide?.conductorId, activeRide?.conductor]);

  // Escuchar a todos los conductores disponibles (auto y moto) simultáneamente
  useEffect(() => {
    const nodoRef = ref(database, `conductores_listos_mapa`);
    
    const unsubscribe = onValue(nodoRef, (snapshot) => {
      console.log('--- FIREBASE DATA RECEIVED ---', snapshot.exists());
      if (!snapshot.exists()) {
        setAvailableDrivers([]);
        return;
      }
      const data = snapshot.val();
      console.log('DATA:', data);
      const driversArray = [];
      const nowMs = Date.now();
      const hace2h = nowMs - (4 * 60 * 60 * 1000); // 4 horas máximo (solicitado)

      // data contiene { auto: {...}, moto: {...} }
      for (const tipoVehiculo in data) {
        const conductores = data[tipoVehiculo];
        
        for (const key in conductores) {
          const conductor = conductores[key];
          const lat = parseFloat(conductor.latitude);
          const lng = parseFloat(conductor.longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          // Filtrar por heartbeat (2 horas máximo de inactividad)
          let heartbeatMs = null;
          if (conductor.heartbeat_timestamp) {
            const hb = conductor.heartbeat_timestamp;
            if (typeof hb === 'number') {
              heartbeatMs = hb;
            } else {
              const asInt = parseInt(hb, 10);
              if (!isNaN(asInt) && asInt > 1000000000000) {
                heartbeatMs = asInt;
              } else {
                const parsedDate = new Date(hb).getTime();
                if (!isNaN(parsedDate)) {
                   heartbeatMs = parsedDate;
                }
              }
            }
          }
          
          if (heartbeatMs !== null && heartbeatMs < hace2h) {
             continue; // Ignorar conductor con más de 2 horas sin heartbeat
          }

          driversArray.push({
            id: key,
            type: tipoVehiculo, // 'auto' o 'moto'
            lat: lat,
            lng: lng,
            name: conductor.name || 'Conductor'
          });
        } else {
           console.log('Skipped due to NaN or lat/lng missing', conductor);
        }
        }
      }
      
      console.log('Final driversArray:', driversArray);
      setAvailableDrivers(driversArray);
    });

    return () => unsubscribe();
  }, []); // Ya no depende de selectedVehicleType, siempre carga ambos

  // Aplicar filtro de distancia (5km) y límite (60 marcadores)
  const filteredAvailableDrivers = React.useMemo(() => {
    if (!origen) return []; // Si no hay ubicación del cliente, no mostrar conductores (igual que Flutter)
    
    let filtered = availableDrivers.filter(driver => {
      const distKm = calculateHaversineDistance(origen.lat, origen.lng, driver.lat, driver.lng);
      return distKm <= 5.0; // Radio visual de 5km
    });
    
    // Ordenar por cercanía
    filtered.sort((a, b) => {
      const distA = calculateHaversineDistance(origen.lat, origen.lng, a.lat, a.lng);
      const distB = calculateHaversineDistance(origen.lat, origen.lng, b.lat, b.lng);
      return distA - distB;
    });
    
    return filtered.slice(0, 60);
  }, [availableDrivers, origen]);

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
    
    // Validación de seguridad: el usuario debe estar aprobado por el administrador
    if (user.estado !== 'activo') {
      setShowVerificationModal(true);
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
    setOrigen(null);
    setDestino(null);
    setModalStep(1);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* 1. Fullscreen Map */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <MapView
          origen={origen}
          destino={destino}
          conductorLocation={(() => {
            if (liveDriverLocation) return liveDriverLocation;
            if (!activeRide) return null;
            const lat = Number(activeRide.conductor_lat || activeRide.latitudConductor || activeRide.conductorLat || 0);
            const lng = Number(activeRide.conductor_lng || activeRide.longitudConductor || activeRide.conductorLng || 0);
            if (lat !== 0 && lng !== 0) return { lat, lng };
            
            const cid = activeRide.conductor_id || activeRide.idConductor || activeRide.id_conductor || activeRide.conductorId || activeRide.conductor;
            if (cid && availableDrivers.length > 0) {
              const d = availableDrivers.find(driver => driver.id === cid);
              if (d) return { lat: d.lat, lng: d.lng };
            }
            return null;
          })()}
          availableDrivers={activeRide ? [] : filteredAvailableDrivers}
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
        pricingConfig={pricingConfig}
        onCancelRide={handleCancelRide}
      />

      {/* 6. Modal de Cuenta en Verificación (Flutter Style) */}
      {showVerificationModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="animate-fade-in" style={{
            background: '#1E293B', // Dark card
            borderRadius: '16px',
            width: '100%',
            maxWidth: '340px',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            {/* Ícono animado tipo reloj o espera */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(241, 95, 2, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F15F02" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            
            <h3 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#FFFFFF',
              marginBottom: '12px',
              textAlign: 'center',
              letterSpacing: '-0.3px'
            }}>
              Cuenta en Revisión
            </h3>
            
            <p style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              lineHeight: 1.5,
              marginBottom: '24px'
            }}>
              Tu perfil está siendo verificado por un administrador. Recibirás una notificación cuando seas aprobado y podrás solicitar viajes.
            </p>

            <button
              onClick={() => setShowVerificationModal(false)}
              className="btn-flutter-primary"
              style={{ width: '100%', padding: '14px' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
