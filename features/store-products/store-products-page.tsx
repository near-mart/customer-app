"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchSupplier } from "@/services/suppliers";
import { fetchNestedCategory } from "@/services/categories";
import { ChevronRight, Loader2 } from "lucide-react";

export default function StoreProductsPage({ handle }: { handle: string }) {
    const [activeCategory, setActiveCategory] = useState<string>("all");

    // 🧩 Fetch supplier by handle
    const { data: suppliers, isLoading: supplierLoading } = useQuery({
        queryKey: ["fetchSupplier", handle],
        queryFn: ({ signal }) =>
            fetchSupplier(signal, {
                page: 0,
                page_size: 15,
                handle,
            }),
        enabled: !!handle,
    });

    const supplier = suppliers?._payload?.[0];

    // 🧩 Fetch nested categories
    const { data: categoriesData, isLoading: categoryLoading } = useQuery({
        queryKey: ["fetchNestedCategory", supplier?._id],
        queryFn: ({ signal }) =>
            fetchNestedCategory(signal, {
                supplier: supplier?._id,
            }),
        enabled: !!supplier?._id,
    });

    const categories = categoriesData?._payload || [];

    if (supplierLoading || categoryLoading)
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );

    return (
        <section className="px-4 py-8 max-w-7xl mx-auto">
            {/* 🧭 Breadcrumbs */}
            <nav className="flex items-center text-sm text-gray-600 mb-6">
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
            </nav>

            {/* 🏪 Store Heading */}

            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Welcome to {supplier?.storeName || "Our Store"}
            </h1>

            {/* 🧭 Parent Categories */}
            {categories.map((parent: any) => (
                <div key={parent._id} className="mb-10">
                    {/* 🏷️ Parent Header (clickable link) */}
                    <Link
                        href={`/store/${handle}/${parent.handle}/all`}
                        className="block text-lg font-bold mb-4 text-primary hover:underline hover:text-green-700 transition"
                    >
                        {parent.name}
                    </Link>

                    {/* 🧱 Subcategory Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 gap-2">
                        {parent.children?.length > 0 ? (
                            parent.children.map((child: any) => (
                                <Link
                                    href={`/store/${handle}/${parent.handle}/${child.handle}`}
                                    key={child._id}
                                    onClick={() => setActiveCategory(child._id)}
                                    className={`relative flex flex-col items-center bg-white rounded-xl shadow-sm hover:shadow-md transition p-3 border border-gray-100 ${activeCategory === child._id ? "ring-2 ring-green-500" : ""
                                        }`}
                                >
                                    {/* 🏷️ NEW Badge */}
                                    <span className="absolute top-2 z-10 left-2 bg-purple-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                        NEW
                                    </span>

                                    {/* 🖼️ Category Image */}
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 relative mb-2">
                                        <Image
                                            src={
                                                child.image ||
                                                parent.image ||
                                                "/category-placeholder.svg"
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
                            ))
                        ) : (
                            <div className="text-gray-500 text-sm italic col-span-full text-center py-4">
                                No subcategories available
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </section>
    );
}
