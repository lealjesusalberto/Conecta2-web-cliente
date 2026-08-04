import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reverseGeocode } from '../services/locationIQService';

// Fix Leaflet default icon issues
delete L.Icon.Default.prototype._getIconUrl;

// Exact Marker Icons from the Flutter Mobile App assets
const originIcon = L.icon({
  iconUrl: '/assets/house-map.png',
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -44]
});

const destinationIcon = L.icon({
  iconUrl: '/assets/destino_.png',
  iconSize: [48, 54],
  iconAnchor: [24, 54],
  popupAnchor: [0, -54]
});

const carDriverIcon = L.icon({
  iconUrl: '/assets/auto_tipe.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

const motoDriverIcon = L.icon({
  iconUrl: '/assets/conductor_.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

function MapController({ origen, destino, activeSelectionMode, onLocationSelected }) {
  const map = useMapEvents({
    async click(e) {
      if (!activeSelectionMode) return;
      const { lat, lng } = e.latlng;
      const addressName = await reverseGeocode(lat, lng);
      onLocationSelected(activeSelectionMode, {
        lat,
        lng,
        address: addressName
      });
    }
  });

  useEffect(() => {
    if (map && origen && destino) {
      const bounds = L.latLngBounds(
        [origen.lat, origen.lng],
        [destino.lat, destino.lng]
      );
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else if (map && origen && !destino) {
      map.flyTo([origen.lat, origen.lng], 15);
    }
    if (map) {
      setTimeout(() => map.invalidateSize(), 300);
    }
  }, [map, origen, destino]);

  return null;
}

export default function MapView({
  origen,
  destino,
  conductorLocation,
  availableDrivers = [],
  conductorType = 'auto',
  activeSelectionMode,
  onLocationSelected
}) {
  const defaultCenter = [10.4806, -66.9036];
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [driverRouteCoordinates, setDriverRouteCoordinates] = useState([]);

  useEffect(() => {
    if (navigator.geolocation && !origen) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const address = await reverseGeocode(lat, lng);
          onLocationSelected('origen', { lat, lng, address });
        },
        (error) => console.warn('Geolocalización denegada:', error),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Fetch real road route geometry from OSRM when Origen and Destino exist
  useEffect(() => {
    if (!origen || !destino) {
      setRouteCoordinates([]);
      return;
    }

    const fetchRoadRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${origen.lng},${origen.lat};${destino.lng},${destino.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.routes && data.routes[0]) {
            const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            setRouteCoordinates(coords);
            return;
          }
        }
      } catch (e) {
        console.warn('⚠️ Fallback a línea directa:', e);
      }
      setRouteCoordinates([
        [origen.lat, origen.lng],
        [destino.lat, destino.lng]
      ]);
    };

    fetchRoadRoute();
  }, [origen?.lat, origen?.lng, destino?.lat, destino?.lng]);

  // Fetch route from driver to client
  useEffect(() => {
    if (!conductorLocation || !origen) {
      setDriverRouteCoordinates([]);
      return;
    }

    const fetchDriverRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${conductorLocation.lng},${conductorLocation.lat};${origen.lng},${origen.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.routes && data.routes[0]) {
            const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            setDriverRouteCoordinates(coords);
            return;
          }
        }
      } catch (e) {
        console.warn('⚠️ Fallback a línea directa conductor-cliente:', e);
      }
      setDriverRouteCoordinates([
        [conductorLocation.lat, conductorLocation.lng],
        [origen.lat, origen.lng]
      ]);
    };

    // Agregar un timeout o debounce en un caso real si el conductor se mueve muy rápido, 
    // pero para no saturar OSRM, podríamos limitarlo. Por ahora está bien.
    fetchDriverRoute();
  }, [conductorLocation?.lat, conductorLocation?.lng, origen?.lat, origen?.lng]);

  const centerPos = origen ? [origen.lat, origen.lng] : defaultCenter;
  const activeDriverIcon = conductorType === 'moto' ? motoDriverIcon : carDriverIcon;

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '350px', position: 'relative', background: '#0F172A' }}>
      <MapContainer
        center={centerPos}
        zoom={14}
        zoomControl={false}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapController
          origen={origen}
          destino={destino}
          activeSelectionMode={activeSelectionMode}
          onLocationSelected={onLocationSelected}
        />

        {/* Punto A (Origen) Marker con Icono de Casa Flutter */}
        {origen && (
          <Marker position={[origen.lat, origen.lng]} icon={originIcon}>
            <Popup>
              <strong>Punto A (Origen)</strong><br />{origen.address}
            </Popup>
          </Marker>
        )}

        {/* Punto B (Destino) Marker con Icono Destino Flutter */}
        {destino && (
          <Marker position={[destino.lat, destino.lng]} icon={destinationIcon}>
            <Popup>
              <strong>Punto B (Destino)</strong><br />{destino.address}
            </Popup>
          </Marker>
        )}

        {/* Conductor Live Marker (Viaje Activo) */}
        {conductorLocation && (
          <Marker position={[conductorLocation.lat, conductorLocation.lng]} icon={activeDriverIcon}>
            <Popup>Conductor en camino</Popup>
          </Marker>
        )}

        {/* Conductores Disponibles en la zona */}
        {!conductorLocation && availableDrivers.map((driver) => (
          <Marker
            key={driver.id}
            position={[driver.lat, driver.lng]}
            icon={driver.type === 'moto' ? motoDriverIcon : carDriverIcon}
          />
        ))}

        {/* Real Street Polyline with Orange Conecta2 Brand Glow */}
        {routeCoordinates.length > 0 && !conductorLocation && (
          <>
            <Polyline
              positions={routeCoordinates}
              color="rgba(241, 95, 2, 0.4)"
              weight={10}
            />
            <Polyline
              positions={routeCoordinates}
              color="#F15F02"
              weight={5}
              opacity={1}
            />
          </>
        )}

        {/* Polyline from Driver to Client (Green dashed) */}
        {driverRouteCoordinates.length > 0 && conductorLocation && (
          <>
            <Polyline
              positions={driverRouteCoordinates}
              color="rgba(34, 197, 94, 0.3)"
              weight={10}
            />
            <Polyline
              positions={driverRouteCoordinates}
              color="#22C55E"
              weight={5}
              opacity={1}
              dashArray="10, 10"
              dashOffset="0"
            />
          </>
        )}
      </MapContainer>

      {activeSelectionMode && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid var(--primary-orange)',
          borderRadius: '30px',
          padding: '8px 18px',
          fontSize: '13px',
          fontWeight: 700,
          color: 'var(--primary-orange-light)',
          boxShadow: 'var(--shadow-glow)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          whiteSpace: 'nowrap'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--primary-orange)',
            animation: 'radarPulse 1.5s infinite ease-in-out'
          }}></span>
          Toca el mapa para fijar {activeSelectionMode === 'origen' ? 'Punto A (Origen)' : 'Punto B (Destino)'}
        </div>
      )}
    </div>
  );
}
