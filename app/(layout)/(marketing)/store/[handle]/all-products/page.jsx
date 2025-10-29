import React from 'react'
import AllProducts from "../../../../../../features/store-products/all-products"
export default async function Page({ params }) {
    const handle = await params
    return (
        <div>
            <section className="max-w-7xl mx-auto px-4 py-2 relative">
                <AllProducts handle={handle.handle} />
            </section>
        </div>
    )
}
