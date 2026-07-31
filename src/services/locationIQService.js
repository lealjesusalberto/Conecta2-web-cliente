const LOCATIONIQ_API_KEY = "pk.17f63449e28bac26a20764549a478eff";

/**
 * Autocompletado de direcciones filtrado para Venezuela
 * @param {string} query Texto buscado por el usuario
 * @returns {Promise<Array>} Lista de sugerencias con lat, lon y dirección legible
 */
export async function autocompleteAddress(query) {
  if (!query || query.trim().length < 3) return [];

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `https://us1.locationiq.com/v1/autocomplete?key=${LOCATIONIQ_API_KEY}&q=${encodedQuery}&format=json&accept-language=es&countrycodes=ve&limit=8&dedupe=1`;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn('⚠️ LocationIQ response status:', response.status);
      return [];
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data.map(item => ({
        id: item.place_id || item.osm_id || Math.random().toString(),
        displayName: item.display_name,
        shortName: formatShortAddress(item.address, item.display_name),
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        rawAddress: item.address || {}
      }));
    }
  } catch (error) {
    console.error('❌ Error en autocomplete LocationIQ:', error);
  }
  return [];
}

/**
 * Geocodificación inversa: Convierte latitud/longitud a dirección corta legible
 * @param {number} lat 
 * @param {number} lon 
 * @returns {Promise<string>} Dirección corta en texto
 */
export async function reverseGeocode(lat, lon) {
  try {
    const url = `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json&accept-language=es&zoom=18`;
    
    const response = await fetch(url);
    if (!response.ok) return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;

    const data = await response.json();
    if (data && data.address) {
      return formatShortAddress(data.address, data.display_name);
    }
  } catch (error) {
    console.error('❌ Error en reverseGeocode LocationIQ:', error);
  }
  return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}

/**
 * Formatea la dirección compleja en un texto corto y claro
 */
function formatShortAddress(address, fallbackName) {
  if (!address) return fallbackName || 'Ubicación seleccionada';

  const parts = [];
  if (address.road) {
    if (address.house_number) {
      parts.push(`${address.road} ${address.house_number}`);
    } else {
      parts.push(address.road);
    }
  } else if (address.suburb) {
    parts.push(address.suburb);
  } else if (address.neighbourhood) {
    parts.push(address.neighbourhood);
  }

  if (address.suburb && !parts.includes(address.suburb)) {
    parts.push(address.suburb);
  }

  if (address.city) {
    parts.push(address.city);
  } else if (address.town) {
    parts.push(address.town);
  } else if (address.municipality) {
    parts.push(address.municipality);
  }

  if (parts.length > 0) {
    return parts.join(', ');
  }

  return fallbackName ? fallbackName.split(',').slice(0, 3).join(',') : 'Ubicación seleccionada';
}
