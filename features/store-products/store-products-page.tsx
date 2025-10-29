"use client";
import React, { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchDeliverySettings, fetchSupplier } from "@/services/suppliers";
import { fetchNestedCategory } from "@/services/categories";
import { fetchProducts } from "@/services/products";
import { ProductCard } from "@/layout/product/product-card";
import { ChevronRight, Info, Search } from "lucide-react";
import OffersSection from "./components/offers-section";
import useLocationStore from "@/store/location";
import ProductSkeleton from "@/components/product-skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { debounce } from "lodash";
import { AutoOpenTooltip } from "@/components/auto-open-tooltip";

export default function StoreProductsPage({ handle }: { handle: string }) {
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const { locationData } = useLocationStore();
    const router = useRouter();
    const searchParams = useSearchParams();

    // 🌐 Load initial query from URL if present
    const initialQuery = searchParams.get("q") || "";
    const [query, setQuery] = useState(initialQuery);

    const { data: suppliers, isLoading: supplierLoading } = useQuery({
        queryKey: ["fetchSupplier", handle, locationData],
        queryFn: ({ signal }) =>
            fetchSupplier(signal, {
                page: 0,
                page_size: 15,
                handle,
                latitude: locationData?.latitude,
                longitude: locationData?.longitude,
            }),
        enabled: !!handle,
    });

    const supplier = suppliers?._payload?.[0];

    // 🧩 Delivery info
    const { data: delivery, isLoading: deliveryLoading } = useQuery({
        queryKey: ["fetchDeliverySettings", supplier?._id || ""],
        queryFn: ({ signal }) => fetchDeliverySettings(signal, supplier?._id),
        enabled: !!supplier?._id,
    });

    const deliveryInfo = delivery?._payload;

    // 🧩 Categories
    const { data: categoriesData, isLoading: categoryLoading } = useQuery({
        queryKey: ["fetchNestedCategory", supplier?._id],
        queryFn: ({ signal }) =>
            fetchNestedCategory(signal, { supplier: supplier?._id }),
        enabled: !!supplier?._id,
    });

    // 🧩 Products
    const { data: products, isLoading: productLoading } = useQuery({
        queryKey: ["fetchProducts", supplier?._id, locationData?.latitude, locationData?.longitude, query],
        queryFn: ({ signal }) =>
            fetchProducts(signal, {
                page: 0,
                page_size: 15,
                supplier: supplier?._id,
                latitude: locationData?.latitude,
                longitude: locationData?.longitude,
                search: query
            }),
        enabled: !!supplier?._id,
    });
    const handleSearch = useCallback(
        debounce((value) => {
            const params = new URLSearchParams(window.location.search);
            if (value) params.set("q", value);
            else params.delete("q");
            router.replace(`?${params.toString()}`, { scroll: false }); // ✅ Prevent scroll reset
            setQuery(value);
        }, 600),
        []
    );
    const { data: featuredProducts, isLoading: featuredProductLoading } = useQuery({
        queryKey: ["fetchProducts", 0, 15, supplier?._id, locationData?.latitude, locationData?.longitude, true],
        queryFn: ({ signal }) =>
            fetchProducts(signal, {
                page: 0,
                page_size: 15,
                supplier: supplier?._id,
                latitude: locationData?.latitude,
                longitude: locationData?.longitude,
                features: true,


            }),
        enabled: !!supplier?._id,
    });

    const categories = categoriesData?._payload || [];

    // 🧮 Delivery availability check
    const supplierDistance = +supplier?.distKm || 0;
    const maxDeliveryKm = deliveryInfo?.max_delivery_km || 0;
    const deliveryNotAvailable = supplierDistance && maxDeliveryKm && supplierDistance > maxDeliveryKm;

    // 🦴 Skeleton Loader
    if (supplierLoading || categoryLoading || deliveryLoading) {
        return (
            <section className="px-4 py-8 max-w-7xl mx-auto animate-pulse">
                {/* Breadcrumb Skeleton */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="h-4 w-12 bg-gray-200 rounded"></div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>

                {/* Store Title */}
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 w-1/3 bg-gray-100 rounded mb-6"></div>

                {/* Offers Section Skeleton */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="min-w-[250px] bg-gray-100 rounded-2xl h-28 border border-gray-200"
                        ></div>
                    ))}
                </div>

                {/* Categories Skeleton */}
                <div className="space-y-6">
                    {[...Array(2)].map((_, i) => (
                        <div key={i}>
                            <div className="h-5 w-32 bg-gray-200 rounded mb-4"></div>
                            <div className="flex gap-4 overflow-x-auto no-scrollbar">
                                {[...Array(6)].map((_, j) => (
                                    <div
                                        key={j}
                                        className="w-24 h-28 bg-gray-100 rounded-xl border border-gray-200"
                                    ></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Product Grid Skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-10">
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={i}
                            className="border rounded-xl p-2 bg-gray-100 h-48 flex flex-col justify-between"
                        >
                            <div className="h-24 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded mt-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    // 🏪 Main Page After Loading
    return (
        <section className="px-4 py-8 max-w-7xl mx-auto">
            {/* Breadcrumbs */}

            <nav
                aria-label="Breadcrumb"
                itemScope
                itemType="https://schema.org/BreadcrumbList"
                className="flex items-center text-sm text-gray-600 mb-6"
            >
                <ol className="flex items-center">
                    {/* 🏠 Home */}
                    <li
                        itemProp="itemListElement"
                        itemScope
                        itemType="https://schema.org/ListItem"
                        className="flex items-center"
                    >
                        <Link href="/" itemProp="item" className="hover:text-primary transition">
                            <span itemProp="name">Home</span>
                        </Link>
                        <meta itemProp="position" content="1" />
                    </li>

                    <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />

                    {/* 🏬 Store */}
                    <li
                        itemProp="itemListElement"
                        itemScope
                        itemType="https://schema.org/ListItem"
                        className="flex items-center"
                    >
                        <Link
                            href={`/store/${handle}`}
                            itemProp="item"
                            className="hover:text-primary transition font-medium"
                        >
                            <span itemProp="name">{supplier?.storeName || "Store"}</span>
                        </Link>
                        <meta itemProp="position" content="2" />
                    </li>
                </ol>
            </nav>


            {/* Store Title */}
            <h1 className="text-xl md:text-2xl font-bold text-pink-600  mb-4 flex items-center gap-2">
                <Link
                    href={`/store/${supplier?.handle}/info`}
                    className="flex items-center gap-2 hover:text-primary transition-colors flex-wrap"
                >
                    <span>
                        {supplier?.storeName
                            ? `${supplier.storeName} — Online Store for Fresh Groceries & Daily Essentials`
                            : "Online Store for Fresh Groceries & Daily Essentials"}
                    </span>
                    <AutoOpenTooltip content="View Shop Info">

                        <Info className="w-5 h-5 text-primary group-hover:text-primary" />
                    </AutoOpenTooltip>
                </Link>
            </h1>

            {/* 🚚 Delivery Availability */}
            {deliveryNotAvailable > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm md:text-base">
                    ❌ Sorry, delivery is not available in your area. <br />
                    This store only delivers within {maxDeliveryKm} km radius, but your
                    location is approximately {supplierDistance.toFixed(1)} km away.
                </div>
            )}

            {/* 🎟️ Offers */}
            <OffersSection supplier={supplier} />

            {/* 🛒 Products */}
            {featuredProducts?._payload?.length > 0 && (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-md md:text-xl font-bold text-primary">
                            Featured Products
                        </h2>

                        {featuredProducts?._payload?.length > 5 && (
                            <Link
                                href={`/store/${handle}/featured`}
                                className="flex items-center text-pink-600 text-sm font-bold hover:text-pink-700 transition"
                            >
                                See All
                                <ChevronRight className="ml-1 w-4 h-4" />
                            </Link>
                        )}
                    </div>

                    {/* 🔄 Horizontal scroll container */}
                    <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3">
                        {featuredProductLoading
                            ? Array.from({ length: 6 }).map((_, i) => (
                                <ProductSkeleton key={i} />
                            ))
                            : featuredProducts?._payload?.map((p) => (
                                <div key={p._id} className="min-w-40 sm:min-w-[200px] md:min-w-[220px] shrink-0">
                                    <ProductCard product={p} deliveryNotAllow={p.deliveryNotAllowed} />
                                </div>
                            ))}
                    </div>

                </>
            )}
            {/* 🧭 Categories */}
            {categories.map((parent: any) => {

                return (
                    <div key={parent._id} className="mb-10">
                        <Link
                            href={`/store/${handle}/${parent.handle}/all`}
                            className="block text-lg font-bold mb-4 text-primary hover:underline transition"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-primary hover:text-green-700 hover:underline  transition">
                                    {parent.name}
                                </h2>

                                <span className="text-sm text-primary hover:text-green-700  ">
                                    View All →
                                </span>
                            </div>
                        </Link>

                        {/* 🧭 Uniform Scrollable Row */}
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
                            {parent.children?.length > 0 ? (
                                parent.children.map((child: any) => {
                                    const createdDate = new Date(child.createdAt);
                                    const daysSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
                                    const isNew = daysSinceCreated <= 30;
                                    return (
                                        <Link
                                            href={`/store/${handle}/${parent.handle}/${child.handle}`}
                                            key={child._id}
                                            onClick={() => setActiveCategory(child._id)}
                                            className={`relative flex flex-col items-center bg-white rounded-xl shadow-sm hover:shadow-md transition p-3 border border-gray-100 shrink-0 w-40 sm:w-[180px] lg:w-[200px] ${activeCategory === child._id ? "ring-2 ring-green-500" : ""}`}
                                        >
                                            {/* 🏷️ NEW Badge */}
                                            {isNew && <span className="absolute top-2 left-2 z-10 bg-purple-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                                NEW
                                            </span>}

                                            {/* 🖼️ Category Image */}
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 relative mb-2">
                                                <Image
                                                    src={
                                                        child.image || parent.image || "/category-placeholder.svg"
                                                    }
                                                    alt={child.name}
                                                    fill
                                                    className="object-contain rounded-lg bg-gray-50"
                                                />
                                            </div>

                                            {/* 📛 Category Name */}
                                            <p className="text-center text-sm sm:text-base font-medium text-gray-800 line-clamp-2">
                                                {child.name}
                                            </p>
                                        </Link>
                                    )
                                })
                            ) : (
                                <div className="text-gray-500 text-sm italic col-span-full text-center py-4">
                                    No subcategories available
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}




            <>
                <div className="flex justify-between items-center  flex-wrap gap-4">
                    <Link
                        href={`/store/${handle}/all-products`}
                        className="flex items-center text-pink-600 text-sm font-bold hover:text-pink-700 transition"

                    >
                        <h2 className="text-md md:text-xl font-bold text-gray-800">
                            Popular Products from {supplier?.storeName}
                        </h2>
                    </Link>
                    <div className="mb-6 relative w-full md:w-1/2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            defaultValue={initialQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full border bg-white border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {productLoading ? (
                        // 🦴 Show skeletons while loading
                        Array.from({ length: 10 }).map((_, i) => <ProductSkeleton key={i} />)
                    ) : products?._payload?.length > 0 ? (
                        // 🛒 Render actual products
                        products._payload.map((p) => (
                            <ProductCard
                                key={p._id}
                                product={p}
                                deliveryNotAllow={p.deliveryNotAllowed}
                            />
                        ))
                    ) : (
                        // 🚫 No products found
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
                            <Search className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="text-sm md:text-base">No products found for your search.</p>
                        </div>
                    )}
                </div>

            </>
        </section>
    );
}
