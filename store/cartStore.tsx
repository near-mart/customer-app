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

interface SupplierCart {
    supplierId: string;
    supplierName?: string;
    items: CartItem[];
}

interface CartStore {
    suppliers: Record<string, SupplierCart>;
    lastAction: string | null;

    addOrReplace: (supplierId: string, supplierName: string, item: CartItem) => void;
    increment: (supplierId: string, supplierName: string, item: CartItem) => void;
    decrement: (supplierId: string, supplierName: string, item: CartItem) => void;
    getQty: (supplierId: string, productId: string) => number | null;
    getVariantId: (supplierId: string, productId: string) => string | null;
    clearSupplierCart: (supplierId: string) => void;
    clearAll: () => void;
    recalcTotal: (supplierId: string) => void;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            suppliers: {},
            lastAction: null,

            // 🛒 Add or replace product
            addOrReplace: (supplierId, supplierName, item) => {
                const cart = get().suppliers[supplierId] || {
                    supplierId,
                    supplierName,
                    items: [],
                    totalAmount: 0,
                };
                const filtered = cart.items.filter((x) => x.productId !== item.productId);
                const updatedItems = [...filtered, { ...item, qty: 1 }];
                set({
                    suppliers: {
                        ...get().suppliers,
                        [supplierId]: { ...cart, items: updatedItems, },
                    },
                    lastAction: "add",
                });
            },

            // ➕ Increment — if not exists, create first
            increment: (supplierId, supplierName, item) => {

                const cart = get().suppliers[supplierId];
                if (!cart) {
                    // create new supplier entry
                    set({
                        suppliers: {
                            ...get().suppliers,
                            [supplierId]: {
                                supplierId,
                                supplierName,
                                items: [{ ...item, }],
                            },
                        },
                        lastAction: "add",
                    });
                    return;
                }

                const exists = cart.items.find((x) => x.productId === item.productId);
                const updatedItems = exists
                    ? cart.items.map((x) =>
                        x.productId === item.productId ? { ...x, qty: x.qty + 1 } : x
                    )
                    : [...cart.items, { ...item }];

                set({
                    suppliers: {
                        ...get().suppliers,
                        [supplierId]: { ...cart, items: updatedItems, },
                    },
                    lastAction: "increment",
                });
            },

            // ➖ Decrement — if not exists, add one (qty:1)
            decrement: (supplierId, supplierName, item) => {
                const cart = get().suppliers[supplierId];
                if (!cart) {
                    set({
                        suppliers: {
                            ...get().suppliers,
                            [supplierId]: {
                                supplierId,
                                supplierName,
                                items: [{ ...item }],
                            },
                        },

                        lastAction: "add",
                    });
                    return;
                }

                const exists = cart.items.find((x) => x.productId === item.productId);
                if (!exists) {
                    const updatedItems = [...cart.items, { ...item }];
                    set({
                        suppliers: {
                            ...get().suppliers,
                            [supplierId]: { ...cart, items: updatedItems, },
                        },
                        lastAction: "add",
                    });
                    return;
                }

                const updatedItems = cart.items
                    .map((x) =>
                        x.productId === item.productId ? { ...x, qty: Math.max(0, x.qty - 1) } : x
                    )
                    .filter((x) => x.qty > 0);

                set({
                    suppliers: {
                        ...get().suppliers,
                        [supplierId]: { ...cart, items: updatedItems, },
                    },
                    lastAction: "decrement",
                });
            },

            getQty: (supplierId, productId) => {
                const item = get().suppliers[supplierId]?.items.find((x) => x.productId == productId);
                return item ? item.qty : 0; // keep 0 valid, not null
            },
            getVariantId: (supplierId, productId) =>
                get().suppliers[supplierId]?.items.find((x) => x.productId === productId)?.variantId ||
                null,

            clearSupplierCart: (supplierId) => {
                const suppliers = { ...get().suppliers };
                delete suppliers[supplierId];
                set({ suppliers, lastAction: "clearSupplier" });
            },

            clearAll: () => set({ suppliers: {}, lastAction: "clearAll" }),

            recalcTotal: (supplierId) => {
                const cart = get().suppliers[supplierId];
                if (!cart) return;
                set({
                    suppliers: {
                        ...get().suppliers,
                        [supplierId]: { ...cart, },
                    },
                });
            },
        }),
        {
            name: "supplier-cart-storage",
            partialize: (state) => ({ suppliers: state.suppliers }),
        }
    )
);
