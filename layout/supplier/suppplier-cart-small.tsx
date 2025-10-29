"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { MapPin, Clock, Navigation, Bookmark, Tag } from "lucide-react";
import { formatTime } from "@/functions/supplier";
import { useBookmarkStore } from "@/store/bookmarkStore";

export default function SupplierCardSmall({ s, isOpen, showCloseTime, closeAt, nextOpen, nextDay }) {
    const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);
    const isBookmarked = useBookmarkStore((state) => state.isBookmarked(s._id));
    const [activeCoupon, setActiveCoupon] = useState(0);

    // 🎟️ Auto-cycle coupons every 3s
    useEffect(() => {
        if (!s.bestCoupon?.length) return;
        const interval = setInterval(() => {
            setActiveCoupon((prev) => (prev + 1) % s.bestCoupon.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [s.bestCoupon]);

    return (
        <Link
            href={`/store/${s.handle}`}
            key={s._id}
            className="group border rounded-xl bg-white hover:shadow-md transition flex flex-col overflow-hidden"
        >
            {/* 🖼️ Store Image */}
            <div className="relative w-full aspect-4/3">
                <Image
                    src={s.profile || "/store-placeholder.svg"}
                    alt={s.storeName || "Store"}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* 🟢 Open/Closed */}
                <div className="absolute top-1 left-1 bg-white/80 text-[10px] px-2 py-[1px] rounded-full font-medium">
                    {isOpen ? "🟢 Open" : "🔴 Closed"}
                </div>

                {/* 🔖 Bookmark */}
                <div
                    className={`absolute top-1 right-1 bg-white/80 p-[3px] rounded-full cursor-pointer transition ${isBookmarked ? "text-primary" : "text-gray-400"
                        }`}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleBookmark(s._id);
                    }}
                >
                    <Bookmark
                        className={`w-3.5 h-3.5 ${isBookmarked ? "fill-red-500 text-red-500" : "text-black"
                            }`}
                    />
                </div>

                {/* 🎟️ Active Coupon (Auto Switch) */}
                {s.bestCoupon?.length > 0 && (
                    <div className="absolute bottom-1 left-1 right-1 mx-auto w-fit bg-black/30 backdrop-blur-sm text-white text-[10px] px-2 py-[2px] rounded-full flex items-center gap-1 border border-white/20 animate-fade-in">
                        <Tag className="w-3 h-3 text-yellow-300" />
                        <span className="truncate max-w-[120px]">
                            {s.bestCoupon[activeCoupon].type === "free_product"
                                ? `Free Item on ₹${s.bestCoupon[activeCoupon].minOrderValue}+`
                                : `${s.bestCoupon[activeCoupon].title || s.bestCoupon[activeCoupon].code} - ₹${s.bestCoupon[activeCoupon].value} OFF`}
                        </span>
                    </div>
                )}
            </div>

            {/* 📋 Info Section */}
            <div className="p-2 flex flex-col gap-1 flex-grow">
                {/* 🏪 Store Name + New Badge */}
                <div className="flex justify-between items-start">
                    <h3 className="text-[13px] font-semibold text-primary line-clamp-1">
                        {s.storeName || "Unnamed Store"}
                    </h3>
                    <div className="bg-green-900 text-white text-[9px] px-2 py-[1px] rounded-full">
                        New
                    </div>
                </div>

                {/* 📍 Location & Navigation */}
                <div className="flex items-center justify-between text-[11px] text-gray-600">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{s.distance_km || "—"}</span>
                    </div>

                    {s?.address?.place_id && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `https://www.google.com/maps/place/?q=place_id:${s?.address.place_id}`;
                            }}
                            className="p-[2px] hover:bg-gray-100 rounded-full transition"
                            title="Navigate on Google Maps"
                        >
                            <Navigation className="w-3.5 h-3.5 text-primary" />
                        </div>
                    )}
                </div>

                {/* ⏰ Timings */}
                <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-[2px]">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {isOpen ? (
                        showCloseTime ? (
                            <span className="text-amber-600 font-medium">
                                Closes at {formatTime(closeAt)}
                            </span>
                        ) : (
                            <span>Open now</span>
                        )
                    ) : nextOpen ? (
                        <span>
                            Opens {nextDay ? `on ${nextDay}` : ""} at {formatTime(nextOpen)}
                        </span>
                    ) : (
                        <span>Closed</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
