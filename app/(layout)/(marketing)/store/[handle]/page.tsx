import StoreProductsPage from '@/features/store-products/store-products-page'
import React from 'react'

export default async function StoreHandle({ params }) {
    const paramsInfo = await params

    return (
        <section className="max-w-7xl mx-auto px-4 py-6 relative">
            <StoreProductsPage handle={paramsInfo?.handle} />
        </section>
    )
}
