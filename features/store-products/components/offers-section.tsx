"use client"
import { useState } from "react"
import Image from "next/image"
import { Tag, ChevronDown, ChevronUp } from "lucide-react"

export default function OffersSection({ supplier }: any) {
    const [showOffers, setShowOffers] = useState(false)

    if (!supplier?.bestCoupon?.length) return null

    return (
        <div className="mb-6">
            {/* 🏷️ Header */}
            <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-sm sm:text-base md:text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Tag className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Active Offers
                </h2>

                {/* 📱 Toggle for mobile */}
                <button
                    onClick={() => setShowOffers(!showOffers)}
                    className="lg:hidden text-xs sm:text-sm text-primary font-medium flex items-center gap-1 cursor-pointer"
                >
                    {showOffers ? (
                        <>
                            Hide Offers <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        </>
                    ) : (
                        <>
                            View Offers <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                        </>
                    )}
                </button>
            </div>

            {/* 💫 Offer Cards Container */}
            <div
                className={`
                    overflow-hidden transition-all duration-500 ease-in-out
                    ${showOffers
                        ? "max-h-[1200px] opacity-100"
                        : "max-h-0 opacity-0 lg:max-h-none lg:opacity-100"
                    }
                `}
            >
                <div
                    className="
                        flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar
                        sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
                        scroll-smooth py-2
                    "
                >
                    {supplier.bestCoupon.map((coupon: any) => (
                        <div
                            key={coupon._id}
                            className="
                                flex-shrink-0 sm:flex-shrink-0 min-w-[200px] sm:min-w-[240px]
                                bg-white border border-dashed border-primary/30
                                rounded-2xl shadow-sm hover:shadow-md transition duration-300
                                relative overflow-hidden
                            "
                        >
                            {/* 🎟️ Ticket Notches */}
                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-gray-50 border border-primary/30 rounded-full"></div>
                            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-gray-50 border border-primary/30 rounded-full"></div>

                            {/* 🎯 Header */}
                            <div className="bg-gradient-to-r from-primary/10 to-blue-50 px-3 md:px-4 py-1.5 md:py-2 border-b border-primary/20 flex items-center justify-between">
                                <h3 className="font-semibold text-primary text-xs sm:text-sm line-clamp-1">
                                    {coupon.title || "Special Offer"}
                                </h3>
                                <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium bg-white/60 rounded-full px-2 py-[1px]">
                                    {coupon.code}
                                </span>
                            </div>

                            {/* 🎁 Content */}
                            <div className="p-3 md:p-4">
                                {coupon.type === "free_product" ? (
                                    <div className="flex items-center gap-2.5 md:gap-3">
                                        {/* Product Image */}
                                        <div className="w-12 h-12 md:w-14 md:h-14 relative flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
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
                                            <p className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-1">
                                                {coupon.freeProduct?.product?.name || "Free Product"}
                                            </p>

                                            {coupon.freeProduct?.variant && (
                                                <p className="text-[10px] sm:text-xs text-gray-600">
                                                    {coupon.freeProduct.variant.selling_qty}{" "}
                                                    {coupon.freeProduct.variant.unit}
                                                </p>
                                            )}

                                            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                                                🎁 Free item on ₹{coupon.minOrderValue}+
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-start">
                                        <p className="text-base md:text-lg font-bold text-primary">
                                            ₹{coupon.value} OFF
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-700">
                                            On orders above ₹{coupon.minOrderValue}
                                        </p>
                                    </div>
                                )}

                                {/* 📅 Validity */}
                                <div className="mt-2 md:mt-3 text-[10px] sm:text-xs text-gray-500 border-t border-dashed border-gray-200 pt-2 flex justify-between items-center">
                                    <span>
                                        Valid till{" "}
                                        {new Date(coupon.endDate).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                        })}
                                    </span>
                                    <span className="text-[10px] sm:text-[12px] font-medium text-green-600">
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
