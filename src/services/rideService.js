import { database } from '../config/firebase';
import { ref, push, set, update, onValue, off, remove, get } from 'firebase/database';

/**
 * Obtener tasa BCV y tarifas de configuración desde RTDB
 */
export async function getRidePricingConfig() {
  try {
    const configRef = ref(database, 'configuracion');
    const snapshot = await get(configRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const precios500m = data.precios_500m || {};
      return {
        tasaBcv: Number(data.tasa_bcv ?? data.bcv_rate ?? 50.0),
        precioBaseAuto: Number(data.tarifa_base_auto ?? 2.5),
        precioKmAuto: Number(data.tarifa_km_auto ?? 0.6),
        precioBaseMoto: Number(data.tarifa_base_moto ?? 1.5),
        precioKmMoto: Number(data.tarifa_km_moto ?? 0.4),
        precioMotoExpress: Number(precios500m.moto_express ?? 0.11),
        precioAutoExpress: Number(precios500m.auto_express ?? 0.40),
      };
    }
  } catch (error) {
    console.warn('⚠️ Error leyendo configuración de precios:', error);
  }
  return {
    tasaBcv: 50.0,
    precioBaseAuto: 2.5,
    precioKmAuto: 0.6,
    precioBaseMoto: 1.5,
    precioKmMoto: 0.4,
    precioMotoExpress: 0.11,
    precioAutoExpress: 0.40,
  };
}

/**
 * Calcular la distancia en kilómetros entre dos coordenadas (Haversine seguro)
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const p1Lat = Number(lat1);
  const p1Lon = Number(lon1);
  const p2Lat = Number(lat2);
  const p2Lon = Number(lon2);

  if (isNaN(p1Lat) || isNaN(p1Lon) || isNaN(p2Lat) || isNaN(p2Lon)) {
    return 1.0;
  }

  const R = 6371;
  const dLat = (p2Lat - p1Lat) * (Math.PI / 180);
  const dLon = (p2Lon - p1Lon) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1Lat * (Math.PI / 180)) *
      Math.cos(p2Lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const clampedA = Math.min(Math.max(a, 0), 1);
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));
  const distance = R * c;

  if (isNaN(distance) || !isFinite(distance)) {
    return 1.0;
  }

  return Math.max(distance, 1.0);
}

/**
 * Crear un Preview de Microservicio en /microservicios_preview
 */
export async function createRidePreview({
  user,
  transporteType = 'auto',
  origen,
  destino,
  distanciaKm
}) {
  if (!user || !user.uid || !origen || !destino) return null;

  try {
    const previewRef = push(ref(database, 'microservicios_preview'));
    const previewId = previewRef.key;
    const nombreTransporte = transporteType === 'moto' ? 'Moto Express' : 'Auto Express';

    const now = Date.now();
    const expiracion = now + 3 * 60 * 1000;
    const clientName = user.displayName || user.name || user.email || 'Cliente Conecta2';
    const clientPhoto = user.photoURL || user.foto_perfil || user.photoUrl || '';
    const clientPhone = user.phone || user.phoneNumber || '';

    const previewData = {
      preview_id: previewId,
      solicitante_id: user.uid,
      id_solicitante: user.uid,
      
      solicitante_nombre: clientName,
      nombre_solicitante: clientName,
      nombre_cliente: clientName,

      solicitante_foto: clientPhoto,
      foto_solicitante: clientPhoto,
      foto_cliente: clientPhoto,
      photoUrl: clientPhoto,
      photoURL: clientPhoto,

      transporte: nombreTransporte,
      tipo_servicio: nombreTransporte,
      ubicacionActual: origen.address,
      ubicacionDestino: destino.address,
      latOrigen: Number(origen.lat),
      lonOrigen: Number(origen.lng),
      latDestino: Number(destino.lat),
      lonDestino: Number(destino.lng),
      distancia: Number(distanciaKm),
      telefono: clientPhone,
      solicitante_telefono: clientPhone,
      timestamp_creacion: now,
      timestamp_visible: now,
      timestamp_expiracion: expiracion,
      estado: 'preview'
    };

    await set(previewRef, previewData);
    return previewId;
  } catch (error) {
    console.warn('⚠️ Error creando preview de microservicio:', error);
    return null;
  }
}

/**
 * Eliminar el preview cuando el usuario confirma o cancela
 */
export async function deleteRidePreview(previewId) {
  if (!previewId) return;
  try {
    await remove(ref(database, `microservicios_preview/${previewId}`));
  } catch (error) {
    console.warn('⚠️ Error eliminando preview:', error);
  }
}

/**
 * Crear solicitud de viaje en Firebase Realtime Database
 */
