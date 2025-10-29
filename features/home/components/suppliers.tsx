"use client";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSupplier } from "@/services/suppliers";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getStoreStatus } from "@/functions/supplier";
import SupplierCard from "@/layout/supplier/supplier-card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function Suppliers({ location, categories }: any) {
    const [total, setTotal] = useState(0);
    const [category, setCategory] = useState("All");

    const { data: suppliers, isLoading } = useQuery({
        queryKey: ["fetchSupplier", location, category],
        queryFn: ({ signal }) =>
            fetchSupplier(signal, {
                page: 0,
                page_size: 15,
                latitude: location.latitude,
                longitude: location.longitude,
                categories: category === "All" ? undefined : category || undefined,
            }),
        enabled: !!location?.latitude && !!location?.longitude,
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

                {/* 🧭 Category Filter */}
                <div>
                    <Select
                        value={category}
                        onValueChange={(val) => setCategory(val)}
                    >
                        <SelectTrigger className="w-[250px] md:w-[200px] border-gray-300">
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All</SelectItem>
                            {categories?.map((it) => (
                                <SelectItem key={it._id} value={it._id}>
                                    {it.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
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
