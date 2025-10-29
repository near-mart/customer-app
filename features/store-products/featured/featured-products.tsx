"use client";
import { ProductCard } from "@/layout/product/product-card";
import { fetchProducts } from "@/services/products";
import { fetchSupplier } from "@/services/suppliers";
import useLocationStore from "@/store/location";
import { useQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import { ChevronRight, Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import ProductSkeleton from "@/components/product-skeleton";
import Link from "next/link";

export default function FeaturedProducts({ handle }) {
    const { locationData } = useLocationStore();
    const router = useRouter();
    const searchParams = useSearchParams();

    // 🌐 Load initial query from URL if present
    const initialQuery = searchParams.get("q") || "";
    const [query, setQuery] = useState(initialQuery);

    // 🧠 Debounced search
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

    // 🏪 Fetch Supplier
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

    // 🛒 Fetch Featured Products
    const { data: featuredProducts, isLoading: featuredProductLoading } = useQuery({
        queryKey: [
            "fetchProducts",
            0,
            15,
            supplier?._id,
            locationData?.latitude,
            locationData?.longitude,
            query,
            true
        ],
        queryFn: ({ signal }) =>
            fetchProducts(signal, {
                page: 0,
                page_size: 15,
                supplier: supplier?._id,
                latitude: locationData?.latitude,
                longitude: locationData?.longitude,
                search: query,
                features: true

            }),
        enabled: !!supplier?._id,
    });

    const products = featuredProducts?._payload || [];

    return (
        <div className="mt-8">
            {/* 🔖 Section Header */}
            <nav className="flex items-center text-sm text-gray-600  mb-6 flex-wrap gap-2 md:gap-1">
                <Link href="/" className="hover:text-primary transition">
                    Home
                </Link>
                <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                <Link
                    href={`/store/${handle}`}
                    className="hover:text-primary transition font-medium"
                >
                    {supplier?.storeName || "Store"}
                </Link>
                <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                <Link
                    href={`/store/${handle}/featured`}
                    className="hover:text-primary transition font-medium"
                >
                    Featured
                </Link>
            </nav>
            <div className="flex justify-between items-center mb-4 flex-wrap">
                <h2 className="text-md md:text-xl font-bold text-primary">
                    Featured Products
                </h2>

                {/* 🔍 Search Input */}
                <div className=" relative w-full md:w-1/2 mt-2 md:mt-0">
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

            {/* 🧩 Product Grid */}
            {featuredProductLoading || supplierLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <ProductSkeleton key={i} />
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {products.map((p) => (
                        <ProductCard
                            key={p._id}
                            product={p}
                            deliveryNotAllow={p.deliveryNotAllowed}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <Search className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="text-sm md:text-base">
                        No products found for your search.
                    </p>
                </div>
            )}
        </div>
    );
}
