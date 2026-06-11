import { useEffect, useRef } from 'react';
import type { Property } from '../../types/property.types';

interface PropertyMapProps {
  properties: Property[];
  center?: { lat: number; lng: number };
  onPropertyClick?: (id: string) => void;
}

export const PropertyMap = ({ properties, center }: PropertyMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // MapLibre GL + AWS Location Service init
    // Requires maplibre-gl and AWS Location credentials
    // Placeholder: replace with real MapLibre init in Sprint 2
    if (!mapRef.current) return;
    mapRef.current.innerHTML = `
      <div style="
        width:100%; height:100%;
        display:flex; align-items:center; justify-content:center;
        background:#0A0A0A; border:1px solid #1A1A1A; border-radius:12px;
        color:#9CA3AF; font-size:14px; gap:8px;
      ">
        🗺️ Map loads with AWS Location Service (MapLibre GL) in Sprint 2
      </div>
    `;
  }, [properties, center]);

  return (
    <div
      ref={mapRef}
      id="property-map"
      className="w-full h-80 rounded-xl overflow-hidden border border-dark-border"
      role="img"
      aria-label="Property location map"
    />
  );
};
