import React from 'react'
import { Skeleton } from './ui/skeleton'

export default function ProductSkeleton() {
    return (
        <div
            className="rounded-xl border border-gray-100 shadow-sm bg-white p-3 space-y-2"
        >
            {/* 🖼️ Image placeholder */}
            <Skeleton className="w-full h-36 rounded-lg" />

            {/* 🧾 Product title */}
            <div className="space-y-2 mt-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>

            {/* 💰 Price + Button placeholder */}
            <div className="flex items-center justify-between mt-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-12 rounded-md" />
            </div>
        </div>
    )
}
