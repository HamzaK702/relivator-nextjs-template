"use client";

import { MapPin, Navigation } from "lucide-react";
import React, { useRef, useState } from "react";

import { useStoreSettings } from "~/lib/hooks/use-store-settings";
import { Button } from "~/ui/primitives/button";
import { Input } from "~/ui/primitives/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/ui/primitives/popover";

const Hero = () => {
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState<string>("");
  // const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const { settings } = useStoreSettings();
  const handleConfirmAddress = () => {
    document.body.click(); // Close popover
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAddress(
            `Lat: ${position.coords.latitude.toFixed(
              4
            )}, Lng: ${position.coords.longitude.toFixed(4)}`
          );
          document.body.click(); // Close popover
        },
        (error) => {
          console.error("Error getting location: ", error);
        }
      );
    }
  };

  return (
    <section
      className={`
        relative overflow-hidden bg-gradient-to-r from-[#F2FCE2] to-[#E5DEFF]
      `}
    >
      <div className="absolute right-0 bottom-0 h-full w-1/3">
        <img
          alt="Food background"
          className="h-full w-full object-cover opacity-80"
          src={settings?.headerImage}
        />
        <div
          className={`
            absolute inset-0 bg-gradient-to-l from-transparent to-[#F2FCE2]
          `}
        ></div>
      </div>

      <div
        className={`
          relative z-10 container mx-auto px-4 py-16
          md:py-24
        `}
      >
        <div className="max-w-xl">
          <h2
            className={`
              font-heading mb-4 text-3xl font-bold text-gray-800
              md:text-4xl
              lg:text-5xl
            `}
          >
            {settings?.bannerHeading}
          </h2>
          <p className="mb-8 max-w-md text-lg text-gray-700">
            Experience traditional flavors and spices that will transport you
            straight to the streets of Lahore.
          </p>

          <div
            className={`
              mb-8 max-w-md rounded-lg bg-white/80 p-6 shadow-lg
              backdrop-blur-sm
            `}
          >
            <h3 className="mb-4 text-xl font-medium text-gray-800">
              Order Now
            </h3>

            <div className="mb-5 flex rounded-lg bg-gray-50 p-1">
              <button
                className={`
                  flex-1 rounded-md px-4 py-2 text-sm font-medium transition
                  ${
                    orderType === "delivery"
                      ? `text-restaurant-primary bg-white shadow-sm`
                      : `
                        text-gray-600
                        hover:bg-gray-100
                      `
                  }
                `}
                onClick={() => setOrderType("delivery")}
              >
                Delivery
              </button>
              <button
                className={`
                  flex-1 rounded-md px-4 py-2 text-sm font-medium transition
                  ${
                    orderType === "pickup"
                      ? `text-restaurant-primary bg-white shadow-sm`
                      : `
                        text-gray-600
                        hover:bg-gray-100
                      `
                  }
                `}
                onClick={() => setOrderType("pickup")}
              >
                Pickup
              </button>
            </div>

            {orderType === "delivery" ? (
              <div className="space-y-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <div
                      className={`
                        flex cursor-pointer items-center rounded border
                        border-gray-200 bg-gray-50 p-3 transition
                        hover:bg-gray-100
                      `}
                    >
                      <MapPin className="text-restaurant-primary mr-3 h-5 w-5" />
                      {address ? (
                        <span className="flex-1 truncate text-sm text-gray-700">
                          {address}
                        </span>
                      ) : (
                        <span className="flex-1 text-sm text-gray-500">
                          Enter delivery address
                        </span>
                      )}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[350px] p-4">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Delivery Address</h4>
                      <Input
                        className="w-full"
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your address"
                        value={address}
                      />

                      <div
                        className={`
                          relative mb-2 h-[200px] overflow-hidden rounded-md
                          bg-gray-100
                        `}
                        ref={mapRef}
                      >
                        <div
                          className={`
                            absolute inset-0 flex items-center justify-center
                            text-gray-500
                          `}
                        >
                          <div className="text-center">
                            <MapPin
                              className={`
                                text-restaurant-primary mx-auto mb-2 h-8 w-8
                              `}
                            />
                            <p className="text-sm">Map View</p>
                            <p className="mt-1 text-xs text-gray-400">
                              Click to select a location
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={handleUseCurrentLocation}
                          size="sm"
                          variant="outline"
                        >
                          <Navigation className="mr-2 h-4 w-4" />
                          Use Current Location
                        </Button>
                        <Button
                          className={`
                            bg-restaurant-primary flex-1
                            hover:bg-restaurant-accent
                          `}
                          onClick={handleConfirmAddress}
                          size="sm"
                        >
                          Confirm Address
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-500">
                  Delivery available within 5 miles radius
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Pick up your order from our nearest location.
                </p>
                <div
                  className={`
                    bg-restaurant-pastel-green/50 border-restaurant-primary/20
                    rounded-md border p-3
                  `}
                >
                  <h4 className="text-restaurant-primary text-sm font-medium">
                    Main Branch
                  </h4>
                  <p className="mt-1 text-xs text-gray-600">
                    123 Food Street, Lahore, Pakistan
                  </p>
                  <p className="text-restaurant-accent mt-1 text-xs">
                    Open: 10:00 AM - 11:00 PM
                  </p>
                </div>
              </div>
            )}

            <Button
              className={`
                bg-restaurant-primary mt-5 w-full text-white
                hover:bg-restaurant-accent
              `}
              size="lg"
            >
              Continue to Menu
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
