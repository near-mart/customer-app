"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchSupplier } from "@/services/suppliers";
import { MapPin, Clock } from "lucide-react";

// 🕒 Convert "HH:mm" → "hh:mm AM/PM"
function formatTime(timeStr: string) {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":").map(Number);
    const suffix = hour >= 12 ? "PM" : "AM";
    const adjustedHour = hour % 12 || 12;
    return `${adjustedHour}:${minute.toString().padStart(2, "0")} ${suffix}`;
}

// 🧠 Determine if store is open, and if within 1 hour of closing
function getStoreStatus(storeTimings: any[]) {
    const now = new Date();
    const day = now.toLocaleString("en-US", { weekday: "long" });
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

    const today = storeTimings?.find((d) => d.day === day);
    if (!today || !today.status)
        return { isOpen: false, showCloseTime: false, closeAt: null, nextOpen: null, nextDay: null };

    const currentSlot = today.timing?.find(
        (slot: any) => currentTime >= slot.open && currentTime <= slot.close
    );

    if (currentSlot) {
        // ✅ Store is open
        const closeTime = new Date();
        const [ch, cm] = currentSlot.close.split(":").map(Number);
        closeTime.setHours(ch, cm, 0, 0);

        const diffMinutes = (closeTime.getTime() - now.getTime()) / (1000 * 60);
        const showCloseTime = diffMinutes <= 60; // only within 1 hour

        return {
            isOpen: true,
            showCloseTime,
            closeAt: currentSlot.close,
            nextOpen: null,
            nextDay: null,
        };
    } else {
        // 🔴 Store closed → find next open day
        const daysOfWeek = [
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
        ];
        let nextDayIndex = (daysOfWeek.indexOf(day) + 1) % 7;

        for (let i = 0; i < 7; i++) {
            const nextDay = storeTimings.find(
                (d) => d.day === daysOfWeek[nextDayIndex] && d.status && d.timing?.length
            );
            if (nextDay) {
                const nextOpen = nextDay.timing[0].open;
                return {
                    isOpen: false,
                    showCloseTime: false,
                    closeAt: null,
                    nextOpen,
                    nextDay: nextDay.day,
                };
            }
            nextDayIndex = (nextDayIndex + 1) % 7;
        }
    }

    return { isOpen: false, showCloseTime: false, closeAt: null, nextOpen: null, nextDay: null };
}

export default function Suppliers({ location }) {
    const [total, setTotal] = useState(0)
    const { data: suppliers } = useQuery({
        queryKey: ["fetchSupplier", location],
        queryFn: ({ signal }) =>
            fetchSupplier(signal, { page: 0, page_size: 15, location: JSON.stringify(location) }),
    });

    useEffect(() => {
        if (suppliers?.pagination) {
            setTotal(suppliers?.pagination?.total || 0)
        }
    }, [suppliers])
    const supplierList = suppliers?._payload || [];

    return (
        <section className="px-4 py-8 max-w-7xl mx-auto">
            <h2 className="text-sm md:text-xl font-bold mb-6 text-gray-500">{total} Stores Delivering to You</h2>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {supplierList.map((s: any) => {
                    const { isOpen, showCloseTime, closeAt, nextOpen, nextDay } =
                        getStoreStatus(s.storeTimings);

                    return (
                        <Link
                            key={s._id}
                            href={`/store/${s._id}`}
                            className="group border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-white flex flex-col"
                        >
                            {/* 🖼️ Store Image */}
                            <div className="relative h-44 w-full">
                                <Image
                                    src={s.profile || "/store-placeholder.svg"}
                                    alt={s.storeName || s.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute top-2 left-2 bg-white/80 text-xs px-2 py-1 rounded-full">
                                    {isOpen ? (
                                        <span className="text-green-700 font-medium">🟢 Open</span>
                                    ) : (
                                        <span className="text-red-600 font-medium">🔴 Closed</span>
                                    )}
                                </div>
                            </div>

                            {/* 📋 Store Info */}
                            <div className="p-4 flex flex-col grow">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-semibold text-primary line-clamp-2">
                                        {s.storeName || "Unnamed Store"}
                                    </h3>
                                    <div className="flex items-center gap-1 bg-green-900 px-3 py-1 rounded-full">
                                        <span className="text-white text-xs">New</span>
                                    </div>
                                </div>

                                {/* 🌟 Info Row */}
                                <div className="flex flex-col gap-2 justify-between text-gray-600 text-sm mt-2">
                                    <div className="flex items-center gap-1 flex-nowrap">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{s.distance_km}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        {isOpen ? (
                                            showCloseTime ? (
                                                <span className="text-xs text-amber-600 font-medium">
                                                    Closes at {formatTime(closeAt)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-500">
                                                    Open now
                                                </span>
                                            )
                                        ) : nextOpen ? (
                                            <span className="text-xs">
                                                Opens {nextDay ? `on ${nextDay}` : ""} at{" "}
                                                {formatTime(nextOpen)}
                                            </span>
                                        ) : (
                                            <span>Closed</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}

                {supplierList.length === 0 && (
                    <p className="col-span-full text-center text-gray-500">
                        No stores found near you.
                    </p>
                )}
            </div>
        </section>
    );
}
