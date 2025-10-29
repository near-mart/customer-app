"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/layout/product/product-card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
export default function Products({ products = [], loading }) {
    if (loading) {
        return (
            <section className="px-4 py-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="p-2 rounded-xl border bg-white space-y-2">
                            <Skeleton className="w-full aspect-square rounded-lg" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-3 w-1/3" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }
    if (!products?.length) {
        return
    }

    return (
        <section className="px-4 py-4 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-md md:text-xl font-bold text-gray-800">
                    Discover Fresh Products Near You 🛒
                </h1>

                {products.length > 10 && (
                    <Link
                        href="/products"
                        className="flex items-center text-pink-600 text-sm font-bold hover:text-pink-700 transition"
                    >
                        See All
                        <ChevronRight className="ml-1 w-4 h-4" />
                    </Link>
                )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map((p) => {
                    return (
                        <ProductCard key={p._id} product={p} deliveryNotAllow={p.deliveryNotAllowed} />
                    )
                })}
            </div>
        </section>
    );
}


