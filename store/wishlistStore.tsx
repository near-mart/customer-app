import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistItem {
    productId: string;
    name: string;
    image?: string;
}

interface WishlistState {
    wishlist: WishlistItem[];
    addWishlist: (item: WishlistItem) => void;
    removeWishlist: (productId: string) => void;
    isWishlisted: (productId: string) => boolean;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            wishlist: [],

            addWishlist: (item) =>
                set((state) => {
                    const exists = state.wishlist.some((p) => p.productId === item.productId);
                    if (exists) return state;
                    return { wishlist: [...state.wishlist, item] };
                }),

            removeWishlist: (productId) =>
                set((state) => ({
                    wishlist: state.wishlist.filter((p) => p.productId !== productId),
                })),

            isWishlisted: (productId) => {
                return get().wishlist.some((p) => p.productId === productId);
            },

            clearWishlist: () => set({ wishlist: [] }),
        }),
        { name: "wishlist-storage" } // 🔒 persisted in localStorage
    )
);
