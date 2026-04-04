import Sidebar from "@/features/account/components/sidebar";
import React from "react";

export default function WishListLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className=" bg-white flex flex-col lg:flex-row rounded-2xl overflow-hidden" >
            <aside className="w-full lg:w-[320px] border-r bg-white p-5 hidden lg:flex flex-col shrink-0 ">
                <Sidebar />
            </aside>
            <main className="block flex-1 sm:p-6 overflow-y-auto bg-gray-50 p-4 h-[80vh]">
                {children}
            </main>
        </div>
    );
}
