"use client";

import { Button } from "@/components/ui/button";
import {
    User,
    ShoppingBag,
    Headphones,
    MapPin,
    Gift,
    LogOut,
    ChevronRight,
    Heart,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();

    const items = [
        { icon: <ShoppingBag size={18} />, label: "Orders", href: "/account/orders" },
        { icon: <Headphones size={18} />, label: "Customer Support", href: "/account/support" },
        { icon: <Gift size={18} />, label: "Manage Referrals", href: "/account/referrals" },
        { icon: <MapPin size={18} />, label: "Addresses", href: "/account/addresses" },
        { icon: <User size={18} />, label: "Profile", href: "/account/profile" },
        { icon: <Heart size={18} />, label: "WishList", href: "/account/wish-list" },
    ];

    return (
        <div className="flex flex-col flex-1">
            {/* Profile */}
            <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                    <User className="text-purple-700" size={22} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 text-base">Tushar Gola</h3>
                    <p className="text-sm text-gray-500">9457619778</p>
                </div>
            </div>

            {/* Gift Card */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-5">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="flex items-center gap-2 text-sm font-semibold text-purple-800">
                            <Gift size={15} />
                            Zepto Cash & Gift Card
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Available Balance: ₹0</p>
                    </div>
                    <Button
                        size="sm"
                        className="text-xs bg-black hover:bg-gray-800 text-white rounded-md px-3"
                    >
                        Add Balance
                    </Button>
                </div>
            </div>

            {/* Menu List */}
            <nav className="space-y-1 flex-1">
                {items.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center justify-between px-2 py-3 border-b border-gray-100 text-sm font-medium rounded-md transition ${active
                                ? "bg-purple-100 text-purple-700"
                                : "text-gray-800 hover:bg-gray-50"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-gray-500">{item.icon}</div>
                                <span>{item.label}</span>
                            </div>
                            <ChevronRight size={16} className="text-pink-500" />
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="mt-6 text-center">
                <Button
                    variant="ghost"
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 text-sm font-medium"
                >
                    <LogOut size={18} className="mr-1" /> Log Out
                </Button>
            </div>
        </div>
    );
}
