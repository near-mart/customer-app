"use client";

import { calculateDeliveryCharges } from "@/utils/delivery";
import { memo } from "react";

export const BillSummary = memo(({
    supplierTotal,
    originalTotal,
    deliveryConfig,
    tip = 0,
    discountAmount = 0,
    appliedCoupon,
    freeProductCoupon
}: any) => {
    const deliveryData = calculateDeliveryCharges({ supplierTotal, delivery: deliveryConfig, });
    const netItemTotal = Math.max(0, originalTotal - discountAmount);

    const finalPay = netItemTotal + deliveryData.deliveryFee + deliveryData.packingCharge + tip;

    return (
        <div className="mt-4 rounded-xl border bg-white shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border">
                    🧾
                </div>
                <p className="font-semibold text-gray-800">Bill summary</p>
            </div>

            {!deliveryData.isDeliverable ? (
                <div className="px-4 py-4 text-sm text-red-600 font-medium">
                    {deliveryData.message}
                </div>
            ) : (
                <>
                    {/* Rows */}
                    <div className="px-4 py-3 space-y-3 text-sm">

                        {/* Item Total */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Item Total</span>
                            <div className="flex items-center gap-2">
                                {originalTotal !== supplierTotal && (
                                    <span className="text-gray-400 line-through">
                                        ₹{originalTotal}
                                    </span>
                                )}
                                <span className="font-medium text-gray-800">
                                    ₹{supplierTotal}
                                </span>
                            </div>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-green-600">
                                    Coupon Discount ({appliedCoupon?.code})
                                </span>
                                <span className="font-medium text-green-600">
                                    -₹{discountAmount}
                                </span>
                            </div>
                        )}
                        {freeProductCoupon?.product_id && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">
                                    Free Product (Qty {freeProductCoupon.quantity || 1})
                                </span>
                                <span className="font-medium text-green-600">FREE</span>
                            </div>
                        )}

                        {/* Packing Charge */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Packing Charge</span>
                            {deliveryData.packingCharge > 0 ? <span className="font-medium text-gray-800">
                                ₹{deliveryData.packingCharge}
                            </span>
                                : <span className="font-medium text-green-600">FREE</span>
                            }
                        </div>

                        {/* Delivery Fee */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Delivery Fee</span>

                            {deliveryData.isFreeDelivery ? (
                                <div className="flex items-center gap-2">
                                    <span className="line-through text-gray-400">
                                        ₹{deliveryConfig?.flat_charge || 0}
                                    </span>
                                    <span className="font-medium text-green-600">FREE</span>
                                </div>
                            ) : (
                                <span className="font-medium text-gray-800">
                                    ₹{deliveryData.deliveryFee}
                                </span>
                            )}
                        </div>

                        {/* Tip */}
                        {tip > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Delivery Partner Tip</span>
                                <span className="font-medium text-gray-800">₹{tip}</span>
                            </div>
                        )}

                        {/* Distance */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Distance</span>
                            <span>{deliveryData.distanceKm} km</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t mx-4" />

                    {/* To Pay */}
                    <div className="flex justify-between items-center px-4 py-4">
                        <span className="font-semibold text-gray-900">To Pay</span>
                        <span className="text-xl font-bold text-gray-900">
                            ₹{finalPay}
                        </span>
                    </div>

                    {/* Free delivery nudge */}
                    {!deliveryData.isFreeDelivery &&
                        deliveryConfig?.free_delivery_above > supplierTotal && (
                            <div className="px-4 pb-3 text-xs text-gray-500">
                                Add items worth ₹
                                {deliveryConfig.free_delivery_above - supplierTotal} more to get
                                FREE delivery 🚚
                            </div>
                        )}
                </>
            )}
        </div>
    );
})
