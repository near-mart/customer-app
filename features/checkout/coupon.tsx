import { Button } from "@/components/ui/button";
import React, { memo } from "react";

export const Coupon = memo(
    ({ supplier, supplierTotal, appliedCoupon, onApply, onRemove }: any) => {
        if (!supplier?.bestCoupon?.length) return null;

        const coupon = [...supplier.bestCoupon].sort(
            (a, b) => a.minOrderValue - b.minOrderValue
        )[0];

        const remaining = Math.max(0, coupon.minOrderValue - supplierTotal);
        const isEligible = supplierTotal >= coupon.minOrderValue;
        const isApplied = appliedCoupon?.code === coupon.code;

        const offerText =
            coupon.type === "flat"
                ? `Get extra ₹${coupon.value} OFF`
                : coupon.type === "percentage"
                    ? `Get extra ${coupon.value}% OFF`
                    : "Get FREE product offer";

        return (
            <div className="mt-4 mb-2 rounded-xl border bg-white shadow-sm overflow-hidden">

                {/* 🟡 Min Order Warning */}
                {!isEligible && !isApplied && (
                    <div className="flex items-center gap-2 bg-yellow-100 px-4 py-3 text-sm text-yellow-800">
                        <span>⚠️</span>
                        <span>
                            Add items worth <b>₹{remaining}</b> more to apply
                        </span>
                    </div>
                )}

                {/* 🎟 Coupon Card */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4">

                    {/* Left Content */}
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold">
                            %
                        </div>

                        <div>
                            <p className="font-semibold text-gray-800">{offerText}</p>

                            <p className="text-sm text-gray-500">
                                Code: <span className="font-medium">{coupon.code}</span>
                            </p>

                            {isApplied && (
                                <p className="text-xs text-green-600 font-medium mt-1">
                                    Coupon Applied ✅
                                </p>
                            )}

                            {isApplied && coupon.type === "free_product" && (
                                <p className="text-xs text-green-600 font-medium mt-1">
                                    🎁 Free product will be added to your order
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="w-full sm:w-auto">
                        {!isApplied ? (
                            <Button
                                size="sm"
                                disabled={!isEligible}
                                className={`w-full sm:w-auto rounded-lg px-4 ${isEligible
                                        ? "bg-pink-600 hover:bg-pink-700 text-white"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    }`}
                                onClick={() => onApply(coupon)}
                            >
                                Apply
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                className="w-full sm:w-auto rounded-lg px-4 bg-red-100 text-red-600 hover:bg-red-200"
                                onClick={onRemove}
                            >
                                Remove
                            </Button>
                        )}
                    </div>
                </div>

                {/* 👀 View All Coupons */}
                <div className="border-t px-4 py-3 text-center">
                    <button className="text-sm font-medium text-gray-700 hover:underline">
                        View all coupons →
                    </button>
                </div>
            </div>
        );
    }
);
