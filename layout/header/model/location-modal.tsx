"use client"
import React, { memo, useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { Crosshair, Plus, ChevronRight, MapPin, Search } from "lucide-react";
import useLocationStore from "@/store/location";
import { useFetchUser } from "@/hooks/useFetchUser";
import { useModalControl } from "@/hooks/useModalControl";
import { PickLocationModal } from "./pick-location-modal";

const savedAddresses = [
    {
        title: "Other",
        address: "plot 51, shyam baba chowk, dhankot, haryana, Sector 102, Gurugram",
    },
    {
        title: "Friend",
        address: "room O19, IH-B hostel, Teliyarganj, MNNIT Allahabad Campus, Prayagraj",
    },
    {
        title: "Home",
        address: "Shivaji Nagar, Pune, Maharashtra, India",
    },
    {
        title: "Home",
        address: "Shivaji Nagar, Pune, Maharashtra, India",
    },
    {
        title: "Home",
        address: "Shivaji Nagar, Pune, Maharashtra, India",
    },
    {
        title: "Home",
        address: "Shivaji Nagar, Pune, Maharashtra, India",
    },
    {
        title: "Home",
        address: "Shivaji Nagar, Pune, Maharashtra, India",
    },
];
const getCurrentLocationData = async () => {
    const GOOGLE_API_KEY = process.env.MAP_KEY;

    if (!GOOGLE_API_KEY) {
        throw new Error("Google Map API key missing");
    }

    if (!("geolocation" in navigator)) {
        throw new Error("Geolocation not supported");
    }

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;

                    const res = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
                    );

                    const data = await res.json();
                    if (!data.results?.length) throw new Error("No address found");

                    const item = data.results[0];
                    const components = item.address_components;

                    const get = (type: string) =>
                        components.find((c: any) => c.types.includes(type))?.long_name || "";

                    const route = get("route");
                    const sublocality = get("sublocality") || get("neighborhood");
                    const city =
                        components.find((c: any) => c.types.includes("locality"))
                            ?.long_name || "NA";

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
                        latitude,
                        longitude,
                        place_id: item.place_id,
                        route,
                    };

                    structured.display_short = `${structured.location || "Unknown"} - ${route || "Unnamed Road"
                        }, ${structured.city}, ${structured.state}`;

                    resolve(structured);
                } catch (err) {
                    reject(err);
                }
            },
            (err) => reject(err),
            { enableHighAccuracy: true, maximumAge: 0 }
        );
    });
};

export const LocationModal = memo(({ open, setOpen }: any) => {
    const { data, refetch } = useFetchUser()
    useEffect(() => {
        if (open) {
            refetch();
        }
    }, [open]);

    const { setLocationData } = useLocationStore();
    const [loading, setLoading] = useState(false);

    // ✅ current location handler
    const handleCurrentLocation = async () => {
        try {
            setLoading(true);
            const structured: any = await getCurrentLocationData();
            setLocationData(structured);
            setOpen(false);
        } catch (error) {
            console.error("Location error:", error);
            alert("Unable to fetch location. Please enable GPS.");
        } finally {
            setLoading(false);
        }
    };
    const { open: isOpen, handleCloseModal, handleOpenModal } = useModalControl()

    return (
        <Dialog open={open} onOpenChange={setOpen} >
            {isOpen && <PickLocationModal open={isOpen} setOpen={handleCloseModal} />}
            <DialogContent className="max-w-lg max-h-[80vh] rounded-xl w-md p-0 overflow-hidden z-50 bg-white">

                {/* Header */}
                <DialogHeader className="px-5 py-4 border-b">
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                        Your Location
                    </DialogTitle>
                </DialogHeader>

                {/* Body */}
                <div className="px-5 pb-6">

                    {/* Search Input */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <Input
                            placeholder="Search a new address"
                            className="pl-10 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-pink-500"
                        />
                    </div>
                    <ScrollArea className="h-[400px] pr-2">

                        {/* Options Card */}
                        <div className="border rounded-xl overflow-hidden">

                            {/* Current Location */}
                            <button
                                onClick={handleCurrentLocation}
                                disabled={loading}
                                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition disabled:opacity-60"
                            >
                                <Crosshair size={20} className="text-pink-600" />
                                <span className="text-sm font-medium text-pink-600">
                                    {loading ? "Detecting location..." : "Use My Current Location"}
                                </span>
                            </button>


                            <Separator />

                            {/* Add Address */}
                            <button onClick={handleOpenModal} className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition">
                                <div className="flex items-center gap-3">
                                    <Plus size={20} className="text-pink-600" />
                                    <span className="text-sm font-medium text-pink-600">
                                        Add New Address
                                    </span>
                                </div>

                                <ChevronRight size={18} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Saved Addresses */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 mt-2">
                                Saved Addresses
                            </h3>


                            <div className="space-y-3">
                                {savedAddresses.map((item, index) => (
                                    <button
                                        key={index}
                                        className="w-full flex gap-3 items-start text-left p-2 border rounded-xl hover:bg-gray-50 transition"
                                    >
                                        <MapPin size={20} className="text-gray-500 mt-1" />

                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                                {item.address}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </ScrollArea>

                </div>
            </DialogContent>
        </Dialog>
    );
})
