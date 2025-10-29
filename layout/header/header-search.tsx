"use client";
import { useState } from "react";
import Image from "next/image";
import MobileHeader from "./mobile-header";
import DesktopHeader from "./desktop-header";

export default function HeaderSearch({ setQuery, query, handleSearch }) {


    return (
        <header
            className="fixed top-0 z-102 w-full backdrop-blur-md bg-white/90 border-b border-gray-200 pb-2"
            style={{
                background: "linear-gradient(#33289e6b, rgb(255, 255, 255))",
            }}
        >
            {/* ---------------- MOBILE VIEW ---------------- */}
            <MobileHeader searchMode={true} {...{ handleSearch }} />

            {/* ---------------- DESKTOP VIEW ---------------- */}
            <DesktopHeader searchMode={true} {...{ handleSearch }} />

        </header>
    );
}
