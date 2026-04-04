"use client";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSupplier } from "@/services/suppliers";
import { getStoreStatus } from "@/functions/supplier";
import SupplierCard from "@/layout/supplier/supplier-card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function Suppliers({ location, categories }: any) {
    const [total, setTotal] = useState(0);
    const [category, setCategory] = useState("All");

    const { data: suppliers, isLoading } = useQuery({
        queryKey: ["fetchSupplier", location?.latitude || null, location?.longitude || null, category],
        queryFn: ({ signal }) =>
            fetchSupplier(signal, {
                page: 0,
                page_size: 15,
                latitude: location.latitude,
                longitude: location.longitude,
                categories: category === "All" ? undefined : category || undefined,
            }),
        enabled: !!(location?.latitude && location?.longitude),
    });


    useEffect(() => {
        if (suppliers?.pagination) {
            setTotal(suppliers?.pagination?.total || 0);
        }
    }, [suppliers]);

    const supplierList = suppliers?._payload || [];

    return (
        <section className="px-4 py-8 max-w-7xl mx-auto">
            {/* 🧭 Header */}
            {/* 🍽️ Category Scroll Row */}
            <div className="flex gap-4 overflow-x-auto scrollbar-hide py-3 px-1 md:px-2 lg:px-0">
                {/* All Category */}
                <div
                    onClick={() => setCategory("All")}
                    className={`flex-none w-20 sm:w-[90px] md:w-[100px] flex flex-col items-center cursor-pointer transition-transform ${category === "All"
                        ? "scale-105 text-primary"
                        : "opacity-80 hover:opacity-100"
                        }`}
                >
                    <div
                        className={`w-16 h-16 bg-white rounded-full border-2 flex items-center justify-center overflow-hidden transition ${category === "All"
                            ? "border-primary bg-primary/10"
                            : "border-gray-200 bg-gray-50"
                            }`}
                    >
                        <Image
                            src="/all-category.png"
                            alt="All"
                            width={48}
                            height={48}
                            className="object-cover"
                        />
                    </div>
                    <span
                        className={`text-xs md:text-sm mt-2 font-medium text-center ${category === "All" ? "text-primary" : "text-gray-600"
                            }`}
                    >
                        All
                    </span>
                </div>

                {/* Other Categories */}
                {categories?.map((cat: any) => (
                    <div
                        key={cat._id}
                        onClick={() => setCategory(cat._id)}
                        className={`flex-none w-20 sm:w-[90px] md:w-[100px] flex flex-col items-center cursor-pointer transition-transform ${category === cat._id
                            ? "scale-105 text-primary"
                            : "opacity-80 hover:opacity-100"
                            }`}
                    >
                        <div
                            className={`w-16 h-16 rounded-full border-2 overflow-hidden flex items-center bg-white justify-center transition ${category === cat._id
                                ? "border-primary bg-primary/10"
                                : "border-gray-200 bg-gray-50"
                                }`}
                        >
                            <Image
                                src={cat.image || "/category-placeholder.svg"}
                                alt={cat.name}
                                width={48}
                                height={48}
                                className="object-cover"
                            />
                        </div>
                        <span
                            className={`text-xs md:text-sm mt-2 font-medium text-center ${category === cat._id ? "text-primary" : "text-gray-600"
                                }`}
                        >
                            {cat.name}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mb-4 flex justify-between items-center flex-wrap gap-3">
                <h2 className="text-sm md:text-xl font-bold text-gray-700">
                    {isLoading
                        ? "Detecting nearby stores..."
                        : location
                            ? total > 0
                                ? `${total} Stores Delivering to You`
                                : "No stores available nearby"
                            : "Getting your location..."}
                </h2>
            </div>



            {/* 🧭 Supplier Grid */}
            {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <SupplierSkeleton key={i} />
                    ))}
                </div>
            ) : supplierList.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {supplierList.map((s: any) => {
                        const { isOpen, showCloseTime, closeAt, nextOpen, nextDay } =
                            getStoreStatus(s.storeTimings);
                        return (
                            <SupplierCard
                                key={s._id}
                                {...{ s, isOpen, showCloseTime, closeAt, nextOpen, nextDay }}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-20">
                    <Image
                        src="/empty-stores.svg"
                        alt="No stores nearby"
                        width={140}
                        height={140}
                        className="opacity-80 mb-6"
                    />
                    <h3 className="text-gray-700 font-semibold text-base sm:text-lg">
                        No stores available in your area 🏪
                    </h3>
                    <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-md">
                        We couldn’t find any nearby stores right now.
                        Try selecting another category or check again later.
                    </p>
                </div>
            )}
        </section>
    );
}

export const SupplierSkeleton = () => (
    <div className="space-y-3 bg-white p-2 rounded-2xl shadow-sm">
        <Skeleton className="w-full aspect-square rounded-xl" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-between gap-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/2" />
        </div>
    </div>
);
