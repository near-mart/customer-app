"use client";
import MobileHeader from "./mobile-header";
import DesktopHeader from "./desktop-header";

export default function Header({ noTabs = true }) {

    return (
        <header
            className="fixed top-0 z-20 w-full backdrop-blur-md bg-white/90 border-b border-gray-200 pb-2"
            style={{
                background: "linear-gradient(#33289e6b, rgb(255, 255, 255))",
            }}
        >
            {/* ---------------- MOBILE VIEW ---------------- */}
            <MobileHeader />

            {/* ---------------- DESKTOP VIEW ---------------- */}
            <DesktopHeader />

        </header>
    );
}
