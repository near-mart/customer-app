"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function Categories({
    categories,
    loading,
}: {
    categories?: any[];
    loading?: boolean;
}) {
    const skeletonArray = Array.from({ length: 6 });

    return (
        <section className="max-w-7xl mx-auto px-4 py-6 relative">
            <h2 className="text-lg sm:text-xl font-semibold mb-5 text-primary">
                🛍️ Shop by Category
            </h2>

            {loading ? (
                <div className="flex gap-4 overflow-hidden">
                    {skeletonArray.map((_, i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm animate-pulse"
                        >
                            <Skeleton className="w-[80px] h-[80px] rounded-full" />
                            <Skeleton className="w-16 h-3 mt-3 rounded-md" />
                        </div>
                    ))}
                </div>
            ) : (
                // ✅ Scrollable horizontal container with snap
                <div
                    className="
            flex overflow-x-auto snap-x snap-mandatory 
            gap-4 scrollbar-hide scroll-smooth pb-3
          "
                >
                    {categories?.map((cat) => (
                        <div
                            key={cat._id}
                            className="snap-start flex-shrink-0 w-[45%] sm:w-[18%] md:w-[15%] lg:w-[13%]"
                        >
                            <Link href={`/categories/${cat._id}`}>
                                <div className="flex flex-col items-center bg-white rounded-xl shadow-sm hover:shadow-md py-4 px-3 cursor-pointer transition">
                                    <div className="relative w-[70px] h-[70px] sm:w-[100px] sm:h-[100px] overflow-hidden rounded-full border border-gray-200 flex-shrink-0">
                                        <Image
                                            src={cat.image || "/category-placeholder.svg"}
                                            alt={cat.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width:768px) 50vw, (max-width:1200px) 25vw, 100px"
                                        />
                                    </div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-700 mt-2 text-center truncate w-full">
                                        {cat.name}
                                    </p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
