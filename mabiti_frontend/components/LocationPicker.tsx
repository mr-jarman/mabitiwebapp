import React, { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '16px',
};

// Default center (can be user's current location or a default city like SF)
const defaultCenter = {
    lat: 37.7749,
    lng: -122.4194
};

interface LocationPickerProps {
    onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
    onClose: () => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, onClose }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: ['places']
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLngLiteral | null>(null);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);

        // Try to get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(pos);
                setSelectedLocation(pos);
            });
        }
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setSelectedLocation({ lat, lng });
        }
    };

    const handleConfirm = () => {
        if (selectedLocation) {
            onLocationSelect({
                lat: selectedLocation.lat,
                lng: selectedLocation.lng
            });
            onClose();
        }
    };

    if (!isLoaded) return <div className="p-4 text-center">Loading Map...</div>;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-white/10 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Pin a Location</h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="relative">
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={defaultCenter}
                        zoom={12}
                        onLoad={onLoad}
                        onUnmount={onUnmount}
                        onClick={handleMapClick}
                        options={{
                            disableDefaultUI: false,
                            styles: [
                                {
                                    featureType: "poi",
                                    elementType: "labels",
                                    stylers: [{ visibility: "off" }],
                                },
                            ],
                        }}
                    >
                        {selectedLocation && (
                            <Marker position={selectedLocation} />
                        )}
                    </GoogleMap>

                    {!selectedLocation && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md pointer-events-none">
                            Click on the map to drop a pin
                        </div>
                    )}
                </div>

                <div className="p-4 flex justify-end gap-3 bg-zinc-50 dark:bg-black/20">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/10 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedLocation}
                        className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                    >
                        Use this Location
                    </button>
                </div>
            </div>
        </div>
    );
};
