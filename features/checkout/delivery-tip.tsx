"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DeliveryTip = ({
    tip,
    setTip,
}: {
    tip: number;
    setTip: (val: number) => void;
}) => {
    const [open, setOpen] = useState(true);
    const [customTip, setCustomTip] = useState("");
    const [showCustom, setShowCustom] = useState(false);

    const tipOptions = [10, 20, 35, 50];

    const handleCustomTip = () => {
        const value = Number(customTip);

        if (!value || value < 1) return;

        setTip(value);
        setCustomTip("");
        setShowCustom(false);
    };

    return (
        <div className="mt-4 rounded-xl border bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div
                onClick={() => setOpen(!open)}
                className="flex items-start justify-between gap-3 px-4 py-4 cursor-pointer"
            >
                <div className="flex items-start gap-3">
                    <div className="text-xl">🧾</div>

                    <div>
                        <p className="font-semibold text-gray-900">Delivery Partner Tip</p>
                        <p className="text-sm text-gray-500">
                            This amount goes to your delivery partner
                        </p>
                    </div>
                </div>

                {open ? (
                    <ChevronUp className="text-gray-600 mt-1" size={18} />
                ) : (
                    <ChevronDown className="text-gray-600 mt-1" size={18} />
                )}
            </div>

            {/* Content */}
            {open && (
                <div className="px-4 pb-4">
                    {/* Tip Options */}
                    <div className="flex gap-3 overflow-x-auto whitespace-nowrap mt-2 pb-2 scrollbar-hide">
                        {tipOptions.map((amount) => (
                            <button
                                key={amount}
                                onClick={() => setTip(amount)}
                                className={`shrink-0 flex items-center gap-2 px-5 py-2 rounded-full border text-sm font-medium transition-all
        ${tip === amount
                                        ? "border-pink-600 bg-pink-50 text-pink-700"
                                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                                    }`}
                            >
                                🪙 ₹{amount}
                            </button>
                        ))}
                    </div>


                    {/* Custom Tip Section */}
                    <div className="mt-4 border rounded-xl px-4 py-2">
                        {!showCustom ? (
                            <button
                                onClick={() => setShowCustom(true)}
                                className="w-full text-center font-semibold text-gray-900 hover:underline"
                            >
                                Add Custom Tip
                            </button>
                        ) : (
                            <>
                                <p className="font-semibold text-gray-900 text-center">
                                    Add Custom Tip
                                </p>

                                <div className="flex gap-2 mt-3">
                                    <input
                                        value={customTip}
                                        onChange={(e) => setCustomTip(e.target.value)}
                                        placeholder="Enter amount"
                                        type="number"
                                        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500"
                                    />

                                    <Button
                                        onClick={handleCustomTip}
                                        className="bg-pink-600 hover:bg-pink-700 text-white rounded-lg"
                                    >
                                        Add
                                    </Button>
                                </div>

                                {/* Cancel */}
                                <button
                                    onClick={() => {
                                        setShowCustom(false);
                                        setCustomTip("");
                                    }}
                                    className="text-xs text-gray-500 font-medium mt-3 w-full text-center hover:underline"
                                >
                                    Cancel
                                </button>
                            </>
                        )}

                        {/* Remove Tip */}
                        {tip > 0 && (
                            <button
                                onClick={() => setTip(0)}
                                className="text-xs text-red-500 font-medium mt-3 w-full text-center hover:underline"
                            >
                                Remove Tip
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
