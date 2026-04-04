"use client";
import React, { useState, useEffect, useRef, useMemo, memo } from "react";
import useLocation from "@/features/home/hooks/useLocation";
import { ArrowIcon, CartIcon, ProfileIcon } from "@/svgs";
import { SearchIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useAuthValidator } from "@/store/authValidater";
import { getWorkContext } from "./desktop-header";
import { useModalControl } from "@/hooks/useModalControl";
import { LocationModal } from "./model/location-modal";

const MobileHeader = ({ searchMode, handleSearch }: any) => {
    const { isAuthenticate } = useAuthValidator((state) => state)
    const { displayAddress } = useLocation();
    const { suppliers } = useCartStore(); // ✅ supplier-wise cart
    const totalQty = useMemo(() => {
        return Object.values(suppliers)
            .flatMap((s: any) => s.items || [])
            .reduce((sum, item) => sum + (item.qty || 0), 0);
    }, [suppliers]);

    const { open, handleCloseModal, handleOpenModal } = useModalControl()

    return (
        <div className="flex flex-col p-4 lg:hidden pb-0 relative">
            {/* --- Header Row --- */}
            {open && <LocationModal open={open} setOpen={handleCloseModal} />}
            <div className="flex justify-between items-center w-full">
                {/* 🏪 Logo */}
                <Link aria-label="Near Mart Home" href="/" className="shrink-0">
                    <Image
                        alt="Near Mart Logo"
                        fetchPriority="low"
                        loading="lazy"
                        width={120}
                        height={40}
                        decoding="async"
                        className="relative overflow-hidden inline-block object-contain md:w-[120px] w-[150px]"
                        src="/primary.svg"
                    />
                </Link>

                {/* 👤 Profile + 🛒 Cart */}
                <div className="flex items-center gap-4 relative">
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

                    {/* 🛒 Cart Section */}
                    <div className="relative" >
                        <Link
                            href={"/cart"}
                            aria-label={"cart"}
                        >
                            <button
                                aria-label="Cart"
                                className="relative flex flex-col items-center gap-y-1"
                                data-testid="cart-btn"
                            >
                                <CartIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                {totalQty > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full px-1.5">
                                        {totalQty}
                                    </span>
                                )}
                                <span className="text-xs sm:text-sm text-black">Cart</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* --- Delivery Info --- */}
            <div className="flex flex-col mt-2 cursor-default" onClick={handleOpenModal}>
                <h2 className="flex items-center" data-testid="delivery-time">
                    <ArrowIcon className="w-6 h-6" />
                    <span className="ml-1 font-bold text-[#ef4372] text-sm md:text-base flex flex-wrap items-center gap-x-1">
                        {getWorkContext()}
                    </span>
                </h2>

                <button
                    type="button"
                    className="flex items-center text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                >
                    <h3 className="text-sm md:text-sm font-semibold text-black truncate max-w-full">
                        {displayAddress}
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
                        />
                    </svg>
                </button>
            </div>

            {/* --- Search Section --- */}
            <div className="mt-2">
                {!searchMode ? (
                    <Link href={"/search"}>
                        <button
                            aria-label="Search for products"
                            className="relative flex items-center gap-x-2 rounded-lg border bg-white px-3 py-2 w-full"
                        >
                            <SearchIcon className="w-4 h-4" />
                            <span className="flex flex-1 items-center gap-x-1 text-sm text-gray-700 truncate">
                                <span data-testid="searchBar">Search for</span>
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
                    <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 w-full">
                        <SearchIcon className="w-5 h-5 text-gray-600" />
                        <input
                            type="text"
                            autoFocus
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search for products..."
                            className="flex-1 outline-none text-sm text-black placeholder-gray-500"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}


export default memo(MobileHeader)