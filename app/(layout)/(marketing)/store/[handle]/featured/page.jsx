import React from 'react'
import FeaturedProducts from "../../../../../../features/store-products/featured/featured-products"
export default async function Page({ params }) {
    const handle = await params
    return (
        <div>
            <section className="max-w-7xl mx-auto px-4 py-2 relative">
                <FeaturedProducts handle={handle.handle} />
            </section>
        </div>
    )
}
