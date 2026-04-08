"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "@tanstack/react-query";
import { debounce } from "lodash";
import { fetchProductsById, addToCart, toggleWishlist, fetchProducts } from "@/services/products";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthValidator } from "@/store/authValidater";
import {
    Loader2,
    ShoppingCart,
    Plus,
    Minus,
    Heart,
    ChevronRight,
    ChevronLeft,
    Share2,
    RefreshCcw,
    Truck,
    Tag,
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
    const [showAllCoupons, setShowAllCoupons] = useState(false);

    const query = useQuery({
        queryKey: ["fetchProductsById", productId],
        queryFn: ({ signal }) => fetchProductsById(signal, productId, {}),
        enabled: !!productId,
    });

    const data = query.data;
    const isLoading = query.isLoading;

    const { mutate } = useMutation({
        mutationFn: addToCart,
        onError: (err) => console.error("🛑 Cart sync failed:", err),
    });

    const debouncedSync = useMemo(
        () =>
            debounce((supplier_id, product_id, variant_id, qty) => {
                mutate({ supplier_id, product_id, variant_id, qty });
            }, 500),
        [mutate]
    );

    const product = data?._payload?.[0];
    const variants = product?.variants || [];
    const supplierId = product?.supplier_id;
    const supplierName = product?.storeName || product?.supplier?.name;

    const variantFromCart =
        product && variants.find((v: any) => v._id === getVariantId(supplierId, product._id));
    const defaultVariant = variantFromCart || variants.find((v: any) => v.stock > 0) || variants[0];

    useEffect(() => {
        if (defaultVariant && !selectedVariant) setSelectedVariant(defaultVariant);
    }, [defaultVariant, selectedVariant]);

    const variant = selectedVariant || defaultVariant;
    const qty = product ? getQty(supplierId, product._id) ?? 0 : 0;
    const discount = (variant?.selling_price || 0) - (variant?.discount_price || 0);
    const discountPercentage = variant?.selling_price
        ? Math.round((discount / variant.selling_price) * 100)
        : 0;
    const allOutOfStock =
        variants.length > 0 &&
        (variants.every((v: any) => v.stock <= 0) || product?.status === "out_of_stock");

    const wishlisted = isWishlisted(product?._id);

    const handleWishlistToggle = async () => {
        if (!product) return;
        setLoadingWishlist(true);
        try {
            if (isAuthenticate) {
                await toggleWishlist({ product_id: product._id, supplier_id: supplierId });
            }
            if (wishlisted) removeWishlist(product._id);
            else addWishlist({ productId: product._id, name: product.name, image: product.images?.[0]?.url });
        } catch (err) {
            console.error("🛑 Wishlist toggle failed:", err);
        } finally {
            setLoadingWishlist(false);
        }
    };

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
            selling_qty: variant.selling_qty,
        };
        addOrReplace(supplierId, supplierName, newItem);
        if (isAuthenticate) debouncedSync(supplierId, product._id, variant._id, 1);
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
            selling_qty: variant.selling_qty,
        };
        if (newQty > qty) increment(supplierId, product._id, newItem);
        else decrement(supplierId, product._id, newItem);
        if (isAuthenticate) debouncedSync(supplierId, product._id, variant._id, newQty);
    };

    const { locationData } = useLocationStore();
    const categoriesIdList = product?.categories?.map((it: any) => it._id).join(",");
    const { data: products, isLoading: productLoading } = useQuery({
        queryKey: ["fetchProducts", locationData?.latitude, locationData?.longitude, product?._id],
        queryFn: ({ signal }) =>
            fetchProducts(signal, {
                latitude: locationData?.latitude,
                longitude: locationData?.longitude,
                category: categoriesIdList,
                noProduct: product?._id,
            }),
        enabled: !!categoriesIdList?.split(",")?.length,
    });

    const mainSliderRef = useRef<any>(null);
    const mainSliderSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        arrows: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        beforeChange: (_: number, next: number) => setSelectedImage(next),
    };

    const [isSharing, setIsSharing] = useState(false);
    const handleShare = async () => {
        const shareData = {
            title: product?.name || "Check this out!",
            text:
                product?.description?.replace(/<[^>]+>/g, "").slice(0, 120) + "..." ||
                "Found this product on NearMart!",
            url: window.location.href,
        };
        try {
            setIsSharing(true);
            if (navigator.share) await navigator.share(shareData);
            else {
                await navigator.clipboard.writeText(window.location.href);
                notify("Link copied to clipboard!", "success");
            }
        } catch (error) {
            console.error("Share failed:", error);
        } finally {
            setIsSharing(false);
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    // ─── Loading State ────────────────────────────────────────────────────────
    if (isLoading)
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="animate-spin w-10 h-10 text-[#ff006a] mx-auto mb-3" />
                    <p className="text-gray-500 text-sm font-medium">Fetching details...</p>
                </div>
            </div>
        );

    // ─── Not Found State ──────────────────────────────────────────────────────
    if (!product)
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="text-center p-8 bg-gray-50 rounded-2xl max-w-md mx-auto border border-gray-100">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                        <ShoppingCart className="w-7 h-7 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Product Not Available</h3>
                    <p className="text-gray-400 text-sm mb-6">Sorry, this item is currently not in stock or has been moved.</p>
                    <Link href="/" className="inline-block border border-gray-200 rounded-xl px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                        Go Back Home
                    </Link>
                </div>
            </div>
        );

    const coupons = [
        { icon: "🏦", title: "Order on Zepto and get Assured Cashback From CRED" },
        { icon: "💳", title: "Get upto ₹50 Cashback on using Amazon Pay Balance" },
        { icon: "📱", title: "Get upto ₹25 Cashback with Amazon Pay UPI" },
        { icon: "💰", title: "Flat ₹20 instant discount via MobiKwik UPI" },
        { icon: "🏷️", title: "Flat ₹25 off with AU 0101 app" },
    ];
    const visibleCoupons = showAllCoupons ? coupons : coupons.slice(0, 3);

    return (
        <>
            {/* ── Zepto-style scoped styles ── */}
            <style jsx>{`
                .pd-thumb-btn {
                    border: 2px solid transparent;
                    border-radius: 10px;
                    overflow: hidden;
                    cursor: pointer;
                    background: #f7f7f7;
                    transition: border-color 0.15s;
                    padding: 4px;
                }
                .pd-thumb-btn.active {
                    border-color: #ff006a;
                }
                .pd-thumb-btn:not(.active) {
                    opacity: 0.6;
                }
                .pd-thumb-btn:not(.active):hover {
                    opacity: 1;
                    border-color: #ddd;
                }
                .pd-section-card {
                    border: 1px solid #ebebeb;
                    border-radius: 14px;
                    padding: 16px 18px;
                    background: #fff;
                }
                .pd-coupon-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 11px 0;
                    border-bottom: 1px solid #f2f2f2;
                    cursor: pointer;
                }
                .pd-coupon-row:last-child {
                    border-bottom: none;
                }
                .pd-hl-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 11px 0;
                    border-bottom: 1px solid #f5f5f5;
                }
                .pd-hl-row:last-child {
                    border-bottom: none;
                }
                .pd-info-row {
                    display: flex;
                    gap: 16px;
                    padding: 10px 0;
                    border-bottom: 1px solid #f5f5f5;
                }
                .pd-info-row:last-child {
                    border-bottom: none;
                }
                .pd-tag {
                    display: inline-block;
                    background: #f5f5f5;
                    border-radius: 20px;
                    padding: 5px 13px;
                    font-size: 13px;
                    color: #555;
                    font-weight: 500;
                    margin: 3px;
                    cursor: pointer;
                    transition: background 0.15s, color 0.15s;
                }
                .pd-tag:hover {
                    background: #ffe0ed;
                    color: #ff006a;
                }
                .pd-icon-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: 1.5px solid #e8e8e8;
                    background: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: border-color 0.15s;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                    flex-shrink: 0;
                }
                .pd-icon-btn:hover {
                    border-color: #ff006a;
                }
                .pd-add-btn {
                    width: 100%;
                    padding: 15px;
                    background: #ff006a;
                    color: #fff;
                    border: none;
                    border-radius: 10px;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.15s;
                    letter-spacing: 0.2px;
                }
                .pd-add-btn:hover {
                    background: #e6005f;
                }
                .pd-add-btn:disabled {
                    background: #e5e5e5;
                    color: #aaa;
                    cursor: not-allowed;
                }
                .pd-qty-wrap {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border: 2px solid #ff006a;
                    border-radius: 10px;
                    padding: 5px 8px;
                }
                .pd-qty-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #ff006a;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    font-size: 22px;
                    font-weight: 800;
                    transition: background 0.1s;
                }
                .pd-qty-btn:hover {
                    background: #fff0f5;
                }
                .pd-qty-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .pd-variant-btn {
                    padding: 10px 8px;
                    border-radius: 10px;
                    border: 2px solid #ebebeb;
                    text-align: center;
                    cursor: pointer;
                    background: #fff;
                    transition: border-color 0.15s, transform 0.15s;
                    position: relative;
                    overflow: hidden;
                }
                .pd-variant-btn.selected {
                    border-color: #ff006a;
                    background: #fff8fb;
                    transform: scale(1.03);
                }
                .pd-variant-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                .pd-slider-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.85);
                    border: 1px solid #e8e8e8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 10;
                    opacity: 0;
                    transition: opacity 0.2s;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
                }
                .pd-gallery:hover .pd-slider-arrow {
                    opacity: 1;
                }
            `}</style>

            <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 20px 80px" }}>

                {/* ── Breadcrumb ── */}
                <nav style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20, fontSize: 13, color: "#888" }}>
                    <Link href="/" style={{ color: "#888", textDecoration: "none" }} className="hover:text-[#ff006a]">Home</Link>
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                    <span style={{ cursor: "pointer" }} className="hover:text-[#ff006a]">Store</span>
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                    <span style={{ color: "#222", fontWeight: 600 }}>{product.name}</span>
                </nav>

                {/* ── Main Grid ── */}
                <div
                    style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.35fr)", gap: 40, alignItems: "start" }}
                    className="grid-cols-1 lg:grid-cols-[1fr_1.35fr]"
                >

                    {/* ══ LEFT: Gallery ══ */}
                    <div
                        style={{
                            maxWidth: 600,
                            width: "100%",
                            position: "sticky",
                            top: 110,
                            alignSelf: "start",
                        }}
                    >
                        <div>
                            <div style={{ display: "flex", gap: 6 }}>
                                <div className="hidden sm:flex" style={{ flexDirection: "column", gap: 8, flexShrink: 0 }}>
                                    {product.images?.map((img: any, i: number) => (
                                        <button
                                            key={i}
                                            className={`pd-thumb-btn${selectedImage === i ? " active" : ""}`}
                                            style={{ width: 68, height: 68 }}
                                            onClick={() => {
                                                setSelectedImage(i);
                                                mainSliderRef.current?.slickGoTo(i);
                                            }}
                                        >
                                            <Image src={img.url} alt="thumb" width={60} height={60} style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                                        </button>
                                    ))}
                                </div>

                                {/* Main image */}
                                <div className="pd-gallery" style={{ flex: 1, aspectRatio: "1/1", background: "#fafafa", border: "1px solid #ebebeb", borderRadius: 16, position: "relative", overflow: "hidden" }}>
                                    <div className="relative flex-1 aspect-square rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm group">
                                        <Slider ref={mainSliderRef} {...mainSliderSettings}>
                                            {(product.images?.length ? product.images : [{ url: "/placeholder.png" }]).map(
                                                (img: any, i: number) => (
                                                    <div key={i} className="relative h-[420px] w-full overflow-hidden bg-white rounded-2xl">
                                                        <Image
                                                            src={img?.url || "/placeholder.png"}
                                                            alt={product?.name || "product"}
                                                            fill
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                            className="h-full w-full object-contain"
                                                            priority
                                                        />
                                                    </div>
                                                )
                                            )}
                                        </Slider>
                                    </div>

                                    {/* Share + Wishlist */}
                                    <div style={{ position: "absolute", top: 12, right: 12, display: "flex", flexDirection: "column", gap: 8, zIndex: 10 }}>

                                        <button className="pd-icon-btn" onClick={handleWishlistToggle} disabled={loadingWishlist} title="Wishlist">
                                            {loadingWishlist
                                                ? <Loader2 className="w-4 h-4 text-[#ff006a] animate-spin" />
                                                : <Heart className={`w-4 h-4 ${wishlisted ? "fill-[#ff006a] text-[#ff006a]" : "text-gray-400"}`} />}
                                        </button>
                                    </div>

                                    {/* Prev / Next arrows */}
                                    <button className="pd-slider-arrow" style={{ left: 10 }} onClick={() => mainSliderRef.current?.slickPrev()}>
                                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button className="pd-slider-arrow" style={{ right: 10 }} onClick={() => mainSliderRef.current?.slickNext()}>
                                        <ChevronRight className="w-5 h-5 text-gray-600" />
                                    </button>

                                    {/* Dot indicators */}
                                    <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
                                        {product.images?.map((_: any, i: number) => (
                                            <div key={i} onClick={() => { setSelectedImage(i); mainSliderRef.current?.slickGoTo(i); }}
                                                style={{ width: 6, height: 6, borderRadius: "50%", background: selectedImage === i ? "#ff006a" : "#ddd", cursor: "pointer", transition: "background 0.2s" }} />
                                        ))}
                                    </div>
                                </div>

                            </div>
                            {/* Add to Cart */}
                            <div style={{ marginTop: 14 }}>
                                {qty > 0 ? (
                                    <div className="pd-qty-wrap bg-[#ff006a] ">
                                        <button className=" p-2 text-white" onClick={() => handleQtyChange(qty - 1)}>
                                            <Minus className="w-5 h-5 text-white" strokeWidth={3} />
                                        </button>
                                        <span style={{ fontSize: 18, fontWeight: 800, color: "white" }}>{qty}</span>
                                        <button className=" p-2 text-white" onClick={() => handleQtyChange(qty + 1)} disabled={variant?.stock <= qty}>
                                            <Plus className="w-5 h-5 text-white" strokeWidth={3} />
                                        </button>
                                    </div>
                                ) : (
                                    <button className="pd-add-btn" onClick={handleAdd} disabled={allOutOfStock}>
                                        {allOutOfStock ? "Sold Out" : "Add To Cart"}
                                    </button>
                                )}
                                {variant?.stock > 0 && variant?.stock <= 5 && (
                                    <p style={{ textAlign: "center", color: "#ff006a", fontSize: 13, fontWeight: 700, marginTop: 6 }} className="animate-pulse">
                                        Only {variant.stock} left in stock!
                                    </p>
                                )}
                            </div>
                        </div>



                    </div>

                    {/* ══ RIGHT: Info ══ */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* Title + share */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ flex: 1 }}>
                                <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111", lineHeight: 1.3, marginBottom: 4 }}>{product.name}</h1>
                                <p style={{ color: "#888", fontSize: 12, fontWeight: 500 }}>Net Qty: {variant?.selling_qty} {variant?.unit}</p>
                            </div>
                            <button className="pd-icon-btn" onClick={handleShare} disabled={isSharing} title="Share">
                                <Share2 className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>

                        {/* Price */}
                        <div style={{ borderBottom: "1px solid #f0f0f0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                                <span style={{ background: "#1b7a3e", color: "#fff", fontSize: 20, fontWeight: 800, borderRadius: 8, padding: "4px 14px" }}>
                                    ₹{variant?.discount_price}
                                </span>
                                <div>
                                    <span style={{ color: "#aaa", textDecoration: "line-through", fontSize: 14, fontWeight: 500, marginRight: 8 }}>MRP ₹{variant?.selling_price}</span>
                                    <span style={{ color: "#1b7a3e", fontSize: 13, fontWeight: 700 }}>₹{discount} OFF · {discountPercentage}%</span>
                                </div>
                            </div>
                            <p style={{ fontSize: 11, color: "#bbb" }}>(Inclusive of all taxes)</p>
                        </div>
                        {/* Variant selector */}
                        {variants.length > 1 && (
                            <div>
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", }}>Select Variant</h3>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
                                    {variants.map((v: any) => (
                                        <button
                                            key={v._id}
                                            className={`pd-variant-btn${selectedVariant?._id === v._id ? " selected" : ""}`}
                                            onClick={() => {
                                                setSelectedVariant(v)
                                                if (qty > 0 && v && v.stock > 0) {
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
                                        >
                                            <p style={{ fontSize: 13, fontWeight: 800, color: selectedVariant?._id === v._id ? "#ff006a" : "#111", marginBottom: 2 }}>
                                                {v.selling_qty} {v.unit}
                                            </p>
                                            <p style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>₹{v.discount_price}</p>
                                            {v.stock <= 0 && (
                                                <span style={{ position: "absolute", top: 0, right: 0, background: "#eee", color: "#999", fontSize: 8, fontWeight: 800, padding: "2px 5px", borderBottomLeftRadius: 6 }}>SOLD</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Coupons & Offers */}
                        <div className="pd-section-card">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Coupons &amp; Offers</h3>
                                <button
                                    onClick={() => setShowAllCoupons(!showAllCoupons)}
                                    style={{ background: "none", border: "none", color: "#ff006a", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                                >
                                    {showAllCoupons ? "Show less" : "View all coupons"}
                                </button>
                            </div>
                        </div>

                        {/* Trust badges */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            {[
                                { Icon: RefreshCcw, label: "Easy Refunds" },
                                { Icon: Truck, label: "Fast Delivery" },
                            ].map(({ Icon, label }, i) => (
                                <div key={i} style={{ background: "#fafafa", border: "1px solid #ebebeb", borderRadius: 12, padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                                    <div style={{ width: 40, height: 40, background: "#fff", borderRadius: 10, border: "1px solid #ebebeb", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                                        <Icon className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: "#444", textAlign: "center" }}>{label}</span>
                                </div>
                            ))}
                        </div>



                        {/* Highlights */}
                        {product.highlights?.length > 0 && (
                            <div className="pd-section-card">
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4 }}>Highlights</h3>
                                {product.highlights.map((h: any, i: number) => (
                                    <div key={i} className="pd-hl-row">
                                        <span style={{ fontSize: 13, color: "#aaa", fontWeight: 500 }}>{h.key}</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: "#222" }}>{h.value || "—"}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Information */}
                        <div className="pd-section-card">
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 8 }}>Information</h3>
                            <div className="pd-info-row">
                                <span style={{ fontSize: 12, color: "#bbb", fontWeight: 600, width: 130, flexShrink: 0 }}>Disclaimer</span>
                                <div
                                    style={{ fontSize: 13, color: "#555", fontWeight: 500, lineHeight: 1.6 }}
                                    dangerouslySetInnerHTML={{
                                        __html: product.description ||
                                            "Every effort is made to maintain accuracy of all information. However, actual product packaging and materials may contain more and/or different information.",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <section style={{ marginTop: 48, paddingTop: 28, borderTop: "1px solid #f0f0f0", }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111", marginBottom: 18 }}>
                        How to Buy {product.name} Online – Step-by-Step
                    </h2>
                    <div className="flex flex-col gap-1">
                        {[
                            `Search for "${product.name}" on the app or website or browse through the relevant category section.`,
                            `View ${product.name} price, available options, and customer reviews.`,
                            "Add the item to your cart and proceed to buy online with secure and flexible payment options.",
                            "Get it delivered quickly with our trusted delivery network and enjoy a hassle-free experience.",
                        ].map((step, idx) => (
                            <div key={idx} className="flex gap-1">
                                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, fontWeight: 500 }}>{idx + 1}. {" "}</div>
                                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, fontWeight: 500 }}>{` ${step}`}</p>
                            </div>
                        ))}
                    </div>
                </section>



                {/* ── Similar Products ── */}
                {products?._payload?.length > 0 && (
                    <section style={{ marginTop: 40, paddingTop: 28, borderTop: "1px solid #f0f0f0", marginBottom: 40 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111" }}>Similar Products</h2>
                            {products?._payload?.length > 5 && (
                                <Link href={`/store/${handle}/similar-products`}
                                    style={{ color: "#ff006a", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, textDecoration: "none", background: "#fff", border: "1px solid #ebebeb", borderRadius: 10, padding: "6px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                                    className="hover:underline group">
                                    View all <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {productLoading
                                ? Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
                                : products?._payload?.map((p: any) => (
                                    <div key={p._id} className="transform hover:-translate-y-1 transition-transform duration-200">
                                        <ProductCard product={p} deliveryNotAllow={p.deliveryNotAllowed} />
                                    </div>
                                ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}
