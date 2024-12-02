"use client"

import { useState, useCallback } from 'react';
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';

interface MapPickerProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  defaultCenter?: { lat: number; lng: number };
}

const defaultMapCenter = { lat: -1.2921, lng: 36.8219 }; // Default to Nairobi

export function MapPicker({ onLocationSelect, defaultCenter = defaultMapCenter }: MapPickerProps) {
  const [marker, setMarker] = useState(defaultCenter);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setMarker(newLocation);
      onLocationSelect(newLocation);
    }
  }, [onLocationSelect]);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
      <GoogleMap
        mapContainerClassName="w-full h-[400px] rounded-lg"
        center={defaultCenter}
        zoom={13}
        onClick={handleMapClick}
      >
        <Marker position={marker} />
      </GoogleMap>
    </LoadScript>
  );
}