export async function requestRide({
  user,
  transporteType = 'auto',
  origen,
  destino,
  precioUsd,
  tasaBcv,
  distanciaKm,
  metodoPago = 'Efectivo',
  comentario = '',
  previewId = null
}) {
  if (!user || !user.uid) throw new Error('Usuario no autenticado');

  if (previewId) {
    deleteRidePreview(previewId);
  }

  const tipo = transporteType === 'moto' ? 'moto' : 'auto';
  const nombreTransporte = tipo === 'moto' ? 'Moto Express' : 'Auto Express';

  const disponiblesRef = ref(database, `microservicios_disponibles/${tipo}`);
  const newRideRef = push(disponiblesRef);
  const rideId = newRideRef.key;

  const now = Date.now();
  const expiracion = now + 30 * 60 * 1000;

  const latOrigen = Number(origen.lat);
  const lngOrigen = Number(origen.lng);
  const latDestino = Number(destino.lat);
  const lngDestino = Number(destino.lng);

  const precioUsdFormatted = Number(precioUsd).toFixed(2);
  const totalBs = (Number(precioUsdFormatted) * Number(tasaBcv)).toFixed(2);
  const distKmFormatted = Number(distanciaKm).toFixed(2);

  const clientName = user.displayName || user.name || user.email || 'Cliente Conecta2';
  const clientPhoto = user.photoURL || user.foto_perfil || user.photoUrl || '';
  const clientPhone = user.phone || user.phoneNumber || '';

  const rideData = {
    id: rideId,
    microservicio_id: rideId,
    solicitante_id: user.uid,
    id_solicitante: user.uid,

    solicitante_nombre: clientName,
    nombre_solicitante: clientName,
    nombre_cliente: clientName,

    solicitante_foto: clientPhoto,
    foto_solicitante: clientPhoto,
    foto_cliente: clientPhoto,
    photoUrl: clientPhoto,
    photoURL: clientPhoto,

    solicitante_telefono: clientPhone,
    telefono_solicitante: clientPhone,

    transporte: nombreTransporte,
    tipoServicio: nombreTransporte,

    ubicacionActual: origen.address,
    ubicacionDestino: destino.address,
    origen_nombre: origen.address,
    destino_nombre: destino.address,

    solicitanteLatitude: latOrigen,
    solicitanteLongitude: lngOrigen,
    solicitante_latitude: latOrigen,
    solicitante_longitude: lngOrigen,
    latitude: latOrigen,
    longitude: lngOrigen,

    latitudOrigen: latOrigen,
    longitudOrigen: lngOrigen,
    latitudDestino: latDestino,
    longitudDestino: lngDestino,
    origen_lat: latOrigen,
    origen_lng: lngOrigen,
    destino_lat: latDestino,
    destino_lng: lngDestino,

    precio: precioUsdFormatted,
    precio_usd: precioUsdFormatted,
    precio_total: totalBs,
    tasa_bcv: Number(tasaBcv),
    distancia_km: Number(distKmFormatted),
    distancia: Number(distKmFormatted),
    metodo_pago: metodoPago,
    nota: comentario,

    estado: 'disponible',
    estado_microservicio: 'disponible',
    disponible: true,

    timestamp: now,
    timestamp_creacion: now,
    timestamp_expiracion: expiracion,
    origen_dispositivo: 'web_pwa'
  };

  const updates = {};
  updates[`microservicios_disponibles/${tipo}/${rideId}`] = rideData;
  updates[`microservicio_${tipo}/${rideId}`] = rideData;
  updates[`indices/microservicios_disponibles_por_tipo/${tipo}/${rideId}`] = expiracion;
  updates[`indices/microservicios_por_solicitante/${user.uid}/disponibles/${rideId}`] = expiracion;

  await update(ref(database), updates);

  return { rideId, nodeName: `microservicios_disponibles/${tipo}`, rideData, tipo };
}

/**
 * Escuchar cambios en tiempo real del viaje (Garantizando la transición al estado completado)
 */
