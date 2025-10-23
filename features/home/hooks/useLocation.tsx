import useLocationStore from '@/store/location';
import { useEffect, useState } from 'react'

export default function useLocation() {
    const [displayAddress, setDisplayAddress] = useState("Detecting your location...")
    const { setLocationData } = useLocationStore()

    useEffect(() => {
        async function fetchAddress() {
            try {
                const GOOGLE_API_KEY = "AIzaSyAMaoFT75bVo6fDtCV1NdgKlIb35yV7ZD8";
                // const response = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_API_KEY}`, {
                //     method: "POST",
                // });
                // const { location } = await response.json();
                // console.log(location);
                const saved = localStorage.getItem("user_address");
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setDisplayAddress(parsed.display_short || `${parsed.city}, ${parsed.state}`);
                }

                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        async (pos) => {
                            const { latitude, longitude } = pos.coords;

                            const res = await fetch(
                                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
                            );
                            const data = await res.json();
                            if (!data.results?.length) return;

                            const item = data.results[0];
                            const components = item.address_components;
                            const get = (type: string) =>
                                components.find((c) => c.types.includes(type))?.long_name || "";

                            const route = get("route");
                            const sublocality = get("sublocality") || get("neighborhood");
                            const city = item.address_components.find((comp) => comp.types.includes("locality"))?.long_name || "NA";
                            const state = item.address_components.find((comp) => comp.types.includes("administrative_area_level_1"))?.long_name || "NA";

                            // 🧩 Structured data
                            const structured = {
                                address: item.formatted_address,
                                location: sublocality || city,
                                city,
                                state,
                                country: get("country"),
                                zip: get("postal_code"),
                                latitude,
                                longitude,
                                place_id: item.place_id,
                                route
                            };

                            const display_short = `${structured.location || "Unknown"} - ${route || "Unnamed Road"}, ${structured.city}, ${state}`;
                            structured.display_short = display_short;
                            localStorage.setItem("user_address", JSON.stringify(structured));
                            setDisplayAddress(display_short);
                            setLocationData(structured)
                        },
                        (err) => {
                            console.error("Location error:", err);
                            setDisplayAddress("Set delivery location");
                        },
                        { enableHighAccuracy: true, maximumAge: 0 }
                    );
                } else {
                    setDisplayAddress("Location not supported");
                }
            } catch (error) {
                console.error("Address fetch failed:", error);
                setDisplayAddress("Unable to detect location");
            }
        }

        fetchAddress();
    }, []);
    return { displayAddress }
}
