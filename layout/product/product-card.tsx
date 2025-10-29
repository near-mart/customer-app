"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Heart, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
import { useEffect, useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { debounce } from "lodash";
import { addToCart } from "@/services/products";

export function ProductCard({ product, deliveryNotAllow = false }) {
    const variants = product.variants || [];
    const allOutOfStock = variants.every((v) => v.stock <= 0) || product.status === "out_of_stock";
    const defaultVariant = variants.find((v) => v.stock > 0) || variants[0];

    const supplierId = product?.supplier_id;
    const supplierName = product?.storeName || product?.supplier?.name;

    const { addOrReplace, increment, decrement, getQty, getVariantId } = useCartStore();
    const selectedVariantIdInCart = getVariantId(supplierId, product._id);
    const variantFromCart = variants.find((v) => v._id === selectedVariantIdInCart);
    const [selectedVariant, setSelectedVariant] = useState(variantFromCart || defaultVariant);

    const { addWishlist, removeWishlist, isWishlisted } = useWishlistStore();
    const wishlisted = isWishlisted(product._id);

    useEffect(() => {
        if (variantFromCart && variantFromCart._id !== selectedVariant._id) {
            setSelectedVariant(variantFromCart);
        }
    }, [variantFromCart?._id]);

    const qty = getQty(supplierId, product._id);
    const discount = Math.max(0, (selectedVariant?.selling_price || 0) - (selectedVariant?.discount_price || 0));

    // 🧠 React Query Mutation
    const mutation = useMutation({
        mutationFn: addToCart,
        onSuccess: (res) => console.log("✅ Cart updated:", res),
        onError: (err) => console.error("🛑 Cart API failed:", err),
    });

    // ⏱️ Debounced API Sync (prevents rapid API calls)
    const debouncedSync = useCallback(
        debounce((supplier_id, product_id, variant_id, qty) => {
            mutation.mutate({ supplier_id, product_id, variant_id, qty });
        }, 400),
        []
    );

    // ➕ Add Item
    const handleAdd = () => {
        addOrReplace(supplierId, supplierName, {
            productId: product._id,
            variantId: selectedVariant._id,
            name: product.name,
            qty: 1,
            price: selectedVariant.discount_price,
            image: product.images?.[0]?.url,
            unit: selectedVariant.unit,
            selling_qty: selectedVariant.selling_qty,
        });
        debouncedSync(supplierId, product._id, selectedVariant._id, 1);
    };

    // 🔄 Quantity Change Handler
    const handleQtyChange = (newQty) => {
        if (newQty > qty) increment(supplierId, product._id);
        else decrement(supplierId, product._id);

        debouncedSync(supplierId, product._id, selectedVariant._id, newQty);
    };

    const parentCategory = product?.categories?.find((it) => it.parent == null);
    const childCategory = product?.categories?.find((it) => it.parent != null);
    const productUrl = `/store/${product?.storeHandle}/${parentCategory?.handle}/${childCategory?.handle}/${product.handle}-${product._id}`;

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
        <Link
            href={productUrl}
            prefetch={false}
            className={`block p-1.5 sm:p-2 border rounded-xl bg-white transition relative h-full 
      ${allOutOfStock ? "opacity-60" : "hover:shadow-md"}
      ${deliveryNotAllow ? "opacity-70 pointer-events-none" : ""}`}
        >
            {/* 🖼️ Product Image Carousel */}
            <div className="relative w-full aspect-square sm:aspect-4/3 rounded-lg overflow-hidden group">
                <Slider {...settings}>
                    {(product.images?.length ? product.images : [{ url: "/product-placeholder.svg" }]).map((img, i) => (
                        <div key={i} className="relative aspect-square sm:aspect-4/3">
                            <Image
                                src={img.url || "/product-placeholder.svg"}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                            />
                        </div>
                    ))}
                </Slider>

                {/* ❤️ Wishlist Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        wishlisted
                            ? removeWishlist(product._id)
                            : addWishlist({
                                productId: product._id,
                                name: product.name,
                                image: product.images?.[0]?.url,
                            });
                    }}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-sm transition"
                >
                    <Heart
                        size={14}
                        strokeWidth={1.8}
                        className={`${wishlisted ? "text-pink-600 fill-pink-600" : "text-gray-500"}`}
                    />
                </button>

                {/* 🛒 Cart Controls */}
                {qty > 0 ? (
                    <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-white rounded-md border border-pink-600 px-3 py-1"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <button
                            className="text-pink-600 font-bold text-md cursor-pointer"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleQtyChange(qty - 1);
                            }}
                        >
                            <Minus size={16} />
                        </button>
                        <span className="text-sm font-semibold">{qty}</span>
                        <button
                            className="text-pink-600 font-bold text-md cursor-pointer"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleQtyChange(qty + 1);
                            }}
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                ) : (
                    <button
                        className="absolute bottom-2 right-2 bg-white text-pink-600 font-semibold text-xs border border-pink-600 px-4 py-1.5 cursor-pointer rounded-md hover:bg-pink-600 hover:text-white transition"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAdd();
                        }}
                    >
                        ADD
                    </button>
                )}
            </div>

            {/* 💰 Price + Variant */}
            <div className="mt-2">
                <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                    ₹{selectedVariant?.discount_price}
                    {selectedVariant?.selling_price > selectedVariant?.discount_price && (
                        <>
                            <span className="text-gray-400 line-through text-xs">₹{selectedVariant?.selling_price}</span>
                            <span className="text-green-600 text-xs font-medium">SAVE ₹{discount}</span>
                        </>
                    )}
                </div>

                {/* Variant Dropdown */}
                <div className="mt-1">
                    {variants.length > 1 ? (
                        <Select
                            disabled={allOutOfStock || deliveryNotAllow}
                            value={selectedVariant?._id}
                            onValueChange={(id) => {
                                const variant = variants.find((v) => v._id === id);
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
                                    debouncedSync(supplierId, product._id, variant._id, qty);
                                }
                            }}
                        >
                            <SelectTrigger className="px-2 text-xs border-gray-300 rounded-md">
                                <SelectValue placeholder={`${selectedVariant?.selling_qty} ${selectedVariant?.unit}`} />
                            </SelectTrigger>
                            <SelectContent className="text-xs">
                                {variants.map((v) => (
                                    <SelectItem key={v._id} value={v._id} disabled={v.stock <= 0}>
                                        {v.selling_qty} {v.unit}
                                        {v.stock <= 0 ? " — Out of stock" : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <p className="text-xs text-gray-600">
                            {selectedVariant?.selling_qty} {selectedVariant?.unit}
                        </p>
                    )}
                </div>

                {/* 🧾 Product Name */}
                <p className="text-sm font-medium mt-1 text-gray-700 line-clamp-1">{product.name}</p>
            </div>
        </Link>
    );
}