export function listenToRideStatus(nodeName, rideId, param3, param4) {
  let onUpdate = null;
  let userId = null;

  if (typeof param3 === 'function') {
    onUpdate = param3;
    userId = typeof param4 === 'string' ? param4 : null;
  } else if (typeof param4 === 'function') {
    userId = typeof param3 === 'string' ? param3 : null;
    onUpdate = param4;
  }

  if (typeof onUpdate !== 'function') {
    return () => {};
  }

  const listeners = [];
  let lastKnownRide = null;
  let hasBeenAccepted = false;

  const handleData = (val) => {
    if (!val) return;

    let dataObj = val;
    if (typeof val === 'object' && !val.microservicio_id && !val.id && !val.estado_microservicio) {
      const keys = Object.keys(val);
      for (const k of keys) {
        const item = val[k];
        if (item && (item.microservicio_id === rideId || item.id === rideId || (userId && item.solicitante_id === userId))) {
          dataObj = item;
          break;
        }
      }
    }

    const rawEstado = (dataObj.estado_microservicio || dataObj.estado || '').toString().toLowerCase();

    if (rawEstado === 'aceptado' || rawEstado === 'proceso' || rawEstado === 'en_camino' || rawEstado === 'recoger_pasajero' || rawEstado === 'activo') {
      hasBeenAccepted = true;
    }

    const fullObject = {
      ...dataObj,
      rideId: rideId,
      activo_id: dataObj.activo_id || dataObj.activoId || rideId,
      estado_microservicio: rawEstado || 'aceptado',
      conductor_nombre: dataObj.nombre_conductor || dataObj.conductor_nombre || 'Conductor Conecta2',
      foto_conductor: dataObj.foto_conductor || dataObj.conductor_foto || '',
      telefono_conductor: dataObj.telefono_conductor || dataObj.conductor_telefono || '',
      placa_vehiculo: dataObj.placa_vehiculo || dataObj.modelo_vehiculo || 'Auto',
      conductor_lat: Number(dataObj.conductor_lat || dataObj.latitudConductor || dataObj.latitude || 0),
      conductor_lng: Number(dataObj.conductor_lng || dataObj.longitudConductor || dataObj.longitude || 0)
    };

    lastKnownRide = fullObject;
    onUpdate(fullObject);
  };

  // 1. Escuchar microservicios_disponibles/auto/rideId y microservicios_disponibles/moto/rideId
  const dispAutoRef = ref(database, `microservicios_disponibles/auto/${rideId}`);
  onValue(dispAutoRef, (snap) => { 
    if (snap.exists()) {
      handleData(snap.val());
    }
  });
  listeners.push(dispAutoRef);

  const dispMotoRef = ref(database, `microservicios_disponibles/moto/${rideId}`);
  onValue(dispMotoRef, (snap) => {
    if (snap.exists()) {
      handleData(snap.val());
    }
  });
  listeners.push(dispMotoRef);

  // 2. Escuchar microservicios_activos/auto y microservicios_activos/moto
  const actAutoRef = ref(database, 'microservicios_activos/auto');
  onValue(actAutoRef, (snap) => {
    if (snap.exists()) {
      handleData(snap.val());
    } else if (hasBeenAccepted && lastKnownRide) {
      // Si el viaje estuvo activo y el nodo desaparece, la app de Flutter lo marcó como completado
      onUpdate({
        ...lastKnownRide,
        estado_microservicio: 'completado'
      });
    }
  });
  listeners.push(actAutoRef);

  const actMotoRef = ref(database, 'microservicios_activos/moto');
  onValue(actMotoRef, (snap) => {
    if (snap.exists()) {
      handleData(snap.val());
    } else if (hasBeenAccepted && lastKnownRide) {
      onUpdate({
        ...lastKnownRide,
        estado_microservicio: 'completado'
      });
    }
  });
  listeners.push(actMotoRef);

  // 3. Escuchar índice de activos del solicitante
  if (typeof userId === 'string' && userId.trim().length > 0 && !/[.#$\[\]]/.test(userId)) {
    const indRef = ref(database, `indices/microservicios_por_solicitante/${userId.trim()}/activos`);
    onValue(indRef, (snap) => {
      if (snap.exists()) {
        const activoKeys = Object.keys(snap.val());
        activoKeys.forEach((actKey) => {
          get(ref(database, `microservicios_activos/auto/${actKey}`)).then((s) => {
            if (s.exists()) handleData(s.val());
          });
          get(ref(database, `microservicios_activos/moto/${actKey}`)).then((s) => {
            if (s.exists()) handleData(s.val());
          });
        });
      }
    });
    listeners.push(indRef);
  }

  return () => {
    listeners.forEach((r) => off(r));
  };
}

/**
 * Cancelar un viaje pendiente
 */
export async function cancelRide(nodeName, rideId, userId, tipo = 'auto') {
  try {
    const updates = {};
    updates[`microservicios_disponibles/${tipo}/${rideId}`] = null;
    updates[`microservicio_${tipo}/${rideId}`] = null;
    updates[`microservicios_activos/${tipo}/${rideId}`] = null;
    updates[`microservicios_activos/${rideId}`] = null;
    updates[`indices/microservicios_disponibles_por_tipo/${tipo}/${rideId}`] = null;
    if (typeof userId === 'string' && userId.trim().length > 0 && !/[.#$\[\]]/.test(userId)) {
      updates[`indices/microservicios_por_solicitante/${userId.trim()}/disponibles/${rideId}`] = null;
      updates[`indices/microservicios_por_solicitante/${userId.trim()}/activos/${rideId}`] = null;
    }
    await update(ref(database), updates);
  } catch (error) {
    console.error('Error al cancelar viaje:', error);
  }
}
