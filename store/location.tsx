
import { create } from "zustand";
import { persist } from "zustand/middleware";

type LocationData = {
    address?: string;
    location?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
    latitude?: number;
    longitude?: number;
    place_id?: string;
    route?: string;
};

type Store = {
    locationData: LocationData | null;
    setLocationData: (data: LocationData) => void;
};

const useLocationStore = create<Store>()(
    persist(
        (set) => ({
            count: 1,
            locationData: null,
            setLocationData: (data) => set({ locationData: data }),
            inc: () => set((state) => ({ count: state.count + 1 })),
        }),
        {
            name: "location",
        }
    )
);

export default useLocationStore;
