"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Crosshair, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import useLocationStore from "@/store/location";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import Image from "next/image";

export const PickLocationModal = memo(({ open, setOpen }: any) => {
    const { locationData, setLocationData } = useLocationStore();

    const [center, setCenter] = useState({
        lat: locationData?.latitude || 28.6139,
        lng: locationData?.longitude || 77.209,
    });
    console.log(center, "center");


    const [addressInfo, setAddressInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // ✅ Reverse Geocode (lat/lng -> address)
    const fetchAddressFromLatLng = async (lat: number, lng: number) => {
        try {
            setLoading(true);

            const GOOGLE_API_KEY = process.env.MAP_KEY;
            if (!GOOGLE_API_KEY) return;

            const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
            );

            const data = await res.json();
            if (!data.results?.length) return;

            const item = data.results[0];
            const components = item.address_components;

            const get = (type: string) =>
                components.find((c: any) => c.types.includes(type))?.long_name || "";

            const route = get("route");
            const sublocality = get("sublocality") || get("neighborhood");

            const city =
                components.find((c: any) => c.types.includes("locality"))?.long_name ||
                "NA";

            const state =
                components.find((c: any) =>
                    c.types.includes("administrative_area_level_1")
                )?.long_name || "NA";

            const structured: any = {
                address: item.formatted_address,
                location: sublocality || city,
                city,
                state,
                country: get("country"),
                zip: get("postal_code"),
                latitude: lat,
                longitude: lng,
                place_id: item.place_id,
                route,
            };

            structured.display_short = `${structured.location || "Unknown"} - ${route || "Unnamed Road"
                }, ${structured.city}, ${structured.state}`;

            setAddressInfo(structured);
        } catch (err) {
            console.log("fetchAddressFromLatLng error:", err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ When modal opens, fetch address
    useEffect(() => {
        if (open) {
            fetchAddressFromLatLng(center.lat, center.lng);
        }
    }, [open]);

    const handlePinMove = (pos: any) => {
        clearTimeout((window as any).pinTimer);

        (window as any).pinTimer = setTimeout(() => {
            fetchAddressFromLatLng(pos.lat, pos.lng);
        }, 700);
    };
    // ✅ Confirm Button Save
    const handleConfirm = () => {
        if (!addressInfo) return;

        localStorage.setItem("user_address", JSON.stringify(addressInfo));
        setLocationData(addressInfo);

        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden rounded-2xl bg-white">
                {/* Header */}
                <DialogHeader className="px-5 py-4 border-b">
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                        Location Information
                    </DialogTitle>
                </DialogHeader>

                {/* Search Bar */}
                <div className="px-5">
                    <div className="relative">
                        <Search className="absolute left-3 top-2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search a new address"
                            className="pl-10 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-pink-500"
                        />
                    </div>
                </div>

                {/* Map */}
                <MapSection center={center} setCenter={setCenter}
                    onCenterChange={handlePinMove}
                />

                {/* Bottom Info Card */}
                <div className="p-5 bg-white border-t">
                    <h3 className="text-base font-semibold text-gray-900">
                        {addressInfo?.route || "Unnamed Road"}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                        {loading ? "Fetching address..." : addressInfo?.address || "NA"}
                    </p>

                    <Button
                        disabled={!addressInfo || loading}
                        onClick={handleConfirm}
                        className="w-full mt-4 bg-pink-600 hover:bg-pink-700 rounded-xl py-6 text-base font-semibold disabled:opacity-50"
                    >
                        Confirm & Continue
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
});


// ---------------- MAP COMPONENT ----------------

const containerStyle = {
    width: "100%",
    height: "300px",
};

function MapSection({ center, setCenter, onCenterChange }: any) {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.MAP_KEY as string,
    });

    const handleIdle = (map: any) => {
        if (!mapRef.current) return;

        const newCenter = mapRef.current.getCenter();
        if (!newCenter) return;
        const updated = {
            lat: newCenter.lat(),
            lng: newCenter.lng(),
        };
        setCenter(updated);
        onCenterChange(updated);
    };
    const mapRef = useRef<any>(null);

    const handleLoad = (map: any) => {
        mapRef.current = map;
    };

    if (!isLoaded) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center bg-gray-100">
                <p className="text-gray-500 text-sm">Loading Map...</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[300px] overflow-hidden">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={16}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                }}
                onLoad={handleLoad}   // ✅ map instance stored
                onIdle={handleIdle}   // ✅ no params
            />

            {/* Pin Tooltip */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
                <div className="relative bg-black text-white px-4 py-3 rounded-xl shadow-lg text-center -translate-y-12">
                    <p className="font-semibold text-sm">Order will be delivered here</p>
                    <p className="text-xs text-gray-300">
                        Place the pin to your exact location
                    </p>

                    <div className="absolute left-1/2 -translate-x-1/2 bottom-[-10px] w-0 h-0 
            border-l-[10px] border-l-transparent 
            border-r-[10px] border-r-transparent 
            border-t-[10px] border-t-black" />
                </div>

                <div className="-translate-y-10">
                    <Image
                        alt="location-pin"
                        src="/location-pin.svg"
                        width={50}
                        height={50}
                    />
                </div>
            </div>

            {/* Current Location Button */}
            <button
                onClick={() => {
                    if ("geolocation" in navigator) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                            setCenter({
                                lat: pos.coords.latitude,
                                lng: pos.coords.longitude,
                            });
                        });
                    }
                }}
                className="absolute bottom-6 right-6 z-20 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition"
            >
                <Crosshair className="text-pink-600" size={20} />
            </button>
        </div>
    );
}
