import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ArrowUpDown, Crosshair } from 'lucide-react';
import { autocompleteAddress } from '../services/locationIQService';

export default function AddressSearch({ 
  origen, 
  destino, 
  onSelectOrigen, 
  onSelectDestino, 
  activeSelectionMode,
  setActiveSelectionMode 
}) {
  const [origenQuery, setOrigenQuery] = useState('');
  const [destinoQuery, setDestinoQuery] = useState('');
  const [origenSuggestions, setOrigenSuggestions] = useState([]);
  const [destinoSuggestions, setDestinoSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState(null);

  useEffect(() => {
    if (origen && origen.address) setOrigenQuery(origen.address);
  }, [origen?.address]);

  useEffect(() => {
    if (destino && destino.address) setDestinoQuery(destino.address);
  }, [destino?.address]);

  useEffect(() => {
    if (activeInput !== 'origen' || !origenQuery || origenQuery.trim().length < 3) {
      setOrigenSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await autocompleteAddress(origenQuery);
      setOrigenSuggestions(results);
    }, 350);
    return () => clearTimeout(timer);
  }, [origenQuery, activeInput]);

  useEffect(() => {
    if (activeInput !== 'destino' || !destinoQuery || destinoQuery.trim().length < 3) {
      setDestinoSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await autocompleteAddress(destinoQuery);
      setDestinoSuggestions(results);
    }, 350);
    return () => clearTimeout(timer);
  }, [destinoQuery, activeInput]);

  const handleSwap = () => {
    const temp = origen;
    onSelectOrigen(destino);
    onSelectDestino(temp);
  };

  const handleSelectOrigenItem = (item) => {
    setActiveInput(null);
    setOrigenSuggestions([]);
    setOrigenQuery(item.shortName);
    onSelectOrigen({
      lat: Number(item.lat),
      lng: Number(item.lon),
      address: item.shortName
    });
  };

  const handleSelectDestinoItem = (item) => {
    setActiveInput(null);
    setDestinoSuggestions([]);
    setDestinoQuery(item.shortName);
    onSelectDestino({
      lat: Number(item.lat),
      lng: Number(item.lon),
      address: item.shortName
    });
  };

  return (
    <div className="flutter-sheet" style={{
      padding: '12px 16px 16px 16px',
      margin: '0',
      position: 'relative',
      zIndex: 100
    }}>
      {/* Flutter Drag Handle Pill */}
      <div className="flutter-drag-handle"></div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
        {/* Origin Field (Punto A) */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <MapPin size={18} color="var(--accent-green)" />
            </div>

            <input
              type="text"
              className="flutter-input"
              placeholder="¿Dónde te buscamos? (Punto A)"
              value={origenQuery}
              onChange={(e) => setOrigenQuery(e.target.value)}
              onFocus={() => {
                setActiveInput('origen');
                setActiveSelectionMode(null);
              }}
            />

            <button
              onClick={() => setActiveSelectionMode(activeSelectionMode === 'origen' ? null : 'origen')}
              style={{
                background: activeSelectionMode === 'origen' ? 'var(--primary-orange)' : '#0F172A',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '16px',
                padding: '12px',
                color: '#FFF',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title="Seleccionar en mapa"
            >
              <Crosshair size={18} />
            </button>
          </div>

          {/* LocationIQ Suggestions Dropdown for Origen */}
          {activeInput === 'origen' && origenSuggestions.length > 0 && (
            <div className="flutter-sheet" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '6px',
              maxHeight: '220px',
              overflowY: 'auto',
              zIndex: 300,
              padding: '8px',
              borderRadius: '16px'
            }}>
              {origenSuggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectOrigenItem(item)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'var(--text-white)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <MapPin size={16} color="var(--accent-green)" />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.displayName}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button Divider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '0', position: 'relative' }}>
          <button
            onClick={handleSwap}
            style={{
              position: 'absolute',
              background: '#0F172A',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <ArrowUpDown size={15} />
          </button>
        </div>

        {/* Destination Field (Punto B) */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(241, 95, 2, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Navigation size={17} color="var(--primary-orange)" />
            </div>

            <input
              type="text"
              className="flutter-input"
              placeholder="¿A dónde vas? (Punto B)"
              value={destinoQuery}
              onChange={(e) => setDestinoQuery(e.target.value)}
              onFocus={() => {
                setActiveInput('destino');
                setActiveSelectionMode(null);
              }}
            />

            <button
              onClick={() => setActiveSelectionMode(activeSelectionMode === 'destino' ? null : 'destino')}
              style={{
                background: activeSelectionMode === 'destino' ? 'var(--primary-orange)' : '#0F172A',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '16px',
                padding: '12px',
                color: '#FFF',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title="Seleccionar en mapa"
            >
              <Crosshair size={18} />
            </button>
          </div>

          {/* LocationIQ Suggestions Dropdown for Destino */}
          {activeInput === 'destino' && destinoSuggestions.length > 0 && (
            <div className="flutter-sheet" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '6px',
              maxHeight: '220px',
              overflowY: 'auto',
              zIndex: 300,
              padding: '8px',
              borderRadius: '16px'
            }}>
              {destinoSuggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectDestinoItem(item)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'var(--text-white)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <Navigation size={16} color="var(--primary-orange)" />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.displayName}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
