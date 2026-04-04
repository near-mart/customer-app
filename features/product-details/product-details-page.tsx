"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "@tanstack/react-query";
import { debounce } from "lodash";
import { fetchProductsById, addToCart, toggleWishlist, fetchProducts } from "@/services/products";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthValidator } from "@/store/authValidater";
import { Button } from "@/components/ui/button";
import {
    Loader2,
    ShoppingCart,
    Plus,
    Minus,
    Star,
    Heart,
    Shield,
    Truck,
    RotateCcw,
    ChevronRight,
    ChevronLeft,
    Share2,
} from "lucide-react";
import Slider from "react-slick";
import useLocationStore from "@/store/location";
import Link from "next/link";
import ProductSkeleton from "@/components/product-skeleton";
import { ProductCard } from "@/layout/product/product-card";
import { notify } from "@/functions/notify";

export default function ProductDetailsPage({ productId, handle }: any) {
    const { addOrReplace, increment, decrement, getQty, getVariantId } = useCartStore();
    const { isAuthenticate } = useAuthValidator((state) => state);
    const { addWishlist, removeWishlist, isWishlisted } = useWishlistStore();

    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [loadingWishlist, setLoadingWishlist] = useState(false);

    // ✅ Fetch product data
    const query = useQuery({
        queryKey: ["fetchProductsById", productId],
        queryFn: ({ signal }) => fetchProductsById(signal, productId, {}),
        enabled: !!productId,
    });

    const data = query.data;
    const isLoading = query.isLoading;

    // ✅ Cart Sync Mutation
    const mutation = useMutation({
        mutationFn: addToCart,
        onSuccess: (res) => console.log("✅ Cart synced:", res),
        onError: (err) => console.error("🛑 Cart sync failed:", err),
    });

    // ✅ Debounced API Sync
    const debouncedSync = useCallback(
        debounce((supplier_id, product_id, variant_id, qty) => {
            mutation.mutate({ supplier_id, product_id, variant_id, qty });
        }, 400),
        [mutation]
    );

    // ✅ Product setup
    const product = data?._payload?.[0];
    const variants = product?.variants || [];
    const supplierId = product?.supplier_id;
    const supplierName = product?.storeName || product?.supplier?.name;

    const variantFromCart =
        product && variants.find((v) => v._id === getVariantId(supplierId, product._id));
    const defaultVariant = variantFromCart || variants.find((v) => v.stock > 0) || variants[0];

    useEffect(() => {
        if (defaultVariant && !selectedVariant) setSelectedVariant(defaultVariant);
    }, [defaultVariant, selectedVariant]);

    const variant = selectedVariant || defaultVariant;
    const qty = product ? getQty(supplierId, product._id) ?? 0 : 0;
    const discount = (variant?.selling_price || 0) - (variant?.discount_price || 0);
    const discountPercentage = variant?.selling_price
        ? Math.round((discount / variant.selling_price) * 100)
        : 0;
    const allOutOfStock = variants.length > 0 && (variants.every((v) => v.stock <= 0) || product?.status === "out_of_stock");

    const wishlisted = isWishlisted(product?._id);

    const handleWishlistToggle = async () => {
        if (!product) return;
        setLoadingWishlist(true);
        try {
            if (isAuthenticate) {
                await toggleWishlist({
                    product_id: product._id,
                    supplier_id: supplierId,
                });
            }

            if (wishlisted) removeWishlist(product._id);
            else
                addWishlist({
                    productId: product._id,
                    name: product.name,
                    image: product.images?.[0]?.url,
                });
        } catch (err) {
            console.error("🛑 Wishlist toggle failed:", err);
        } finally {
            setLoadingWishlist(false);
        }
    };

    // 🧠 Cart Handlers
    const handleAdd = () => {
        if (!variant) return;
        const newItem = {
            productId: product._id,
            variantId: variant._id,
            qty: 1,
            name: product.name,
            price: variant.discount_price,
            image: product.images?.[0]?.url,
            unit: variant.unit,
        };
        addOrReplace(supplierId, supplierName, newItem);
        if (isAuthenticate) {
            debouncedSync(supplierId, product._id, variant._id, 1);
        }
    };

    const handleQtyChange = (newQty: number) => {
        if (!variant) return;
        const newItem = {
            productId: product._id,
            variantId: variant._id,
            qty: newQty,
            name: product.name,
            price: variant.discount_price,
            image: product.images?.[0]?.url,
            unit: variant.unit,
        };
        if (newQty > qty) increment(supplierId, product._id, newItem);
        else decrement(supplierId, product._id, newItem);
        if (isAuthenticate) {
            debouncedSync(supplierId, product._id, variant._id, newQty);
        }
    };


    const { locationData } = useLocationStore();
    const categories = product?.categories?.map((it) => it._id).join(",")
    const { data: products, isLoading: productLoading } = useQuery({
        queryKey: ["fetchProducts", locationData?.latitude, locationData?.longitude, product?._id],
        queryFn: ({ signal }) =>
            fetchProducts(signal, {
                latitude: locationData?.latitude,
                longitude: locationData?.longitude,
                category: categories,
                noProduct: product?._id
            }),
        enabled: !!categories?.split(",")?.length,
    });
    const mainSliderRef = useRef<any>(null);
    const Arrow = ({ direction, onClick }: { direction: "left" | "right"; onClick?: () => void }) => (
        <button
            onClick={onClick}
            className={`absolute top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md hover:bg-green-100 ${direction === "left" ? "left-3" : "right-3"
                }`}
        >
            {direction === "left" ? (
                <ChevronLeft className="w-5 h-5 text-gray-700 cursor-pointer" />
            ) : (
                <ChevronRight className="w-5 h-5 text-gray-700 cursor-pointer" />
            )}
        </button>
    );
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth", // or "auto" if you want instant jump
        });
    }, []);
    const mainSliderSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        arrows: true,
        prevArrow: <Arrow direction="left" />,
        nextArrow: <Arrow direction="right" />,
        slidesToShow: 1,
        slidesToScroll: 1,
        beforeChange: (_: number, next: number) => setSelectedImage(next),
    };
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = async () => {
        const shareData = {
            title: product?.name || "Check this out!",
            text: product?.description
                ? product.description.replace(/<[^>]+>/g, "").slice(0, 120) + "..."
                : "Found this product on NearMart!",
            url: window.location.href,
        };

        try {
            setIsSharing(true);
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                notify("Link copied to clipboard!", "success");
            }
        } catch (error) {
            console.error("Share failed:", error);
        } finally {
            setIsSharing(false);
        }
    };



    // ✅ Render
    return (
        <>
            <div className="pb-20 relative">
                {/* 🔄 Loading */}
                {isLoading && (
                    <div className="flex justify-center items-center min-h-[60vh]">
                        <div className="text-center">
                            <Loader2 className="animate-spin w-12 h-12 text-green-600 mx-auto mb-4" />
                            <p className="text-gray-600">Loading product details...</p>
                        </div>
                    </div>
                )}

                {/* ❌ Not Found */}
                {!isLoading && !product && (
                    <div className="flex justify-center items-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShoppingCart className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Product Not Found</h3>
                            <p className="text-gray-500 max-w-md">
                                Sorry, we couldn't find the product you're looking for. It might be unavailable or removed.
                            </p>
                        </div>
                    </div>
                )}

                {/* ✅ Product Details */}
                {!isLoading && product && (
                    <>
                        {/* Breadcrumb */}
                        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
                            <span>Home</span>
                            <span>•</span>
                            <span>Products</span>
                            <span>•</span>
                            <span className="text-gray-900 font-medium">{product.name}</span>
                        </nav>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* 🖼️ Product Images */}

                            <div className="space-y-4">
                                {/* 🖼️ Main Carousel */}
                                <div className="relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                                    <Slider ref={mainSliderRef} {...mainSliderSettings}>
                                        {(product.images?.length ? product.images : [{ url: "/placeholder.png" }]).map(
                                            (img: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className="relative w-full aspect-4/4 cursor-pointer"
                                                    onClick={() => {
                                                        const next = (i + 1) % product.images.length;
                                                        setSelectedImage(next);
                                                        mainSliderRef.current?.slickGoTo(next);
                                                    }}
                                                >
                                                    <Image
                                                        src={img.url}
                                                        alt={`${product.name} view ${i + 1}`}
                                                        fill
                                                        className="object-contain bg-white"
                                                        priority
                                                    />
                                                </div>
                                            )
                                        )}
                                    </Slider>
                                </div>

                                {/* 🧭 Thumbnails */}
                                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                                    {product.images?.map((img: any, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setSelectedImage(i);
                                                mainSliderRef.current?.slickGoTo(i);
                                            }}
                                            className={`relative cursor-pointer shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 ${selectedImage === i
                                                ? "border-green-500 ring-2 ring-green-100"
                                                : "border-gray-200 hover:border-gray-300"
                                                }`}
                                            style={{ width: 70, height: 70 }}
                                        >
                                            <Image
                                                src={img.url}
                                                alt={`${product.name} thumbnail ${i + 1}`}
                                                fill
                                                className="object-cover bg-white"
                                            />
                                        </button>
                                    ))}
                                </div>


                                {/* 🏆 Trust Badges */}
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-gray-600 text-xs">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-green-600" />
                                        <span>Quality Assured</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-green-600" />
                                        <span>Free Delivery</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RotateCcw className="w-4 h-4 text-green-600" />
                                        <span>Easy Returns</span>
                                    </div>
                                </div>
                            </div>



                            {/* 🧾 Product Info */}
                            <div className="flex flex-col gap-4 h-screen  ">
                                {/* Header */}
                                <div>
                                    <div className="flex items-start justify-between mb-3">
                                        <h1 className="text-3xl font-bold text-primary leading-tight">
                                            {product.name}
                                        </h1>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={handleShare}
                                                disabled={isSharing}
                                                className="p-2 cursor-pointer rounded-full border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 shadow-sm transition-all"
                                                aria-label="Share product"
                                            >
                                                <Share2 className="w-5 h-5 text-gray-600" />
                                            </button>
                                            <button
                                                onClick={handleWishlistToggle}
                                                disabled={loadingWishlist}
                                                className="p-2 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
                                            >
                                                {loadingWishlist ? (
                                                    <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                                                ) : (
                                                    <Heart
                                                        className={`w-6 h-6 cursor-pointer transition-colors ${wishlisted
                                                            ? "fill-red-500 text-red-500"
                                                            : "text-gray-400 hover:text-red-500"
                                                            }`}
                                                    />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-center gap-1">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-4 h-4 ${star <= 4
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-gray-300"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">4.5</span>
                                        </div>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-sm text-gray-600">120 ratings</span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-sm text-green-600 font-medium">500+ bought</span>
                                    </div> */}
                                </div>

                                {/* 💰 Price Section */}
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl md:text-3xl font-bold text-gray-900">
                                                ₹{variant?.discount_price}
                                            </span>
                                            {variant?.discount_price < variant?.selling_price && (
                                                <>
                                                    <span className="text-md md:text-xl text-gray-500 line-through">
                                                        ₹{variant?.selling_price}
                                                    </span>
                                                    <span className="bg-green-100 text-green-800  text-xs md:text-sm font-medium px-2 py-1 rounded-full">
                                                        {discountPercentage}% OFF
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {discount > 0 && (
                                        <p className="text-green-700 font-medium text-xs md:text-sm">
                                            You save ₹{discount} on this item
                                        </p>
                                    )}
                                </div>

                                {/* Variants */}
                                <div className="space-y-2">
                                    <h3 className="text-md font-semibold text-gray-900">Select Size</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {variants.map((v: any) => (
                                            <button
                                                key={v._id}
                                                onClick={() => {
                                                    if (v.stock <= 0) return;
                                                    setSelectedVariant(v);
                                                    if (qty > 0 && v.stock > 0) {
                                                        addOrReplace(supplierId, supplierName, {
                                                            productId: product._id,
                                                            variantId: v._id,
                                                            name: product.name,
                                                            qty,
                                                            price: v.discount_price,
                                                            image: product.images?.[0]?.url,
                                                            unit: v.unit,
                                                            selling_qty: v.selling_qty,
                                                        });
                                                        if (isAuthenticate) {
                                                            debouncedSync(supplierId, product._id, v._id, qty);
                                                        }
                                                    }
                                                }}
                                                disabled={v.stock <= 0}
                                                className={`p-2  rounded-xl cursor-pointer border-2 text-left transition-all duration-200 ${selectedVariant?._id === v._id
                                                    ? "border-green-500 bg-green-50 ring-2 ring-green-100"
                                                    : v.stock <= 0
                                                        ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-60"
                                                        : "border-gray-200 bg-white hover:border-green-300"
                                                    }`}
                                            >
                                                <div className="flex flex-col">
                                                    <span
                                                        className={`font-semibold text-sm ${selectedVariant?._id === v._id
                                                            ? "text-green-700"
                                                            : "text-gray-900"
                                                            }`}
                                                    >
                                                        {v.selling_qty} {v.unit} {v.label ? `(${v.label})` : ""}
                                                    </span>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            ₹{v.discount_price}
                                                        </span>
                                                        {v.discount_price && (
                                                            <span className="text-xs text-gray-500 line-through">
                                                                ₹{v.selling_price}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {v.stock <= 0 && (
                                                        <span className="text-xs text-red-600 font-medium mt-1">
                                                            Out of stock
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 🛒 Add to Cart */}
                                <div className="space-y-4 pt-2">
                                    {qty > 0 ? (
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-gray-700">Quantity:</span>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleQtyChange(Math.max(qty - 1, 0))}
                                                    className="rounded-full cursor-pointer w-12 h-12 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </Button>
                                                <span className="text-xl font-bold min-w-8 text-center">{qty}</span>
                                                <Button
                                                    onClick={() => handleQtyChange(qty + 1)}
                                                    disabled={variant?.stock <= qty}
                                                    className="rounded-full cursor-pointer w-12 h-12 bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={handleAdd}
                                            disabled={allOutOfStock}
                                            className={`w-full py-6 text-md cursor-pointer font-semibold rounded-2xl transition-all duration-200 ${allOutOfStock ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"}`}
                                        >
                                            <ShoppingCart className="w-5 h-5 mr-3" />
                                            {allOutOfStock ? "Out of Stock" : "Add to Cart"}
                                        </Button>
                                    )}

                                    {/* Stock Status */}
                                    {variant?.stock > 0 && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <div
                                                className={`w-2 h-2 rounded-full ${variant.stock > 10 ? "bg-green-500" : "bg-yellow-500"
                                                    }`}
                                            ></div>
                                            <span
                                                className={
                                                    variant.stock > 10 ? "text-green-700" : "text-yellow-700"
                                                }
                                            >
                                                {variant.stock > 10
                                                    ? "In stock"
                                                    : `Only ${variant.stock} left!`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Highlights */}
                                {product.highlights?.length > 0 && (
                                    <div className="border-t border-gray-100 pt-6 pb-6">
                                        <h4 className="font-semibold text-primary mb-3">
                                            Highlights
                                        </h4>

                                        <div className="grid sm:grid-cols-1 gap-3 bg-white  rounded-lg">
                                            {product.highlights.map((highlight: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 rounded-xl  transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                        <span className="text-sm font-medium text-gray-800">
                                                            {highlight?.key}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-gray-600 font-normal truncate max-w-[160px]">
                                                        {highlight?.value || "-"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                        {/* 📄 Product Description */}
                        <div className=" border-t pt-12">
                            <div className="">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h2>
                                <div className="prose prose-lg max-w-none">
                                    <div
                                        className="text-gray-600 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}





            </div>
            <section className="pb-40">
                {products?._payload?.length > 0 && (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-md md:text-xl font-bold text-primary">
                                Similar Products for you
                            </h2>

                            {products?._payload?.length > 5 && (
                                <Link
                                    href={`/store/${handle}/similar-products`}
                                    className="flex items-center text-pink-600 text-sm font-bold hover:text-pink-700 transition"
                                >
                                    See All
                                    <ChevronRight className="ml-1 w-4 h-4" />
                                </Link>
                            )}
                        </div>

                        {/* 🔄 Horizontal scroll container */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {productLoading
                                ? Array.from({ length: 6 }).map((_, i) => (
                                    <ProductSkeleton key={i} />
                                ))
                                : products?._payload?.map((p) => (
                                    <div key={p._id} className="min-w-40 sm:min-w-[200px] md:min-w-[220px] shrink-0">
                                        <ProductCard product={p} deliveryNotAllow={p.deliveryNotAllowed} />
                                    </div>
                                ))}
                        </div>

                    </>
                )}
            </section>

        </>
    );
}
