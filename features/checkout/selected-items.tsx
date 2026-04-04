"use client"
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { addToCart } from '@/services/products';
import { useCartStore } from '@/store/cartStore';
import { Accordion } from '@radix-ui/react-accordion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { memo, useCallback, useEffect } from 'react'
export const QtyLoader = ({ text = "Updating cart..." }: { text?: string }) => {
    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/10 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-lg px-6 py-5 flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-gray-300 border-t-pink-600 animate-spin"></div>
                <p className="text-sm font-medium text-gray-700">{text}</p>
            </div>
        </div>
    );
};

export const SelectedItems = memo(({ selectedSupplier, store, timing }: any) => {

    const queryClient = useQueryClient();
    const {
        increment,
        decrement,
        clearSupplierCart,
        recalcTotal,
        getQty,
    } = useCartStore();

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ["getCart"] });
    }, [queryClient]);

    const { mutateAsync, isPending } = useMutation({
        mutationFn: addToCart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["getCart"] });
        },
    });

    const debouncedSync = useCallback(
        debounce(async (supplier_id, product_id, variant_id, qty) => {
            try {
                await mutateAsync({ supplier_id, product_id, variant_id, qty });
            } catch (err) {
                console.error("Sync failed:", err);
            }
        }, 400),
        []
    );

    const handleQtyChange = (group: any, item: any, product: any, newQty: number) => {
        const variant = product.variants?.find((v: any) => v._id === item.variant_id);
        if (!variant) return;

        const cartItem = {
            qty: newQty,
            productId: product._id,
            variantId: variant._id,
            ...product,

        };

        if (newQty <= 0) {
            decrement(group.supplier_id, group.supplier?.storeName, cartItem);
        } else if (newQty > (getQty(group.supplier_id, product._id) || 0)) {
            increment(group.supplier_id, group.supplier?.storeName, cartItem);
        } else {
            decrement(group.supplier_id, group.supplier?.storeName, cartItem);
        }

        recalcTotal(group.supplier_id);

        debouncedSync(group.supplier_id, product._id, variant._id, newQty);
    };
    const handleRemove = (group: any, item: any, product: any) => {
        const variant = product.variants?.find((v: any) => v._id === item.variant_id);
        if (!variant) return;
        clearSupplierCart(group.supplier_id);
        debouncedSync(group.supplier_id, product._id, variant._id, 0);
    };

    return (
        <div>
            {
                isPending ? <QtyLoader /> : null
            }
            <Accordion type="single" defaultValue="supplier-0" collapsible={false} className="space-y-4">
                {selectedSupplier.map((group: any, idx: number) => {
                    const supplierName = group.supplier?.storeName || "Unknown Supplier";
                    const supplierHandle = group.supplier?.handle || "Unknown Supplier";
                    return (
                        <AccordionItem
                            key={idx}
                            value={`supplier-${idx}`}
                            className="border rounded-2xl shadow-sm"
                        >
                            <AccordionTrigger className="flex cursor-pointer items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <div className="flex items-center justify-between w-full gap-4">

                                    {/* Left: Supplier Info */}
                                    <Link href={`/store/${group.supplier?.handle}`} className="flex-1">
                                        <div>
                                            <p className="font-semibold text-lg text-gray-800">
                                                {supplierName}
                                            </p>
                                            <p className="text-sm text-gray-500">{supplierHandle}</p>
                                        </div>
                                    </Link>

                                    {/* Right: ETA Time */}
                                    <div className="text-right shrink-0">
                                        <p className="text-xs text-gray-500">Delivery</p>
                                        <p className="text-sm font-semibold text-green-700">
                                            {timing?.etaText || "Calculating..."}
                                        </p>
                                    </div>

                                </div>
                            </AccordionTrigger>

                            <AccordionContent>
                                <Card className="rounded-none border-t-0 border-x-0 border-b py-0">
                                    <CardContent className="divide-y">
                                        {group.items.map((item: any, i: number) => {
                                            const product = item.product?.[0];
                                            if (!product) return null;

                                            const variant = product.variants?.find(
                                                (v: any) => v._id === item.variant_id
                                            );
                                            const price =
                                                variant?.discount_price || variant?.selling_price || 0;
                                            const lineTotal = price * item.qty;
                                            const parentCategory = product?.categories?.find(
                                                (it) => it.parent == null
                                            );
                                            const childCategory = product?.categories?.find(
                                                (it) => it.parent != null
                                            );
                                            const productUrl = `/store/${group.supplier?.handle}/${parentCategory?.handle}/${childCategory?.handle}/${product.handle}/${product._id}`;

                                            return (
                                                <div
                                                    key={i}
                                                    className="flex justify-between items-center py-4 gap-4"
                                                >
                                                    {/* 🖼️ Product Info */}
                                                    <div className="flex items-center gap-4 w-full relative">
                                                        <Link href={productUrl} aria-label={product.name}>
                                                            <div className="relative">
                                                                <Image
                                                                    src={
                                                                        product.images?.[0]?.url ||
                                                                        "/product-placeholder.svg"
                                                                    }
                                                                    alt={product.name}
                                                                    width={80}
                                                                    height={80}
                                                                    className="rounded-lg object-cover border w-20 h-20 sm:w-24 sm:h-24"
                                                                />

                                                                {/* 📱 Mobile Qty Controls */}
                                                                <div
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                    }}
                                                                    className="absolute bottom-1 right-1 flex sm:hidden items-center bg-white/90 border border-pink-600 rounded-md px-2 py-1"
                                                                >
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            handleQtyChange(
                                                                                group,
                                                                                item,
                                                                                product,
                                                                                Math.max(0, +(getQty(group.supplier_id, product._id) || item.qty) - 1)
                                                                            );
                                                                        }}
                                                                        className="text-pink-600 px-1 cursor-pointer"
                                                                    >
                                                                        <Minus size={14} />
                                                                    </button>
                                                                    <span className="text-[11px] font-medium px-1">
                                                                        {getQty(group.supplier_id, product._id) || item.qty}
                                                                    </span>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            handleQtyChange(
                                                                                group,
                                                                                item,
                                                                                product,
                                                                                +(getQty(group.supplier_id, product._id) || item.qty) + 1
                                                                            );
                                                                        }}
                                                                        className="text-pink-600 px-1 cursor-pointer"
                                                                    >
                                                                        <Plus size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </Link>

                                                        <div className="flex-1">
                                                            <Link href={productUrl} aria-label={product.name}>
                                                                <h3 className="font-medium text-gray-800 line-clamp-1 hover:underline inline">
                                                                    {product.name}
                                                                </h3>
                                                            </Link>
                                                            <p className="text-sm text-gray-500">
                                                                {variant?.selling_qty} {variant?.unit}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <p className="font-semibold text-green-700">
                                                                    ₹{price}
                                                                </p>
                                                                {variant?.discount_price !==
                                                                    variant?.selling_price && (
                                                                        <p className="text-sm text-gray-400 line-through">
                                                                            ₹{variant?.selling_price}
                                                                        </p>
                                                                    )}
                                                            </div>

                                                            {/* 🗑 Remove (Mobile) */}
                                                            <button
                                                                onClick={() => handleRemove(group, item, product)}
                                                                className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1 mt-1 cursor-pointer"
                                                            >
                                                                <Trash2 size={13} /> Remove
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* 🧮 Desktop Qty Controls */}
                                                    <div className="hidden sm:flex flex-col items-end gap-2 min-w-[90px]">
                                                        <div className="flex items-center gap-2 border rounded-lg px-2 py-1 bg-white">
                                                            <button
                                                                onClick={() =>
                                                                    handleQtyChange(
                                                                        group,
                                                                        item,
                                                                        product,
                                                                        Math.max(0, +(getQty(group.supplier_id, product._id) || item.qty) - 1)
                                                                    )
                                                                }
                                                                className="text-pink-600 p-1 hover:bg-pink-50 rounded cursor-pointer"
                                                            >
                                                                <Minus size={14} />
                                                            </button>
                                                            <span className="font-medium text-sm w-5 text-center">
                                                                {getQty(group.supplier_id, product._id) || item.qty}
                                                            </span>
                                                            <button
                                                                onClick={() =>
                                                                    handleQtyChange(
                                                                        group,
                                                                        item,
                                                                        product,
                                                                        +(getQty(group.supplier_id, product._id) || item.qty) + 1
                                                                    )
                                                                }
                                                                className="text-pink-600 p-1 hover:bg-pink-50 rounded cursor-pointer"
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>
                                                        <p className="text-sm text-gray-500">
                                                            ₹{lineTotal.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div className="mt-4 mb-4 flex flex-col items-center text-center gap-3 px-4 sm:px-0">
                                            <p className="text-sm text-gray-500">
                                                Looks like you might be missing something 👀
                                            </p>

                                            <Link href={`/store/${store}`} className="w-full sm:w-auto">
                                                <Button
                                                    className="flex w-full sm:w-auto items-center justify-center gap-2
                 rounded-xl border border-pink-600
                 bg-pink-600 text-white font-medium
                 hover:bg-pink-500 hover:text-white
                 transition-all duration-200"
                                                >
                                                    <Plus size={18} />
                                                    Continue shopping
                                                </Button>
                                            </Link>
                                        </div>


                                    </CardContent>
                                </Card>


                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    )
})
