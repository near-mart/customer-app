// @ts-nocheck
"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthValidator } from "@/store/authValidater";
import { Heart, Minus, Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { debounce } from "lodash";
import { addToCart, toggleWishlist } from "@/services/products";

export function ProductCard({ product, deliveryNotAllow = false }: any) {
    const variants = product.variants || [];
    const allOutOfStock = variants.every((v) => v.stock <= 0) || product.status === "out_of_stock";
    const defaultVariant = variants.find((v) => v.stock > 0) || variants[0];

    const supplierId = product?.supplier_id;
    const supplierName = product?.storeName || product?.supplier?.name;

    const { addOrReplace, increment, decrement } = useCartStore();

    // 🛒 Reactive Cart State
    const cartVariantId = useCartStore((state) => state.getVariantId(supplierId, product._id));
    const qty = useCartStore((state) => state.getQty(supplierId, product._id)) ?? 0;

    // 🚀 Initialize from Cart Storage on refresh/mount to prevent flicker
    const [selectedVariant, setSelectedVariant] = useState(() => {
        if (cartVariantId) {
            return variants.find((v: any) => v._id === cartVariantId) || defaultVariant;
        }
        return defaultVariant;
    });

    const { isAuthenticate } = useAuthValidator((state) => state);
    const { addWishlist, removeWishlist } = useWishlistStore();
    const wishlisted = useWishlistStore((state) => state.wishlist.some((p: any) => p.productId === product._id));
    const [loadingWishlist, setLoadingWishlist] = useState(false);

    // 🔄 Reactive Sync: If cart state changes elsewhere, keep this card in sync
    useEffect(() => {
        if (cartVariantId) {
            const v = variants.find((it: any) => it._id === cartVariantId);
            if (v && v._id !== selectedVariant?._id) {
                setSelectedVariant(v);
            }
        }
    }, [cartVariantId, variants]);


    // 💰 Price & Savings memoization
    const { finalPrice, mrp, savingsAmt } = useMemo(() => {
        const selling = selectedVariant?.selling_price || 0;
        const discount = selectedVariant?.discount_price || 0;
        return {
            finalPrice: discount,
            mrp: selling,
            savingsAmt: selling - discount
        };
    }, [selectedVariant]);

    const { mutate } = useMutation({
        mutationFn: addToCart,
        onError: (err) => console.error("🛑 Cart API failed:", err),
    });

    const debouncedSync = useMemo(
        () =>
            debounce((supplier_id, product_id, variant_id, qty) => {
                mutate({ supplier_id, product_id, variant_id, qty });
            }, 500),
        [mutate]
    );

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addOrReplace(supplierId, supplierName, {
            productId: product._id,
            variantId: selectedVariant._id,
            qty: 1,
            ...product
        });
        if (isAuthenticate) debouncedSync(supplierId, product._id, selectedVariant._id, 1);
    };

    const handleQtyChange = (e: React.MouseEvent, newQty: number) => {
        e.preventDefault();
        e.stopPropagation();
        const cartItem = { productId: product._id, variantId: selectedVariant._id, qty: newQty, ...product };
        if (newQty > qty) increment(supplierId, product._id, cartItem);
        else decrement(supplierId, product._id, cartItem);
        if (isAuthenticate) debouncedSync(supplierId, product._id, selectedVariant._id, newQty);
    };

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLoadingWishlist(true);
        try {
            if (isAuthenticate) await toggleWishlist({ product_id: product._id, supplier_id: supplierId });
            if (wishlisted) removeWishlist(product._id);
            else addWishlist({ productId: product._id, name: product.name, image: product.images?.[0]?.url });
        } catch (err) {
            console.error("🛑 Wishlist toggle failed:", err);
        } finally {
            setLoadingWishlist(false);
        }
    };

    const parentCategory = product?.categories?.find((it) => it.parent == null);
    const childCategory = product?.categories?.find((it) => it.parent != null);
    const productUrl = `/store/${product?.storeHandle}/${parentCategory?.handle || "all"}/${childCategory?.handle || "all"}/${product.handle}/${product._id}`;

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 2500,
        arrows: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        pauseOnHover: true,
        swipeToSlide: true,
    };

    return (
        <div className={`group relative bg-white border border-gray-100 rounded-xl transition shadow-sm hover:shadow-md h-full flex flex-col  ${allOutOfStock ? "opacity-70 grayscale-[0.2]" : ""} ${deliveryNotAllow ? "opacity-70 pointer-events-none" : ""}`}>

            {/* ❤️ Wishlist Toggle Overlay */}
            <button
                onClick={handleWishlistToggle}
                disabled={loadingWishlist}
                className="absolute top-2.5 right-2.5 z-20 bg-white/95 rounded-full p-1.5 shadow-sm hover:bg-white transition flex items-center justify-center transform active:scale-90"
            >
                {loadingWishlist ? (
                    <Loader2 className="w-3.5 h-3.5 text-pink-600 animate-spin" />
                ) : (
                    <Heart size={14} fill={wishlisted ? "#ff006a" : "none"} className={wishlisted ? "text-[#ff006a]" : "text-gray-400"} />
                )}
            </button>

            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-3">
                <Link href={productUrl}
                    className="block h-full"
                >
                    <Slider {...settings}>
                        {(product.images?.length
                            ? product.images
                            : [{ url: "/product-placeholder.svg" }]
                        ).map((img: any, i: number) => (
                            <div key={i} className="relative aspect-[4/3] ">
                                <Image
                                    src={img.url || "/product-placeholder.svg"}
                                    alt={product.name}
                                    fill
                                    className=" transition-transform duration-500 ease-in-out group-hover:scale-105"
                                />
                            </div>
                        ))}
                    </Slider>
                </Link>

                {/* Zepto-style ADD Button (Bottom Right of Image) */}
                <div className="absolute bottom-2 right-2 z-20 h-[32px] md:h-[38px]">
                    {qty > 0 ? (
                        <div className="flex items-center bg-white border-2 border-[#ff006a] text-[#ff006a] rounded-xl shadow-lg overflow-hidden h-full">
                            <button
                                onClick={(e) => handleQtyChange(e, qty - 1)}
                                className="px-2 md:px-2.5 hover:bg-pink-50 transition h-full flex items-center justify-center cursor-pointer"
                            >
                                <Minus size={12} className="md:w-[14px] md:h-[14px]" strokeWidth={3} />
                            </button>

                            <span className="px-1 text-xs md:text-sm font-black min-w-[18px] md:min-w-[20px] text-center">
                                {qty}
                            </span>

                            <button
                                onClick={(e) => handleQtyChange(e, qty + 1)}
                                className="px-2 md:px-2.5 hover:bg-pink-50 transition h-full flex items-center justify-center cursor-pointer"
                            >
                                <Plus size={12} className="md:w-[14px] md:h-[14px]" strokeWidth={3} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleAdd}
                            disabled={allOutOfStock}
                            className={`px-3 md:px-4 text-xs md:text-sm font-black border-2 border-[#ff006a] text-[#ff006a] rounded-lg bg-white shadow-xl hover:bg-pink-50 transition-all flex items-center h-full uppercase ${allOutOfStock ? "opacity-50 grayscale cursor-not-allowed" : "cursor-pointer"
                                }`}
                        >
                            {allOutOfStock ? "Sold" : "Add"}
                        </button>
                    )}
                </div>
            </div>
            <div className="p-1.5 sm:p-2">


                {/* 💰 High-Contrast Price Section (Mockup Style) */}
                <div className="flex items-baseline px-0.5 mb-1 ">
                    <div className="bg-[#007D3E] text-white text-[13px] font-black px-1.5 py-0.5 rounded shadow-sm">
                        ₹{finalPrice}
                    </div>
                    {mrp > finalPrice && (
                        <span className="text-gray-400 line-through text-[13px] ml-2 font-medium">
                            ₹{mrp}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 mb-3">
                    {savingsAmt > 0 && (
                        <p className="text-[#007D3E] text-[11px] font-bold whitespace-nowrap">
                            ₹{savingsAmt} OFF
                        </p>
                    )}

                    <div className="border-t border-dashed border-gray-200 w-full" />
                </div>
                {/* 🧾 Product Details */}
                <div className="flex flex-col flex-grow px-0.5">
                    <Link href={productUrl} className="block group">
                        <h3 className="text-[14px] font-bold text-gray-800  leading-tight line-clamp-2 md:line-clamp-3 group-hover:text-pink-600 transition">
                            {product.name}
                        </h3>
                    </Link>

                    {/* Variant Selection Dropdown (Dropdown needed as requested) */}
                    <div className="mt-2">
                        <Select
                            disabled={allOutOfStock || deliveryNotAllow}
                            value={selectedVariant?._id}
                            onValueChange={(id) => {
                                const variant = variants.find((v: any) => v._id == id);
                                setSelectedVariant(variant);

                                if (qty > 0 && variant && variant.stock > 0) {
                                    addOrReplace(supplierId, supplierName, {
                                        productId: product._id,
                                        variantId: variant._id,
                                        name: product.name,
                                        qty,
                                        price: variant.discount_price,
                                        image: product.images?.[0]?.url,
                                        unit: variant.unit,
                                        selling_qty: variant.selling_qty,
                                    });
                                    if (isAuthenticate) {
                                        debouncedSync(supplierId, product._id, variant._id, qty);
                                    }
                                }
                            }}
                        >
                            <SelectTrigger className="h-7 w-fit bg-[#F0FAFF] border-0 text-[#006691] text-[11px] font-bold px-2.5 rounded-lg focus:ring-0">
                                <SelectValue placeholder={`${selectedVariant?.selling_qty} ${selectedVariant?.unit}`} />
                            </SelectTrigger>
                            <SelectContent className="text-xs">
                                {variants.map((v: any) => (
                                    <SelectItem key={v._id} value={v._id} disabled={v.stock <= 0} className=" cursor-pointer">
                                        {v.selling_qty} {v.unit} {v.stock <= 0 ? "(Sold Out)" : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 🏷️ Optional Product Tag (Like the light blue tag in mockup) */}
                    {product.attributes?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            <span className="bg-[#F0FAFF] text-[#006691] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                {product.attributes[0].value}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
