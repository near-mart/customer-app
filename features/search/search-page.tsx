"use client"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getStoreStatus } from "@/functions/supplier";
import { SupplierSkeleton } from "../home/components/suppliers";
import SupplierCard from "@/layout/supplier/supplier-card";
import { ProductCard } from "@/layout/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SearchPage({ isLoading, suppliers, products, isProductLoading, setTabs, tabs, query, setQuery }: any) {
    const searchParams = useSearchParams();
    const router = useRouter();
    useEffect(() => {
        const tabParam = searchParams.get("tab");
        const qParam = searchParams.get("q");
        if (tabParam && tabParam !== tabs) setTabs(tabParam);
        if (qParam && qParam !== query) setQuery(qParam);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams();
        if (tabs) params.set("tab", tabs);
        if (query) params.set("q", query);
        const newUrl = `/search?${params.toString()}`;
        router.replace(newUrl, { scroll: false });
    }, [tabs, query, router]);
    return (
        <div className="w-full max-w-7xl mx-auto mt-6">
            <Tabs
                value={tabs}
                onValueChange={(value) => {
                    setTabs(value);
                    setQuery("")
                }}

            >
                <TabsList className="flex justify-start border-b border-gray-200 bg-transparent p-0">
                    <TabsTrigger
                        value="stores"
                        className="md:min-w-[150px] cursor-pointer relative px-6 py-3 text-sm font-medium text-gray-600 
                        data-[state=active]:text-primary data-[state=active]:font-semibold
                        data-[state=active]:after:content-[''] data-[state=active]:after:absolute 
                        data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 
                        data-[state=active]:after:w-full data-[state=active]:after:h-0.5 
                        data-[state=active]:after:bg-primary transition-all"
                    >
                        Stores
                    </TabsTrigger>

                    <TabsTrigger
                        value="products"
                        className="cursor-pointer md:min-w-[150px] relative px-6 py-3 text-sm font-medium text-gray-600 
                        data-[state=active]:text-primary data-[state=active]:font-semibold
                        data-[state=active]:after:content-[''] data-[state=active]:after:absolute 
                        data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 
                        data-[state=active]:after:w-full data-[state=active]:after:h-0.5 
                        data-[state=active]:after:bg-primary transition-all"
                    >
                        Products
                    </TabsTrigger>
                </TabsList>

                {/* --- STORES TAB --- */}
                <TabsContent value="stores" className="mt-6">
                    {isLoading ? (
                        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <SupplierSkeleton key={i} />
                            ))}
                        </div>
                    ) : suppliers?.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {suppliers.map((s: any) => {
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
                        <div className="text-center text-gray-500 text-sm sm:text-base py-10">
                            🏪 No stores found nearby.
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="products" className="mt-6">
                    {isProductLoading ? (
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
                    ) : products?.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {products.map((p) => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 text-sm sm:text-base py-10">
                            🛒 No products found matching your search.
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
