import { CheckOut } from '@/features/checkout';
import React from 'react'

export default async function CheckOutPage({ params }) {
    const store = (await params).store;
    return (
        <section className="max-w-xl mx-auto px-4  relative">
            <CheckOut store={store} />
        </section>
    )
}
