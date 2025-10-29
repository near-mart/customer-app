"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchSupplier } from "@/services/suppliers";
import { fetchNestedCategory } from "@/services/categories";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/layout/product/product-card";
import { fetchProducts } from "@/services/products";
import useLocationStore from "@/store/location";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

export default function ProductsWithCategoryPage({
    handle,
    parentCategory,
    subCategory,
}: {
    handle: string;
    parentCategory: string;
    subCategory?: string;
}) {
    const router = useRouter();
    const { locationData } = useLocationStore();
    const [parentId, setParentId] = useState("")

    // 🧩 Fetch supplier
    const { data: suppliers, isLoading: supplierLoading } = useQuery({
        queryKey: ["fetchSupplier", handle],
        queryFn: ({ signal }) =>
            fetchSupplier(signal, {
                page: 0, page_size: 15, handle,
                latitude: locationData?.latitude,
                longitude: locationData?.longitude,
            }),
        enabled: !!handle,
    });

    const supplier = suppliers?._payload?.[0];

    // 🧩 Fetch nested categories
    const { data: categoriesData, isLoading: categoryLoading } = useQuery({
        queryKey: ["fetchNestedCategory", supplier?._id],
        queryFn: ({ signal }) =>
            fetchNestedCategory(signal, { supplier: supplier?._id }),
        enabled: !!supplier?._id,
    });

    const categories = categoriesData?._payload || [];
    const parent = categories.find((cat: any) => cat.handle === parentCategory);
    const subCategories = parent?.children || [];
    const activeSub =
        subCategories?.find((s: any) => s.handle == subCategory)?.handle || "all";
    const activeSubInfo =
        subCategories?.find((s: any) => s.handle == subCategory) || "all";

    const { data: products, isLoading: isProductLoading } = useQuery({
        queryKey: [
            "fetchProducts",
            [parent?._id, activeSubInfo?._id == "all" ? null : activeSubInfo?._id].filter(Boolean).join(","),
            supplier?._id,
            locationData?.latitude,
            locationData?.longitude,
        ],
        queryFn: ({ signal }) =>
            fetchProducts(signal, {
                page: 0,
                page_size: 15,
                category: [parent?._id, activeSubInfo?._id == "all" ? null : activeSubInfo?._id].filter(Boolean).join(","),
                supplier: supplier?._id,
                latitude: locationData?.latitude,
                longitude: locationData?.longitude,
            }),
        enabled:
            !!supplier?._id &&
            !!locationData?.latitude &&
            !!locationData?.longitude,
    });

    const productList = products?._payload || [];

    // 🧭 Handle subcategory navigation
    const handleSubChange = (subHandle: string) => {
        if (subHandle === "all") {
            router.push(`/store/${handle}/${parent.handle}/all`);
        } else {
            router.push(`/store/${handle}/${parent.handle}/${subHandle}`);
        }
    };

    // 🧱 Skeleton Components
    const CategorySkeleton = () => (
        <div className="flex flex-col gap-2 sm:space-y-1">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="flex sm:flex-row flex-col items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg w-full"
                >
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="sm:ml-2 h-3 w-16 sm:w-24 mt-1 sm:mt-0" />
                </div>
            ))}
        </div>
    );

    const ProductSkeleton = () => (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pb-10">
            {Array.from({ length: 10 }).map((_, i) => (
                <div
                    key={i}
                    className="flex flex-col items-center border rounded-xl p-2 sm:p-3 shadow-sm"
                >
                    <Skeleton className="w-full h-24 sm:h-32 rounded-lg mb-2" />
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-3 w-14" />
                </div>
            ))}
        </div>
    );

    return (
        <section className="h-[calc(100vh-64px)] flex flex-col md:max-w-7xl mx-auto md:px-4 py-4 md:py-6 ">
            {/* 🧭 Breadcrumb */}

            <nav
                aria-label="Breadcrumb"
                itemScope
                itemType="https://schema.org/BreadcrumbList"
                className="flex items-center text-xs md:text-sm text-gray-600 mb-3 flex-wrap px-3 sm:px-6 pt-4"
            >
                <ol className="flex flex-wrap items-center">
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
                            className="hover:text-primary transition"
                        >
                            <span itemProp="name">{supplier?.storeName || "Store"}</span>
                        </Link>
                        <meta itemProp="position" content="2" />
                    </li>

                    {/* 📂 Parent Category */}
                    {parent && (
                        <>
                            <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                            <li
                                itemProp="itemListElement"
                                itemScope
                                itemType="https://schema.org/ListItem"
                                className="flex items-center"
                            >
                                <Link
                                    href={`/store/${handle}/${parent.handle}/all`}
                                    itemProp="item"
                                    className="text-gray-900 font-medium hover:text-primary transition"
                                >
                                    <span itemProp="name">{parent.name}</span>
                                </Link>
                                <meta itemProp="position" content="3" />
                            </li>
                        </>
                    )}

                    {/* 🏷️ Sub-Category */}
                    {subCategory && subCategory !== "all" && (
                        <>
                            <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                            <li
                                itemProp="itemListElement"
                                itemScope
                                itemType="https://schema.org/ListItem"
                                className="flex items-center"
                            >
                                <span
                                    itemProp="name"
                                    className="text-gray-800 font-medium capitalize"
                                >
                                    {subCategories.find((s: any) => s.handle === subCategory)?.name ||
                                        subCategory}
                                </span>
                                <meta
                                    itemProp="position"
                                    content={parent ? "4" : "3"}
                                />
                            </li>
                        </>
                    )}
                </ol>
            </nav>


            {/* 🧭 Main layout — Sidebar fixed, Product section scrollable */}
            <div className="flex flex-1 overflow-hidden">
                {/* 🧭 Sidebar */}
                <aside className="border-r w-20 sm:w-[200px] px-2 sm:px-4 py-3 sm:py-4 shrink-0">
                    <h2 className="hidden sm:block font-semibold mb-3 text-gray-800">
                        Categories
                    </h2>

                    {(categoryLoading || supplierLoading) ? (
                        <CategorySkeleton />
                    ) : (
                        <div className="flex flex-col gap-2 sm:space-y-1">
                            {/* All Button */}
                            <button
                                onClick={() => handleSubChange("all")}
                                className={`flex sm:flex-row flex-col items-center sm:items-center text-center sm:text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm transition cursor-pointer w-full ${activeSub === "all"
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "hover:bg-gray-50 text-gray-700"
                                    }`}
                            >
                                <Image
                                    src="/category-placeholder.svg"
                                    alt="All"
                                    width={32}
                                    height={32}
                                    className="rounded-full border mb-1 sm:mb-0"
                                />
                                <span className="sm:ml-2 text-wrap leading-tight text-[11px] sm:text-[13px]">
                                    All
                                </span>
                            </button>

                            {/* Subcategories */}
                            {subCategories.map((sub: any) => (
                                <button
                                    key={sub._id}
                                    onClick={() => handleSubChange(sub.handle)}
                                    className={`flex sm:flex-row flex-col items-center cursor-pointer text-center sm:text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm transition w-full ${activeSub === sub.handle
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "hover:bg-gray-50 text-gray-700"
                                        }`}
                                >
                                    <Image
                                        src={sub.image || "/category-placeholder.svg"}
                                        alt={sub.name}
                                        width={32}
                                        height={32}
                                        className="rounded-full border mb-1 sm:mb-0"
                                    />
                                    <span className="sm:ml-2 leading-tight text-[11px] sm:text-[13px]">
                                        {sub.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </aside>

                {/* 🛍️ Product Scroll Section */}
                <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 no-scrollbar">
                    <h1 className="text-xs sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                        {parent?.name || "Products"}
                        {activeSub !== "all" && (
                            <span className="text-gray-500 ml-1 sm:ml-2 text-xs sm:text-base">
                                ›{" "}
                                {
                                    subCategories.find((s: any) => s.handle === activeSub)
                                        ?.name || "Subcategory"
                                }
                            </span>
                        )}
                    </h1>

                    {/* 🛒 Product Grid or Empty State */}
                    {(isProductLoading || supplierLoading) ? (
                        <ProductSkeleton />
                    ) : productList.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pb-10">
                            {productList.map((p) => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-20">
                            <Image
                                src="/empty-products.svg"
                                alt="No Products"
                                width={120}
                                height={120}
                                className="opacity-70 mb-4"
                            />
                            <h3 className="text-gray-700 font-medium text-sm sm:text-base">
                                No products available in this category.
                            </h3>
                            <p className="text-gray-500 text-xs sm:text-sm mt-1">
                                Try exploring another category or check back later.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </section>
    );
}
