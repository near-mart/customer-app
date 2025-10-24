"use client"
import useLocation from '@/features/home/hooks/useLocation'
import { ArrowIcon, CartIcon, ProfileIcon } from '@/svgs'
import { SearchIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function MobileHeader() {
    const { displayAddress } = useLocation()

    return (
        <div className="flex flex-col gap-2 p-4 lg:hidden">
            <div className="flex justify-between items-center w-full">
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

                <div className="flex items-center gap-4">
                    <Link aria-label="profile" href="/account" className="flex flex-col items-center">
                        <ProfileIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="text-xs sm:text-sm text-black capitalize">profile</span>
                    </Link>

                    <div className="group relative">
                        <button
                            aria-label="Cart"
                            className="relative flex flex-col items-center gap-y-1"
                            data-testid="cart-btn"
                        >
                            <CartIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span className="text-xs sm:text-sm text-black">Cart</span>
                        </button>
                        <div className="absolute right-1 -bottom-3 translate-y-full rounded-md bg-black py-1.5 px-3 text-xs text-white opacity-0 group-hover:opacity-100 z-50">
                            Your cart is empty
                            <div className="absolute h-2 w-2 rotate-45 bg-black top-0 right-2 -translate-y-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: Delivery Info */}
            <div className="flex flex-col mt-2">
                <h2 className="flex items-center" data-testid="delivery-time">
                    <ArrowIcon className="w-6 h-6" />
                    <span className="ml-1 font-bold text-[#ef4372] text-xs md:text-base flex flex-wrap items-center gap-x-1">
                        <span className="block">Tomorrow — </span>
                        <span className="block font-bold text-[#ef4372]">
                            Estimated delivery before 12
                        </span>
                    </span>
                </h2>

                <button
                    type="button"
                    className="flex items-center text-ellipsis overflow-hidden whitespace-nowrap mt-1"
                >
                    <h3 className="text-xs md:text-sm font-semibold text-black truncate max-w-full">
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
                        <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            {/* Row 3: Search Bar */}
            <div className="mt-2">
                <Link
                    aria-label="Search for products"
                    className="relative flex items-center gap-x-2 rounded-lg border bg-white px-3 py-2 w-full"
                    href="/search"
                >
                    <SearchIcon className="w-4 h-4" />
                    <span className="flex flex-1 items-center gap-x-1 text-sm text-gray-700 truncate">
                        <span data-testid="searchBar">Search for</span>
                        <ul className="relative flex-1 h-[18px] sm:h-[20px] overflow-hidden">
                            {[
                                'kurkure',
                                'apple juice',
                                'cheese slices',
                                'chocolate box',
                                'amul butter',
                                'banana',
                            ].map((item, i) => (
                                <li
                                    key={item}
                                    className="absolute animate-search-items opacity-0"
                                    style={{
                                        animationDelay: `${i * 3}s`,
                                        animationDuration: '18s',
                                    }}
                                >
                                    "{item}"
                                </li>
                            ))}
                        </ul>
                    </span>
                </Link>
            </div>
        </div>
    )
}
