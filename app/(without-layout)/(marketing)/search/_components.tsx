
"use client"
import SearchPage from '@/features/search/search-page'
import HeaderSearch from '@/layout/header/header-search'
import { useEffect, useState } from 'react'
import { debounce } from "lodash"
import { useQuery } from '@tanstack/react-query'
import { fetchSupplier } from '@/services/suppliers'
import useLocationStore from '@/store/location'
import { fetchProducts } from '@/services/products'

export default function SearchMain() {
    const { locationData } = useLocationStore()
    const [tabs, setTabs] = useState("stores")
    const [query, setQuery] = useState("")
    const handleSearch = debounce((val) => {
        setQuery(val)
    }, 600)
    const { data: suppliers, isLoading } = useQuery({
        queryKey: [
            "fetchSupplier",
            tabs,
            query || "",
            locationData?.latitude || null,
            locationData?.longitude || null,
        ],
        queryFn: ({ signal }) =>
            fetchSupplier(signal, {
                page: 0,
                page_size: 15,
                latitude: locationData?.latitude,
                longitude: locationData?.longitude,
                search: query || "",
            }),
        enabled:
            tabs === "stores" &&
            !!locationData?.latitude &&
            !!locationData?.longitude,
    });

    useEffect(() => {
        if (suppliers?.pagination) {
        }
    }, [suppliers]);
    const { data: products, isLoading: isProductLoading } = useQuery({
        queryKey: ["fetchProducts", tabs, query],
        queryFn: ({ signal }) => fetchProducts(signal, {
            page: 0,
            page_size: 15,
            search: query,
            latitude: locationData?.latitude,
            longitude: locationData?.longitude,
        }),
        enabled: tabs == "products"
    });
    return (
        <>
            <HeaderSearch {...{ setQuery, query, handleSearch }} />
            <div className='mt-40 md:mt-[100px]' />
            <section className="max-w-7xl mx-auto px-4 py-2 relative">
                <SearchPage query={query} setQuery={setQuery} setTabs={setTabs} tabs={tabs} suppliers={suppliers?._payload || []} isLoading={isLoading} products={products?._payload || []} isProductLoading={isProductLoading} />
            </section>
        </>
    )
}
