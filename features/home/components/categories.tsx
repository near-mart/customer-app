"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

function NextArrow({ onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full shadow p-1 sm:p-2 z-10"
        >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700" />
        </button>
    );
}

function PrevArrow({ onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full shadow p-1 sm:p-2 z-10"
        >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700" />
        </button>
    );
}

export default function Categories({
    categories,
    loading,
}: {
    categories?: any[];
    loading?: boolean;
}) {
    const skeletonArray = Array.from({ length: 6 });

    const settings = {
        dots: false,
        infinite: categories?.length > 6,
        speed: 500,
        slidesToShow: 6,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2500,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        swipeToSlide: true,
        pauseOnHover: true,
        responsive: [
            {
                breakpoint: 1280,
                settings: { slidesToShow: 5 },
            },
            {
                breakpoint: 1024,
                settings: { slidesToShow: 4 },
            },
            {
                breakpoint: 768,
                settings: { slidesToShow: 3 },
            },
            {
                // ✅ Show 2 cards per slide on small devices
                breakpoint: 480,
                settings: { slidesToShow: 2 },
            },
        ],
    };

    return (
        <section className="max-w-7xl mx-auto px-4 py-10 relative">
            <h2 className="text-xl font-semibold mb-6 text-primary">
                🛍️ Shop by Category
            </h2>

            {loading ? (
                <div className="flex gap-4 overflow-hidden">
                    {skeletonArray.map((_, i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm animate-pulse"
                        >
                            <Skeleton className="w-[90px] h-[90px] rounded-full" />
                            <Skeleton className="w-16 h-3 mt-3 rounded-md" />
                        </div>
                    ))}
                </div>
            ) : (
                <Slider {...settings}>
                    {categories?.map((cat) => (
                        <div key={cat._id} className="px-2">
                            <Link href={`/categories/${cat._id}`}>
                                <div className="flex flex-col items-center bg-white rounded-xl shadow-sm hover:shadow-md p-4 cursor-pointer transition">
                                    {/* ✅ Fix image circle overflow + perfect responsive sizing */}
                                    <div className="relative w-[60px] h-[60px] sm:w-[100px] sm:h-[100px] overflow-hidden rounded-full border">
                                        <Image
                                            src={cat.image || "/category-placeholder.svg"}
                                            alt={cat.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width:768px) 50vw, (max-width:1200px) 25vw, 100px"
                                        />
                                    </div>
                                    <p className="text-xs md:text-sm font-medium text-gray-700 mt-2 text-center truncate w-[90px] sm:w-[110px]">
                                        {cat.name}
                                    </p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </Slider>
            )}
        </section>
    );
}
