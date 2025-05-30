"use client";

import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { MapPin, Search } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

import { Button } from "../primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../primitives/dialog";
import { Input } from "../primitives/input";

interface GoogleMapProps {
  center: google.maps.LatLngLiteral;
  onLocationSelect?: (data: {
    address: string;
    coordinates: { lat: number; lng: number };
  }) => void;
  zoom: number;
}

interface LocationSelectorProps {
  onLocationSelect?: (data: {
    address: string;
    coordinates: { lat: number; lng: number };
  }) => void;
}

const GoogleMapComponent: React.FC<GoogleMapProps> = ({
  center,
  onLocationSelect,
  zoom,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [marker, setMarker] = useState<google.maps.Marker>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox>();

  React.useEffect(() => {
    if (mapRef.current && !map) {
      // Initialize map
      const newMap = new window.google.maps.Map(mapRef.current, {
        center,
        fullscreenControl: false,
        gestureHandling: "greedy",
        mapTypeControl: false,
        restriction: {
          latLngBounds: {
            east: 77.8375, // Eastern Pakistan
            north: 37.0841, // Northern Pakistan
            south: 23.6345, // Southern Pakistan
            west: 60.8728, // Western Pakistan
          },
          strictBounds: false,
        },
        streetViewControl: false,
        styles: [
          {
            elementType: "labels",
            featureType: "poi",
            stylers: [{ visibility: "off" }],
          },
        ],
        zoom,
        zoomControl: true,
      });
      setMap(newMap);

      // Initialize marker
      const newMarker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        draggable: true,
        map: newMap,
        visible: false,
      });
      setMarker(newMarker);

      // Initialize search box
      if (searchInputRef.current) {
        const newSearchBox = new window.google.maps.places.SearchBox(
          searchInputRef.current
        );
        setSearchBox(newSearchBox);

        // Bias search results to map viewport
        newMap.addListener("bounds_changed", () => {
          newSearchBox.setBounds(
            newMap.getBounds() as google.maps.LatLngBounds
          );
        });

        // Handle place selection from search
        newSearchBox.addListener("places_changed", () => {
          const places = newSearchBox.getPlaces();
          if (places && places.length > 0) {
            const place = places[0];
            if (place.geometry && place.geometry.location) {
              const location = place.geometry.location;
              const lat = location.lat();
              const lng = location.lng();

              // Update marker and map
              newMarker.setPosition({ lat, lng });
              newMarker.setVisible(true);
              newMap.setCenter({ lat, lng });
              newMap.setZoom(15);

              // Callback with selected location
              if (onLocationSelect && place.formatted_address) {
                onLocationSelect({
                  address: place.formatted_address,
                  coordinates: { lat, lng },
                });
              }
            }
          }
        });
      }

      // Handle map clicks
      newMap.addListener("click", (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();

          // Update marker
          newMarker.setPosition({ lat, lng });
          newMarker.setVisible(true);

          // Reverse geocode to get address
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results && results[0] && onLocationSelect) {
              onLocationSelect({
                address: results[0].formatted_address,
                coordinates: { lat, lng },
              });
            }
          });
        }
      });

      // Handle marker drag
      newMarker.addListener("dragend", (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();

          // Reverse geocode
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results && results[0] && onLocationSelect) {
              onLocationSelect({
                address: results[0].formatted_address,
                coordinates: { lat, lng },
              });
            }
          });
        }
      });
    }
  }, [mapRef, map, center, zoom, onLocationSelect]);

  return (
    <div className="relative h-full w-full">
      {/* Search Box Overlay */}
      <div className="absolute top-4 right-4 left-4 z-10">
        <div className="relative">
          <Search
            className={`
              absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform
              text-muted-foreground
            `}
          />
          <Input
            className={`
              border-gray-300 bg-white/95 pl-10 shadow-md backdrop-blur-sm
            `}
            placeholder="Search for places in Pakistan..."
            ref={searchInputRef}
          />
        </div>
      </div>

      {/* Map Container */}
      <div className="h-full w-full" ref={mapRef} />

      {/* Instructions */}
      <div className="absolute right-4 bottom-4 left-4 z-10">
        <div className="rounded-lg bg-white/90 p-3 shadow-md backdrop-blur-sm">
          <p className="text-center text-xs text-gray-600">
            💡 Search above, click on map, or drag the marker to select your
            delivery location
          </p>
        </div>
      </div>
    </div>
  );
};

