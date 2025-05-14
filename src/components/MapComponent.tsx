import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Box, Typography } from '@mui/material';

interface MapComponentProps {
  onLocationSelect: (location: { lat: number; lng: number; address?: string; pais?: string; estado?: string; cidade?: string; bairro?: string; rua?: string }) => void;
  initialLocation?: number[];
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: -23.550520,
  lng: -46.633308
};

const MapComponent: React.FC<MapComponentProps> = ({ onLocationSelect, initialLocation }) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [addressDetails, setAddressDetails] = useState<{
    pais?: string;
    estado?: string;
    cidade?: string;
    bairro?: string;
    rua?: string;
  }>({});

  const geocoder = useRef<google.maps.Geocoder | null>(null);

  // Use useJsApiLoader instead of LoadScript
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg",
    libraries: ["places"]
  });

  useEffect(() => {
    if (window.google) {
      geocoder.current = new window.google.maps.Geocoder();
    }
  }, []);

  useEffect(() => {
    if (initialLocation && initialLocation.length === 2) {
      const position = {
        lat: initialLocation[0],
        lng: initialLocation[1]
      };
      setMarkerPosition(position);
    }
  }, [initialLocation]);

  const handleMapClick = useCallback(async (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const position = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };

    setMarkerPosition(position);

    // Geocoding reverso para obter detalhes do endereço
    if (geocoder.current) {
      try {
        const response = await geocoder.current.geocode({ location: position });
        if (response.results[0]) {
          const addressComponents = response.results[0].address_components;
          const details: any = {};

          // Log para debug
          console.log('Componentes do endereço:', addressComponents);

          // Mapear os componentes do endereço
          addressComponents.forEach((component) => {
            const types = component.types;
            if (types.includes('country')) details.pais = component.long_name;
            if (types.includes('administrative_area_level_1')) details.estado = component.long_name;
            if (types.includes('locality') || types.includes('administrative_area_level_2')) details.cidade = component.long_name;
            if (types.includes('sublocality') || types.includes('neighborhood')) details.bairro = component.long_name;
            if (types.includes('route')) details.rua = component.long_name;
          });

          // Log para debug
          console.log('Detalhes do endereço mapeados:', details);

          setAddressDetails(details);
          onLocationSelect({
            ...position,
            ...details
          });
        }
      } catch (error) {
        console.error('Erro ao obter detalhes do endereço:', error);
        // Se houver erro no geocoding, ainda enviamos as coordenadas
        onLocationSelect(position);
      }
    } else {
      // Se não houver geocoder, enviamos apenas as coordenadas
      onLocationSelect(position);
    }
  }, [onLocationSelect]);

  if (!isLoaded) {
    return <Box sx={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography>Carregando mapa...</Typography>
    </Box>;
  }

  return (
    <Box sx={{ width: '100%', height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition || center}
        zoom={13}
        onClick={handleMapClick}
        onLoad={(map) => {
          mapRef.current = map;
        }}
      >
        {markerPosition && (
          <Marker
            position={markerPosition}
            draggable={true}
            onDragEnd={(e) => {
              if (e.latLng) {
                const position = {
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng()
                };
                setMarkerPosition(position);
                handleMapClick({ latLng: e.latLng } as google.maps.MapMouseEvent);
              }
            }}
          />
        )}
      </GoogleMap>
    </Box>
  );
};

export default MapComponent;
