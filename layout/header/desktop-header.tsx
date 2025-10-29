"use client";
import React, { useEffect, useState } from "react";
import useLocation from "@/features/home/hooks/useLocation";
import { ArrowIcon, CartIcon, ProfileIcon } from "@/svgs";
import { SearchIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useAuthValidator } from "@/store/authValidater";

export default function DesktopHeader({ searchMode, handleSearch }: any) {
    const { displayAddress } = useLocation();
    const { isAuthenticate } = useAuthValidator((state) => state)
    const { suppliers } = useCartStore(); // 🧺 supplier-wise cart
    // 🧮 Compute totals across all suppliers
    const allItems = Object.values(suppliers).flatMap((s) => s.items);
    const totalQty = allItems.reduce((sum, item) => sum + item.qty, 0);


    return (
        <div className="hidden lg:flex flex-wrap items-center gap-3 p-4 lg:gap-6 lg:px-16 relative">
            {/* --- Logo --- */}
            <Link aria-label="Near Mart Home" href="/" className="shrink-0">
                <Image
                    alt="Near Mart Logo"
                    fetchPriority="low"
                    loading="lazy"
                    width={160}
                    height={40}
                    decoding="async"
                    className="relative overflow-hidden inline-block object-contain w-[160px]"
                    src="/primary.svg"
                />
            </Link>

            {/* --- Delivery Info --- */}
            <div className="flex flex-col justify-center max-w-[60%] sm:max-w-none">
                <h2 className="flex items-center" data-testid="delivery-time">
                    <ArrowIcon className="w-6 h-6" />
                    <span className="ml-1 font-bold text-[#ef4372] text-base sm:text-lg">
                        Tomorrow —{" "}
                        <span className="font-bold text-[#ef4372]">
                            Estimated delivery before 12
                        </span>
                    </span>
                </h2>

                <button
                    type="button"
                    className="flex items-center text-ellipsis overflow-hidden whitespace-nowrap"
                >
                    <h3 className="text-sm sm:text-base font-semibold text-black truncate max-w-[400px]">
                        <span>{displayAddress}</span>
                    </h3>
                    <svg
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-1 w-4 h-4 text-black"
                    >
                        <path
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        ></path>
                    </svg>
                </button>
            </div>

            {/* --- Search --- */}
            <div className="flex-1 min-w-[300px] mt-0">
                {!searchMode ? (
                    <Link href={"/search"}>
                        <button
                            aria-label="Search for products"
                            className="relative flex items-center gap-x-4 rounded-lg border bg-white px-4 py-3 w-full"
                        >
                            <SearchIcon className="w-5 h-5" />
                            <span className="flex flex-1 items-center gap-x-1 text-md text-gray-700 truncate">
                                <span>Search for</span>
                                <ul className="relative flex-1 h-[18px] sm:h-5 overflow-hidden">
                                    {[
                                        "kurkure",
                                        "apple juice",
                                        "cheese slices",
                                        "chocolate box",
                                        "amul butter",
                                        "banana",
                                    ].map((item, i) => (
                                        <li
                                            key={item}
                                            className="absolute animate-search-items opacity-0"
                                            style={{
                                                animationDelay: `${i * 3}s`,
                                                animationDuration: "18s",
                                            }}
                                        >
                                            "{item}"
                                        </li>
                                    ))}
                                </ul>
                            </span>
                        </button>
                    </Link>
                ) : (
                    <div className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3 w-full">
                        <SearchIcon className="w-5 h-5 text-gray-600" />
                        <input
                            type="text"
                            autoFocus
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search for products..."
                            className="flex-1 outline-none text-base text-black placeholder-gray-500"
                        />
                    </div>
                )}
            </div>

            {/* --- Profile + Cart --- */}
            <div className="flex items-center gap-4 ml-auto relative">
                <Link
                    aria-label={isAuthenticate ? "profile" : "login / register"}
                    href={isAuthenticate ? "/account" : "/login"}
                    className="flex flex-col items-center"
                >
                    <ProfileIcon className="w-6 h-6" />
                    <span className="text-sm text-black capitalize">
                        {
                            isAuthenticate ? "profile" : "login / register"
                        }
                    </span>
                </Link>

                {/* 🛒 Cart */}
                <div className="relative">
                    <Link
                        href={"/cart"}
                        aria-label={"cart"}
                    >
                        <button
                            aria-label="Cart"
                            className="relative flex flex-col items-center gap-y-1 cursor-pointer"
                            data-testid="cart-btn"
                        >
                            <CartIcon className="w-6 h-6" />
                            {totalQty > 0 && (
                                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full px-1.5">
                                    {totalQty}
                                </span>
                            )}
                            <span className="text-sm text-black">Cart</span>
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