const MapLoadingComponent = (status: Status) => {
  switch (status) {
    case Status.FAILURE:
      return (
        <div
          className={`
            flex h-[400px] w-full items-center justify-center rounded-lg border
            border-red-200 bg-red-50
          `}
        >
          <div className="p-6 text-center">
            <p className="mb-2 font-medium text-red-600">
              Failed to load Google Maps
            </p>
            <p className="text-sm text-red-500">
              Please check your API key configuration
            </p>
          </div>
        </div>
      );
    case Status.LOADING:
      return (
        <div
          className={`
            flex h-[400px] w-full items-center justify-center rounded-lg
            bg-gray-100
          `}
        >
          <div className="text-center">
            <div
              className={`
                mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-2
                border-blue-600
              `}
            ></div>
            <p className="text-gray-600">Loading Google Maps...</p>
          </div>
        </div>
      );
    default:
      return (
        <div
          className={`
            flex h-[400px] w-full items-center justify-center rounded-lg
            bg-gray-100
          `}
        >
          <p className="text-gray-600">Initializing map...</p>
        </div>
      );
  }
};

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
}) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedCoordinates, setSelectedCoordinates] = useState<null | {
    lat: number;
    lng: number;
  }>(null);

  // Handle location selection from map
  const handleLocationSelect = useCallback(
    (data: { address: string; coordinates: { lat: number; lng: number } }) => {
      setSelectedAddress(data.address);
      setSelectedCoordinates(data.coordinates);

      // Call parent callback if provided
      if (onLocationSelect) {
        onLocationSelect(data);
      }
    },
    [onLocationSelect]
  );

  const handleConfirm = () => {
    setIsMapOpen(false);
  };

  // Google Maps configuration
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const pakistanCenter = { lat: 30.3753, lng: 69.3451 }; // Center of Pakistan

  const isApiKeyConfigured = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== "";

  return (
    <>
      {/* Trigger Button */}
      <Button
        className="flex items-center gap-2"
        onClick={() => setIsMapOpen(true)}
        size="sm"
        variant="outline"
      >
        <MapPin className="h-4 w-4" />
        <span
          className={`
            hidden
            sm:inline
          `}
        >
          {selectedAddress ? "Update Location" : "Select Location on Map"}
        </span>
      </Button>

      {/* Selected Address Display */}
      {selectedAddress && (
        <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">
                📍 Selected Location:
              </p>
              <p className="mt-1 text-green-700">{selectedAddress}</p>
              {selectedCoordinates && (
                <p className="mt-2 text-xs text-green-600">
                  Coordinates: {selectedCoordinates.lat.toFixed(6)},{" "}
                  {selectedCoordinates.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Location Selection Dialog */}
      <Dialog onOpenChange={setIsMapOpen} open={isMapOpen}>
        <DialogContent
          className={`
            max-h-[90vh]
            sm:max-w-4xl
          `}
        >
          <DialogHeader>
            <DialogTitle>Select Delivery Location</DialogTitle>
            <DialogDescription>
              Use the map to pinpoint your exact delivery address
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {!isApiKeyConfigured ? (
              <div
                className={`rounded-lg border border-amber-200 bg-amber-50 p-6`}
              >
                <h4 className="mb-2 font-medium text-amber-800">
                  ⚠️ Setup Required
                </h4>
                <div className="space-y-2 text-sm text-amber-700">
                  <p>To enable map functionality, please:</p>
                  <ol className="ml-4 list-inside list-decimal space-y-1">
                    <li>
                      Get your API key from{" "}
                      <a
                        className="font-medium underline"
                        href="https://console.cloud.google.com/google/maps-apis"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Google Cloud Console
                      </a>
                    </li>
                    <li>
                      Enable: Maps JavaScript API, Places API, Geocoding API
                    </li>
                    <li>
                      Add to your .env.local:{" "}
                      <code className="rounded bg-amber-100 px-1">
                        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
                      </code>
                    </li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="h-[500px] w-full">
                <Wrapper
                  apiKey={GOOGLE_MAPS_API_KEY}
                  libraries={["places"]}
                  render={MapLoadingComponent}
                >
                  <GoogleMapComponent
                    center={pakistanCenter}
                    onLocationSelect={handleLocationSelect}
                    zoom={6}
                  />
                </Wrapper>
              </div>
            )}

            {/* Selected Address Display in Modal */}
            {selectedAddress && (
              <div
                className={`
                  mt-4 rounded-lg border border-green-200 bg-green-50 p-4
                `}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      📍 Selected Address:
                    </p>
                    <p className="mt-1 text-green-700">{selectedAddress}</p>
                    {selectedCoordinates && (
                      <p className="mt-2 text-xs text-green-600">
                        Coordinates: {selectedCoordinates.lat.toFixed(6)},{" "}
                        {selectedCoordinates.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div
              className={`mt-6 flex items-center justify-between border-t pt-4`}
            >
              <Button onClick={() => setIsMapOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button disabled={!selectedAddress} onClick={handleConfirm}>
                Confirm Location
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
