"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowLeft, Heart, Minus, Plus, Store, Trash2 } from "lucide-react";
import Link from "next/link";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import { addToCart, getWishList, toggleWishlist } from "@/services/products";
import { useCartStore } from "@/store/cartStore";
import { useAuthValidator } from "@/store/authValidater";
import { useWishlistStore } from "@/store/wishlistStore";
import { fetchBookMarkSupplier } from "@/services/suppliers";
import SupplierCard from "@/layout/supplier/supplier-card";
import { getStoreStatus } from "@/functions/supplier";
import { SupplierSkeleton } from "../home/components/suppliers";
import useLocationStore from "@/store/location";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useBookmarkStore } from "@/store/bookmarkStore";

export default function WishListPage() {
    const { locationData } = useLocationStore()
    const { bookmarks } = useBookmarkStore();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab") || "products";
    const [tab, setTab] = useState(() => initialTab);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const loadMoreSupplierRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();
    const { isAuthenticate } = useAuthValidator((s) => s);
    const { removeWishlist } = useWishlistStore();
    const { addOrReplace, increment, decrement, getQty } = useCartStore();
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        refetch: refetchWishlist
    } = useInfiniteQuery({
        queryKey: ["getWishList", tab],
        queryFn: ({ pageParam = 1, signal }) => getWishList(signal, { page: pageParam, page_size: 20 }),
        getNextPageParam: (lastPage) => lastPage.pagination.page < lastPage.pagination.totalPages ? lastPage.pagination.page + 1 : undefined,
        enabled: tab == "products"
    });
    const {
        data: supplier,
        fetchNextPage: fetchNextSupplierPage,
        hasNextPage: hasNextSupplierPage,
        isFetchingNextPage: isFetchingNextSupplierPage,
        isLoading: isLoadingSupplier,
        refetch: refetchSuppliers,
    } = useInfiniteQuery({
        queryKey: ["fetchBookMarkSupplier", tab, locationData?.latitude || null, locationData?.longitude || null, bookmarks?.length],
        queryFn: ({ pageParam = 1, signal }) => fetchBookMarkSupplier(signal, {
            page: pageParam, page_size: 20,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
        }),
        getNextPageParam: (lastPage) => lastPage.pagination.page < lastPage.pagination.totalPages ? lastPage.pagination.page + 1 : undefined,
        enabled: tab == "saved"
    });
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (tab === "products") refetchWishlist();
        if (tab === "saved") refetchSuppliers();
    }, [tab]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.5 }
        );
        if (loadMoreRef.current) observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, fetchNextPage]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextSupplierPage) {
                    fetchNextSupplierPage();
                }
            },
            { threshold: 0.5 }
        );
        if (loadMoreSupplierRef.current) observer.observe(loadMoreSupplierRef.current);
        return () => observer.disconnect();
    }, [hasNextSupplierPage, fetchNextSupplierPage]);


    const wishListData = data?.pages.flatMap((page) => page?._payload || []) || [];
    const supplierList = supplier?.pages.flatMap((page) => page?._payload || []) || [];

    // 🧠 Cart Sync Mutation
    const { mutateAsync: syncCart } = useMutation({
        mutationFn: addToCart,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["getCart"] }),
    });

    const debouncedSync = useCallback(
        debounce(async (supplier_id, product_id, variant_id, qty) => {
            try {
                await syncCart({ supplier_id, product_id, variant_id, qty });
            } catch (err) {
                console.error("Sync failed:", err);
            }
        }, 400),
        []
    );

    // ➕ Add to cart
    const handleAdd = (product, variant) => {
        const supplierId = product.supplier_id;
        const supplierName = product?.storeName || product?.supplier?.name;
        addOrReplace(supplierId, supplierName, {
            productId: product._id,
            variantId: variant._id,
            qty: 1,
            ...product,
        });
        debouncedSync(supplierId, product._id, variant._id, 1);
    };

    // 🔄 Quantity Change
    const handleQtyChange = (product, variant, newQty) => {
        const supplierId = product.supplier_id;
        const supplierName = product?.storeName || product?.supplier?.name;
        const cartItem = {
            productId: product._id,
            variantId: variant._id,
            qty: newQty,
            ...product,
        };

        const currentQty = getQty(supplierId, product._id) || 0;
        if (newQty > currentQty) increment(supplierId, supplierName, cartItem);
        else decrement(supplierId, supplierName, cartItem);

        debouncedSync(supplierId, product._id, variant._id, newQty);
    };

    // ❤️ Remove from wishlist
    const handleRemoveWishlist = async (productId, supplierId) => {
        try {
            if (isAuthenticate)
                await toggleWishlist({ product_id: productId, supplier_id: supplierId });
            removeWishlist(productId);
            queryClient.invalidateQueries({ queryKey: ["getWishList"] });
        } catch (err) {
            console.error("Failed to remove wishlist:", err);
        }
    };

    const handleTabChange = (value: string) => {
        setTab(value);

        const params = new URLSearchParams(searchParams);
        params.set("tab", value);

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
    return (
        <section>
            <h1 className="text-2xl md:text-2xl font-bold mb-8 text-gray-900 flex gap-2 items-center">
                <Button variant="secondary" size="icon" className="cursor-pointer"
                    onClick={() => router.push("/account")}
                >
                    <ArrowLeft />
                </Button>
                My Wishlist ❤️
            </h1>

            <Tabs value={tab} onValueChange={handleTabChange}>
                <TabsList className="bg-gray-100 rounded-xl p-1 mb-6">
                    <TabsTrigger
                        value="products"
                        className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-700 font-semibold rounded-lg px-4 py-4 cursor-pointer"
                    >
                        Wishlist Products
                    </TabsTrigger>
                    <TabsTrigger
                        value="saved"
                        className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-700 font-semibold rounded-lg px-4 py-4 cursor-pointer"
                    >
                        Saved Stores
                    </TabsTrigger>
                </TabsList>

                {/* 🧺 Wishlist Products */}
                <TabsContent value="products">
                    {isLoading ? (
                        <div className="text-center text-gray-500 py-12">Loading...</div>
                    ) : wishListData.length === 0 ? (
                        <div className="text-center text-gray-500 py-12">
                            <Heart className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                            <p>No products in your wishlist yet!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-gray-100">
                            {wishListData.map((item, i) => {
                                const product = item.product;
                                if (!product) return null;
                                const variant = product.variants?.[0];
                                const price = variant?.discount_price || variant?.selling_price;
                                const qty = getQty(product.supplier_id, product._id) || 0;

                                const parentCategory = product?.categories?.find((it) => it.parent == null);
                                const childCategory = product?.categories?.find((it) => it.parent != null);
                                const productUrl = `/store/${item?.supplier?.handle}/${parentCategory?.handle}/${childCategory?.handle}/${product.handle}/${product._id}`;

                                return (
                                    <div
                                        key={i}
                                        className="flex justify-between items-center py-4 gap-4"
                                    >
                                        {/* 🖼 Product Info */}
                                        <div className="flex items-center gap-4 w-full relative">
                                            <Link href={productUrl} aria-label={product.name}>
                                                <div className="relative">
                                                    <Image
                                                        src={
                                                            product.images?.[0]?.url ||
                                                            "/product-placeholder.svg"
                                                        }
                                                        alt={product.name}
                                                        width={90}
                                                        height={90}
                                                        className="rounded-lg object-cover border w-24 h-24 sm:w-28 sm:h-28"
                                                    />

                                                    {/* 🛒 Mobile Add-to-Cart Overlay */}
                                                    <div
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                        }}
                                                        className="absolute bottom-1 right-1 sm:hidden flex items-center gap-1"
                                                    >
                                                        {qty > 0 ? (
                                                            <div className="flex items-center bg-white/90 border border-pink-600 rounded-md px-2 py-1">
                                                                <button
                                                                    onClick={() =>
                                                                        handleQtyChange(product, variant, Math.max(0, qty - 1))
                                                                    }
                                                                    className="text-pink-600 px-1 cursor-pointer"
                                                                >
                                                                    <Minus size={14} />
                                                                </button>
                                                                <span className="text-[11px] font-medium px-1">{qty}</span>
                                                                <button
                                                                    onClick={() =>
                                                                        handleQtyChange(product, variant, qty + 1)
                                                                    }
                                                                    className="text-pink-600 px-1 cursor-pointer"
                                                                >
                                                                    <Plus size={14} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleAdd(product, variant)}
                                                                className=" text-white bg-pink-600 border border-pink-600 text-[10px] font-semibold px-3 py-1 rounded-md hover:bg-pink-600 hover:text-white transition cursor-pointer"
                                                            >
                                                                ADD
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>

                                            <div className="flex-1">
                                                <Link href={productUrl}>
                                                    <h3 className="font-medium text-gray-800 line-clamp-1 hover:underline">
                                                        {product.name}
                                                    </h3>
                                                </Link>
                                                <p className="text-sm text-gray-500">
                                                    {variant?.selling_qty} {variant?.unit}
                                                </p>

                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="font-semibold text-green-700">₹{price}</p>
                                                    {variant?.discount_price !== variant?.selling_price && (
                                                        <p className="text-sm text-gray-400 line-through">
                                                            ₹{variant?.selling_price}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* 🗑 Remove */}
                                                <button
                                                    onClick={() =>
                                                        handleRemoveWishlist(product._id, product.supplier_id)
                                                    }
                                                    className="text-red-600 hover:text-red-600 text-xs flex items-center gap-1 mt-1 cursor-pointer"
                                                >
                                                    <Trash2 size={13} /> Remove
                                                </button>
                                            </div>
                                        </div>

                                        {/* 🧮 Desktop Qty Controls */}
                                        <div className="hidden sm:flex flex-col items-end gap-2 min-w-[90px]">
                                            {qty > 0 ? (
                                                <div className="flex items-center gap-2 border rounded-lg px-2 py-1 bg-white">
                                                    <button
                                                        onClick={() =>
                                                            handleQtyChange(product, variant, Math.max(0, qty - 1))
                                                        }
                                                        className="text-pink-600 p-1 hover:bg-pink-50 rounded cursor-pointer"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="font-medium text-sm w-5 text-center">{qty}</span>
                                                    <button
                                                        onClick={() =>
                                                            handleQtyChange(product, variant, qty + 1)
                                                        }
                                                        className="text-pink-600 p-1 hover:bg-pink-50 rounded cursor-pointer"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAdd(product, variant)}
                                                    className=" text-white bg-pink-600 border border-pink-600 text-[10px] font-semibold px-3 py-1 rounded-md hover:bg-pink-600 hover:text-white transition cursor-pointer"

                                                >
                                                    ADD
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div ref={loadMoreRef} className="flex flex-col items-center justify-center py-10 gap-3">
                        {isFetchingNextPage ? (
                            <div className="flex items-center gap-2 text-gray-500">
                                <svg
                                    className="w-5 h-5 animate-spin text-pink-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                </svg>
                                <p className="text-sm animate-pulse">Loading more...</p>
                            </div>
                        ) : hasNextPage ? (
                            <Button
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                className="bg-pink-600 hover:bg-pink-700 text-white font-medium px-6 py-2 rounded-lg"
                            >
                                Load More
                            </Button>
                        ) : (
                            wishListData.length > 0 && (
                                <p className="text-gray-400 text-xs">No more products</p>
                            )
                        )}
                    </div>


                </TabsContent>

                {/* 🏬 Saved Stores Placeholder */}
                <TabsContent value="saved">
                    {/* 🧭 Supplier Grid */}
                    {isLoadingSupplier ? (
                        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <SupplierSkeleton key={i} />
                            ))}
                        </div>
                    ) : supplierList.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {supplierList.map((s: any) => {
                                const { isOpen, showCloseTime, closeAt, nextOpen, nextDay } =
                                    getStoreStatus(s.supplier.storeTimings);
                                return (
                                    <SupplierCard
                                        key={s._id}
                                        {...{ s: s?.supplier, isOpen, showCloseTime, closeAt, nextOpen, nextDay }}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-12">
                            <Store className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                            <p>No stores saved yet!</p>
                        </div>
                    )}
                    <div ref={loadMoreSupplierRef} className="flex flex-col items-center justify-center py-10 gap-3">
                        {isFetchingNextSupplierPage ? (
                            <div className="flex items-center gap-2 text-gray-500">
                                <svg
                                    className="w-5 h-5 animate-spin text-pink-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                </svg>
                                <p className="text-sm animate-pulse">Loading more...</p>
                            </div>
                        ) : hasNextSupplierPage ? (
                            <Button
                                onClick={() => fetchNextSupplierPage()}
                                disabled={isFetchingNextSupplierPage}
                                className="bg-pink-600 hover:bg-pink-700 text-white font-medium px-6 py-2 rounded-lg"
                            >
                                Load More
                            </Button>
                        ) : (
                            supplierList.length > 0 && (
                                <p className="text-gray-400 text-xs">No more stores</p>
                            )
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </section>
    );
}
