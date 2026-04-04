import React from "react";

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="max-w-7xl mx-auto px-4 relative mt-30">
            {children}
        </section>
    );
}
