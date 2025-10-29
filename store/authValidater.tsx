import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
    id?: string;
    name?: string;
    email?: string;
    profile?: string;
    // add more fields if you know them
    [key: string]: any;
}

interface AuthState {
    isAuthenticate: boolean;
    user: User | null;
    handleAuthenticate: (value: boolean) => void;
    handleUserDetails: (value: User) => void;
}

export const useAuthValidator = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticate: false,
            user: null,
            handleAuthenticate: (value: boolean) =>
                set(() => ({ isAuthenticate: value })),
            handleUserDetails: (value: User) =>
                set(() => ({ user: value })),
        }),
        {
            name: "auth-storage",
            getStorage: () => localStorage,
        }
    )
);
