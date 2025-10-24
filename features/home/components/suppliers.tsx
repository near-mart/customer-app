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
} from "@/components/ui/select"
import { getStoreStatus } from "@/functions/supplier";
import SupplierCard from "@/layout/supplier/supplier-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Suppliers({ location, categories }: any) {
    const [total, setTotal] = useState(0);
    const [category, setCategory] = useState("")
    const { data: suppliers, isLoading } = useQuery({
        queryKey: ["fetchSupplier", location, category],
        queryFn: ({ signal }) =>
            fetchSupplier(signal, {
                page: 0,
                page_size: 15,
                location: JSON.stringify(location),
                categories: category == "All" ? undefined : category || undefined
            }),
    });

    useEffect(() => {
        if (suppliers?.pagination) {
            setTotal(suppliers?.pagination?.total || 0);
        }
    }, [suppliers]);

    const supplierList = suppliers?._payload || [];
    const SupplierSkeleton = () => (
        <div className="space-y-3 bg-white p-2 rounded-2xl">
            <Skeleton className="w-full aspect-square rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between gap-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );

    return (
        <section className="px-4 py-8 max-w-7xl mx-auto">
            <div className="mb-4 flex justify-between items-center flex-wrap gap-3">
                <h2 className="text-sm md:text-xl font-bold  text-gray-500">
                    {isLoading ? "Loading..." : `${total} Stores Delivering to You`}
                </h2>
                <div className="">
                    <Select onValueChange={(val) => {
                        setCategory(val);
                    }} >
                        <SelectTrigger className="w-[250px] md:w-[200px] border-gray-700">
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={"All"}>All</SelectItem>
                            {
                                categories?.map((it) => {
                                    return (
                                        <SelectItem key={it._id} value={it._id}>{it.name}</SelectItem>
                                    )
                                })
                            }
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => <SupplierSkeleton key={i} />)
                    : supplierList.map((s: any) => {
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
        </section>
    );
}
