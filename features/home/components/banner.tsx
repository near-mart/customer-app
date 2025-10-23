"use client";
import Slider from "react-slick";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function NextArrow({ onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow-md p-1 sm:p-2 z-10"
            aria-label="Next slide"
        >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-gray-800" />
        </button>
    );
}

function PrevArrow({ onClick }: any) {
    return (
        <button
            onClick={onClick}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow-md p-1 sm:p-2 z-10"
            aria-label="Previous slide"
        >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-gray-800" />
        </button>
    );
}

export default function Banner() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 700,
        autoplay: true,
        autoplaySpeed: 4000,
        slidesToShow: 1,
        slidesToScroll: 1,
        pauseOnHover: true,
        nextArrow: <NextArrow />, // 👈 custom arrows
        prevArrow: <PrevArrow />,
    };

    const banners = [
        {
            src: "https://cdn.zeptonow.com/production/tr:w-1280,ar-9600-1887,pr-true,f-auto,q-80/inventory/banner/42aa0b53-0a9e-46e5-8aa6-41448fc4643b.png",
            alt: "Paan Corner Offer",
            href: "/cn/paan-corner/cigarettes/cid/cd50825e-baf8-47fe-9abc-ed9556122a9a/scid/5bcbee47-7c83-4279-80f0-7ecc068496df",
        },
        {
            src: "/banners/banner.webp",
            alt: "Fresh fruits offer",
            href: "/fruits",
        },
        {
            src: "/banners/banner.webp",
            alt: "Daily essentials at best prices",
            href: "/essentials",
        },
    ];

    return (
        <div className="relative w-full mx-auto max-w-[1400px] overflow-hidden rounded-xl mt-3 sm:mt-4 lg:mt-6">
            <Slider {...settings}>
                {banners.map((banner, i) => (
                    <div key={i} className="relative w-full px-2 sm:px-3 lg:px-4">
                        <Link href={banner.href} aria-label={banner.alt}>
                            <div className="relative w-full h-[100px] sm:h-[130px] md:h-[160px] lg:h-[240px] xl:h-[250px]">
                                <Image
                                    src={banner.src}
                                    alt={banner.alt}
                                    fill
                                    priority={i === 0}
                                    className="object-contain sm:object-cover rounded-xl"
                                    sizes="100vw"
                                />
                            </div>
                        </Link>
                    </div>
                ))}
            </Slider>
        </div>
    );
}
