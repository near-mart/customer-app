"use client";
import { useState } from "react";
import Image from "next/image";
import MobileHeader from "./mobile-header";
import DesktopHeader from "./desktop-header";

export default function Header({ noTabs = true }) {
    const categories = [
        {
            name: "All",
            img: "https://cdn.zeptonow.com/production/inventory/banner/96bb6a90-8919-4fee-8094-2a18409e6573.png",
        },
        {
            name: "Fresh",
            img: "https://cdn.zeptonow.com/production/inventory/banner/8e8a58b9-f2d7-46fb-9634-930b016499fa.png",
        }
    ];

    // ✅ Default selected category = "All"
    const [active, setActive] = useState("All");

    return (
        <header
            className="fixed top-0 z-102 w-full backdrop-blur-md bg-white/90 border-b border-gray-200"
            style={{
                background: "linear-gradient(#33289e6b, rgb(255, 255, 255))",
            }}
        >
            {/* ---------------- MOBILE VIEW ---------------- */}
            <MobileHeader />

            {/* ---------------- DESKTOP VIEW ---------------- */}
            <DesktopHeader />

            {/* ---------------- CATEGORY SCROLL ---------------- */}
            {noTabs && <div className="max-w-7xl mx-auto px-4 py-3 overflow-x-auto scrollbar-hide">
                <div className="flex gap-5 min-w-max">
                    {categories.map((cat, index) => {
                        const isActive = cat.name === active;
                        return (
                            <button
                                key={index}
                                onClick={() => setActive(cat.name)}
                                className={`flex gap-2 items-center text-sm font-medium shrink-0 pb-1 transition-all border-b-2 ${isActive
                                    ? "text-primary border-primary"
                                    : "text-gray-700 border-transparent hover:border-gray-300"
                                    } cursor-pointer`}
                            >
                                <div
                                    className={`relative w-6 md:w-7 h-6 md:h-7 rounded-full overflow-hidden`}
                                >
                                    <Image
                                        src={cat.img}
                                        alt={cat.name}
                                        fill
                                        className="object-contain"
                                        sizes="(max-width:768px) 50vw, (max-width:1200px) 25vw, 100px"
                                    />
                                </div>
                                <span
                                    className={`text-xs md:text-lg ${isActive ? "text-primary" : "text-gray-700"
                                        }`}
                                >
                                    {cat.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>}
        </header>
    );
}
