"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { getCart, addToCart } from "@/services/products";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Home, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function CartPage() {
    const queryClient = useQueryClient();
    const {
        suppliers,
        increment,
        decrement,
        clearSupplierCart,
        recalcTotal,
        getQty,
    } = useCartStore();

    // 🧩 Fetch backend cart
    const { data, isLoading } = useQuery({
        queryKey: ["getCart"],
        queryFn: ({ signal }) => getCart(signal),
    });

    // 🔁 Optimistic sync with backend
    const { mutateAsync } = useMutation({
        mutationFn: addToCart,
        // ⚡ don’t immediately refetch on success — we handle it manually
        onSuccess: () => {
            // optional background refresh (without UI blocking)
            queryClient.invalidateQueries(["getCart"], { refetchType: "inactive" });
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

    // 🧱 Skeleton while loading
    if (isLoading)
        return (
            <div className="min-h-screen flex flex-col gap-2 mt-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-6 w-24" />
                </div>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="border rounded-2xl shadow-sm p-0">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Skeleton className="w-20 h-20 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-1/3" />
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-8 w-20 rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );

    const cartData = data?._payload || [];

    if (!cartData.length)
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400 text-lg">
                🛒 Your cart is empty
            </div>
        );

    // ⚙️ Quantity logic — instantly reflect changes
    const handleQtyChange = (group: any, item: any, product: any, newQty: number) => {
        const variant = product.variants?.find((v: any) => v._id === item.variant_id);
        if (!variant) return;

        const cartItem = {
            productId: product._id,
            variantId: variant._id,
            name: product.name,
            price: variant.discount_price || variant.selling_price,
            image: product.images?.[0]?.url,
            unit: variant.unit,
            selling_qty: variant.selling_qty,
            qty: newQty,
        };

        // 🧠 Update Zustand store immediately for instant feedback
        if (newQty <= 0) {
            decrement(group.supplier_id, group.supplier?.storeName, cartItem);
        } else if (newQty > getQty(group.supplier_id, product._id)) {
            increment(group.supplier_id, group.supplier?.storeName, cartItem);
        } else {
            decrement(group.supplier_id, group.supplier?.storeName, cartItem);
        }

        // ♻️ Recalculate total locally
        recalcTotal(group.supplier_id);

        // 🔄 Sync in background
        debouncedSync(group.supplier_id, product._id, variant._id, newQty);
    };

    const handleRemove = (group: any, item: any, product: any) => {
        const variant = product.variants?.find((v: any) => v._id === item.variant_id);
        if (!variant) return;
        clearSupplierCart(group.supplier_id);
        debouncedSync(group.supplier_id, product._id, variant._id, 0);
    };

    return (
        <>
            <nav aria-label="Breadcrumb" itemScope itemType="https://schema.org/BreadcrumbList" className="mb-2 mt-6">
                <ol className="flex items-center text-sm" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                    <li className="flex items-center gap-1 text-gray-600 hover:text-primary" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        <Link href="/" itemProp="item" className="flex items-center gap-1 text-gray-600 hover:text-primary">
                            <Home className="w-4 h-4" />
                            <span itemProp="name">Home</span>
                        </Link>
                        <meta itemProp="position" content="1" />
                    </li>
                    <ChevronRight className="mx-2 text-gray-400" />
                    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        <span className="text-primary font-medium" itemProp="name">Cart</span>
                        <meta itemProp="position" content="2" />
                    </li>
                </ol>
            </nav>


            <h1 className="text-2xl font-bold mb-6 mt-6 text-primary flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-primary" /> Your Cart
            </h1>
            <Accordion type="single" defaultValue="supplier-0" collapsible className="space-y-4">
                {cartData.map((group: any, idx: number) => {
                    const supplierName = group.supplier?.storeName || "Unknown Supplier";
                    const supplierTotal = group.items.reduce((sum: number, item: any) => {
                        const product = item.product?.[0];
                        if (!product) return sum;
                        const variant = product.variants?.find(
                            (v: any) => v._id === item.variant_id
                        );
                        const price = variant?.discount_price || variant?.selling_price || 0;
                        return sum + price * item.qty;
                    }, 0);

                    return (
                        <AccordionItem
                            key={idx}
                            value={`supplier-${idx}`}
                            className="border rounded-2xl shadow-sm"
                        >
                            <AccordionTrigger className="flex cursor-pointer items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <Link href={`/store/${group.supplier?.handle}`}>
                                    <div>
                                        <p className="font-semibold text-lg text-gray-800">
                                            {supplierName}
                                        </p>
                                        <p className="text-sm text-gray-500">{group.supplier?.handle}</p>
                                    </div>
                                </Link>
                                {/* <div className="text-right">
                                    <p className="text-sm text-gray-500">Subtotal</p>
                                    <p className="font-semibold text-green-700 text-lg">
                                        ₹{supplierTotal.toFixed(2)}
                                    </p>
                                </div> */}
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
                                            const productUrl = `/store/${group.supplier?.handle}/${parentCategory?.handle}/${childCategory?.handle}/${product.handle}-${product._id}`;

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
                                    </CardContent>
                                </Card>

                                {/* ✅ Checkout */}
                                <div className="flex justify-between items-center p-4 bg-gray-50 border-t flex-wrap gap-4">
                                    <p className="text-gray-700 font-medium">
                                        Total: ₹{supplierTotal.toFixed(2)}
                                    </p>
                                    <Button className="rounded-xl px-6 py-2 text-base w-full md:w-auto">
                                        Checkout from {supplierName.split(" ")[0]}
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </>
    );
}
