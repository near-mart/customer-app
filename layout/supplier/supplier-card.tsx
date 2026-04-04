"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { MapPin, Clock, Navigation, Bookmark, Tag, Loader2 } from "lucide-react";
import { formatTime } from "@/functions/supplier";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { useAuthValidator } from "@/store/authValidater";
import { supplierBookMark } from "@/services/suppliers";

export default function SupplierCard({ s, isOpen, showCloseTime, closeAt, nextOpen, nextDay }: any) {
    const { isAuthenticate } = useAuthValidator((state) => state);
    const { addBookmark, removeBookmark, isBookmarked } = useBookmarkStore();
    const localIsBookmarked = isBookmarked(s._id);
    const [bookmarked, setBookmarked] = useState(isAuthenticate ? s.isBookmarked : localIsBookmarked);
    const [loading, setLoading] = useState(false);
    const [activeCoupon, setActiveCoupon] = useState(0);
    useEffect(() => {
        if (!isAuthenticate) setBookmarked(localIsBookmarked);
    }, [localIsBookmarked, isAuthenticate]);
    useEffect(() => {
        if (!s.bestCoupon?.length) return;
        const interval = setInterval(() => {
            setActiveCoupon((prev) => (prev + 1) % s.bestCoupon.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [s.bestCoupon]);

    const handleToggleBookmark = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (loading) return;
        setLoading(true);
        try {
            if (isAuthenticate) {
                const res = await supplierBookMark({ supplier_id: s._id });
                if (res?._payload?.status) {
                    // ✅ Added
                    addBookmark(s._id);
                    setBookmarked(true);
                } else {
                    removeBookmark(s._id);
                    setBookmarked(false);
                }
            } else {
                // 🧠 Guest (local only)
                if (localIsBookmarked) {
                    removeBookmark(s._id);
                    setBookmarked(false);
                } else {
                    addBookmark(s._id);
                    setBookmarked(true);
                }
            }
        } catch (err) {
            console.error("Bookmark toggle failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Link
            key={s._id}
            href={`/store/${s.handle}`}
            className="group border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col"
        >
            <div className="relative h-44 w-full">
                <Image
                    src={s.profile || "/store-placeholder.svg"}
                    alt={s.storeName || s.name || "supplier"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                />

                {/* 🟢 Open/Closed */}
                <div className="absolute top-2 left-2 bg-white/80 text-xs px-2 py-1 rounded-full">
                    {isOpen ? (
                        <span className="text-green-700 font-medium">🟢 Open</span>
                    ) : (
                        <span className="text-red-600 font-medium">🔴 Closed</span>
                    )}
                </div>

                {/* 🔖 Bookmark */}
                <div
                    onClick={handleToggleBookmark}
                    className={`absolute top-2 right-2 bg-white/80 text-xs px-1 py-1 rounded-full cursor-pointer transition ${bookmarked ? "text-primary" : "text-gray-400"
                        }`}
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                        <Bookmark
                            className={`w-4 h-4 ${bookmarked ? "fill-red-500 text-red-500" : "text-black"
                                }`}
                        />
                    )}
                </div>

                {/* 🎟️ Coupons */}
                {s.bestCoupon?.length > 0 && (
                    <div className="absolute bottom-0 left-0 w-full bg-black/20 backdrop-blur-sm text-white text-xs py-1 px-3 overflow-hidden">
                        <div
                            key={s.bestCoupon[activeCoupon]._id}
                            className="flex items-center justify-center gap-1 bg-white/15 border border-white/20 rounded-full px-3 py-1 animate-fade-in"
                        >
                            <Tag className="w-3 h-3 text-yellow-300" />
                            <span className="whitespace-nowrap">
                                {s.bestCoupon[activeCoupon].type === "free_product"
                                    ? `Free Item on ₹${s.bestCoupon[activeCoupon].minOrderValue}+`
                                    : `${s.bestCoupon[activeCoupon].title || s.bestCoupon[activeCoupon].code
                                    } - ₹${s.bestCoupon[activeCoupon].value} OFF`}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* 📋 Supplier Info */}
            <div className="p-4 flex flex-col grow">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-primary line-clamp-2">
                        {s.storeName || "Unnamed Store"}
                    </h3>
                    <div className="flex items-center gap-1 bg-green-900 px-3 py-1 rounded-full">
                        <span className="text-white text-xs">New</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2 justify-between text-gray-600 text-sm mt-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            {s.distance_km != undefined && <MapPin className="w-4 h-4 text-gray-400" />}
                            <span>{s.distance_km}</span>
                        </div>

                        {s?.address?.place_id && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `https://www.google.com/maps/place/?q=place_id:${s?.address.place_id}`;
                                }}
                                className="p-1 hover:bg-gray-100 rounded-full transition"
                                title="Navigate on Google Maps"
                            >
                                <Navigation className="w-4 h-4 text-primary" />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {isOpen ? (
                            showCloseTime ? (
                                <span className="text-xs text-amber-600 font-medium">
                                    Closes at {formatTime(closeAt)}
                                </span>
                            ) : (
                                <span className="text-xs text-gray-500">Open now</span>
                            )
                        ) : nextOpen ? (
                            <span className="text-xs">
                                Opens {nextDay ? `on ${nextDay}` : ""} at {formatTime(nextOpen)}
                            </span>
                        ) : (
                            <span>Closed</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
