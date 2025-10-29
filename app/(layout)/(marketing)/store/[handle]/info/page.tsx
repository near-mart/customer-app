import StoreInfoPage from '@/features/store-products/store-info-page'
import React from 'react'

export default async function StoreInfo({ params }) {
    const handle = await params
    return (
        <div>
            <section className="max-w-7xl mx-auto px-4 py-2 relative">
                <StoreInfoPage handle={handle.handle} />
            </section>
        </div>
    )
}
