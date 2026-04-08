"use client";
import { fetchSupplier } from "@/services/suppliers";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, Tag, Link, ChevronRight } from "lucide-react";

export default function StoreInfoPage({ handle }) {
    const { data: suppliers, isLoading } = useQuery({
        queryKey: ["fetchSupplier", handle],
        queryFn: ({ signal }) =>
            fetchSupplier(signal, { page: 0, page_size: 15, handle }),
        enabled: !!handle,
    });

    const shimmer = "bg-gray-200 animate-pulse rounded-lg";

    if (isLoading)
        return (
            <section className="min-h-screen py-10 px-4 md:px-10 flex justify-center">
                <div className="max-w-3xl w-full bg-white/80 backdrop-blur-md rounded-3xl shadow-md border border-gray-100 overflow-hidden">
                    {/* 🌆 Banner Skeleton */}
                    <div className={`h-60 w-full ${shimmer}`}></div>

                    <div className="p-6 md:p-10 space-y-6">
                        {/* 🏪 Store Header Skeleton */}
                        <div className="flex flex-col gap-3">
                            <div className={`h-6 w-1/2 ${shimmer}`}></div>
                            <div className={`h-4 w-1/3 ${shimmer}`}></div>
                        </div>

                        {/* 📞 Contact Skeleton */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-3">
                                <div className={`h-4 w-2/3 ${shimmer}`}></div>
                                <div className={`h-4 w-1/2 ${shimmer}`}></div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className={`h-4 w-4/5 ${shimmer}`}></div>
                                <div className={`h-4 w-3/4 ${shimmer}`}></div>
                                <div className={`h-3 w-2/3 ${shimmer}`}></div>
                            </div>
                        </div>

                        {/* 🕒 Timings Skeleton */}
                        <div className="space-y-3">
                            <div className={`h-5 w-40 ${shimmer}`}></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-8 ${shimmer}`}
                                    ></div>
                                ))}
                            </div>
                        </div>

                        {/* 🎟️ Coupons Skeleton */}
                        <div className="space-y-3">
                            <div className={`h-5 w-36 ${shimmer}`}></div>
                            <div className="flex flex-wrap gap-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-20 w-40 ${shimmer}`}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );

    const supplier = suppliers?._payload?.[0];
    if (!supplier)
        return (
            <div className="text-center py-20 text-gray-500">
                Store not found or unavailable.
            </div>
        );

    // 🕒 Convert "HH:mm" → "hh:mm AM/PM"
    const formatTo12Hour = (timeStr: string) => {
        if (!timeStr) return "";
        const [hour, minute] = timeStr.split(":").map(Number);
        const suffix = hour >= 12 ? "PM" : "AM";
        const adjustedHour = hour % 12 || 12;
        return `${adjustedHour}:${minute.toString().padStart(2, "0")} ${suffix}`;
    };

    return (
        <section className="min-h-screen">
            <div className="md:max-w-3xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                {/* 🌆 Banner */}
                <div className="relative h-70 w-full">
                    <Image
                        src={supplier.profile || "/store-placeholder.svg"}
                        alt={supplier.storeName}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent"></div>

                    {/* Store name overlay */}
                    <div className="absolute bottom-4 left-6 text-white">
                        <h1 className="text-3xl font-bold">
                            {supplier.storeName}
                        </h1>
                        <p className="text-sm text-gray-200">
                            Owned by {supplier.name}
                        </p>
                    </div>
                </div>

                {/* 🏪 Store details */}
                <div className="px-4 py-4">
                    {/* 📞 Contact + Address */}
                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Phone className="w-5 h-5 text-primary" />
                                <span className="font-medium">
                                    +{supplier.countryCode} {supplier.mobile}
                                </span>
                            </div>
                            {supplier.email && (
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Mail className="w-5 h-5 text-primary" />
                                    <span>{supplier.email}</span>
                                </div>
                            )}
                        </div>

                        {supplier.address && (
                            <div className="flex items-start gap-2 text-gray-700">
                                <MapPin className="w-5 h-5 text-primary mt-[2px]" />
                                <div>
                                    <p className="font-medium">{supplier.address.address}</p>
                                    <p className="text-sm text-gray-500">
                                        {supplier.address.city}, {supplier.address.state}{" "}
                                        {supplier.address.zip}
                                    </p>
                                    <a
                                        href={`https://www.google.com/maps/place/?q=place_id:${supplier.address.place_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary text-sm font-medium hover:underline"
                                    >
                                        View on Google Maps
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 🕓 Timings Section */}
                    <div className="mb-10">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" /> Operating Hours
                        </h2>

                        {/* ✅ Responsive grid for all breakpoints */}
                        <div
                            className="
      bg-gray-50 rounded-xl border border-gray-100 p-4
      grid gap-3 text-sm
      grid-cols-1           /* 1 col on mobile */
      sm:grid-cols-2        /* 2 cols on small screens */
      md:grid-cols-2        /* 3 cols on tablets */
      lg:grid-cols-3        /* 4 cols on desktop */
    "
                        >
                            {supplier.storeTimings.map((day) => (
                                <div
                                    key={day.day}
                                    className="flex justify-between px-2 py-2 rounded-md hover:bg-white hover:shadow-sm transition"
                                >
                                    <span className="font-medium text-gray-800">{day.day}: </span>
                                    {day.status && day.timing?.length > 0 ? (
                                        <span className="text-gray-600 whitespace-nowrap">
                                            {formatTo12Hour(day.timing[0].open)} – {formatTo12Hour(day.timing[0].close)}
                                        </span>
                                    ) : (
                                        <span className="text-red-500">Closed</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>


                    {supplier?.bestCoupon?.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Tag className="w-5 h-5 text-primary" /> Active Offers
                            </h2>

                            <div
                                className="
                          flex gap-4 overflow-x-auto no-scrollbar
                          sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2
                          scroll-smooth py-2
                        "
                            >
                                {supplier.bestCoupon.map((coupon) => (
                                    <div
                                        key={coupon._id}
                                        className="
                              flex-shrink-0 sm:flex-shrink-0 min-w-[250px]
                              bg-white border border-dashed border-primary/30
                              rounded-2xl shadow-sm hover:shadow-md transition duration-300
                              relative overflow-hidden
                            "
                                    >
                                        {/* 🎟️ Ticket Notch Decoration */}
                                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 border border-primary/30 rounded-full"></div>
                                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 border border-primary/30 rounded-full"></div>

                                        {/* 🎯 Coupon Header */}
                                        <div className="bg-gradient-to-r from-primary/10 to-blue-50 px-4 py-2 border-b border-primary/20 flex items-center justify-between">
                                            <h3 className="font-semibold text-primary text-sm line-clamp-1">
                                                {coupon.title || "Special Offer"}
                                            </h3>
                                            <span className="text-[10px] text-gray-500 font-medium bg-white/60 rounded-full px-2 py-[2px]">
                                                {coupon.code}
                                            </span>
                                        </div>

                                        {/* 🎁 Coupon Content */}
                                        <div className="p-4">
                                            {coupon.type === "free_product" ? (
                                                <div className="flex items-center gap-3">
                                                    {/* Product Image */}
                                                    <div className="w-14 h-14 relative flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                                                        <Image
                                                            src={
                                                                coupon.freeProduct?.product?.images?.[0]?.url ||
                                                                "/product-placeholder.svg"
                                                            }
                                                            alt={coupon.freeProduct?.product?.name || "Free Product"}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex flex-col">
                                                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                                                            {coupon.freeProduct?.product?.name || "Free Product"}
                                                        </p>

                                                        {coupon.freeProduct?.variant && (
                                                            <p className="text-xs text-gray-600">
                                                                {coupon.freeProduct.variant.selling_qty}{" "}
                                                                {coupon.freeProduct.variant.unit}
                                                            </p>
                                                        )}

                                                        <p className="text-xs text-gray-500 mt-1">
                                                            🎁 Get free item on ₹{coupon.minOrderValue}+
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-start">
                                                    <p className="text-lg font-bold text-primary">
                                                        ₹{coupon.value} OFF
                                                    </p>
                                                    <p className="text-sm text-gray-700">
                                                        On orders above ₹{coupon.minOrderValue}
                                                    </p>
                                                </div>
                                            )}

                                            {/* 📅 Validity */}
                                            <div className="mt-3 text-xs text-gray-500 border-t border-dashed border-gray-200 pt-2 flex justify-between items-center">
                                                <span>
                                                    Valid till{" "}
                                                    {new Date(coupon.endDate).toLocaleDateString("en-IN", {
                                                        day: "numeric",
                                                        month: "short",
                                                    })}
                                                </span>
                                                <span className="text-[12px] font-medium text-green-600">
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
