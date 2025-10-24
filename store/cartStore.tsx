import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
    productId: string;
    variantId: string;
    name: string;
    qty: number;
    price: number;
    image?: string;
    unit?: string;
    selling_qty?: number;
}

interface CartStore {
    items: CartItem[];
    addOrReplace: (item: CartItem) => void; // 👈 new logic
    increment: (productId: string) => void;
    decrement: (productId: string) => void;
    getQty: (productId: string) => number;
    getVariantId: (productId: string) => string | null;
    clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addOrReplace: (item) => {
                // remove any existing variant of same product
                const filtered = get().items.filter((x) => x.productId !== item.productId);
                set({ items: [...filtered, { ...item, qty: 1 }] });
            },

            increment: (productId) =>
                set({
                    items: get().items.map((x) =>
                        x.productId === productId ? { ...x, qty: x.qty + 1 } : x
                    ),
                }),

            decrement: (productId) =>
                set({
                    items: get().items
                        .map((x) =>
                            x.productId === productId ? { ...x, qty: x.qty - 1 } : x
                        )
                        .filter((x) => x.qty > 0),
                }),

            getQty: (productId) =>
                get().items.find((x) => x.productId === productId)?.qty || 0,

            getVariantId: (productId) =>
                get().items.find((x) => x.productId === productId)?.variantId || null,

            clearCart: () => set({ items: [] }),
        }),
        { name: "cart-storage" }
    )
);
