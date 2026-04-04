import ProductDetailsPage from '@/features/product-details/product-details-page'
export default async function ProductDetails({ params }) {
    const paramsInfo = await params
    return (
        <section className="max-w-7xl mx-auto px-4 py-2 relative">
            <ProductDetailsPage productId={paramsInfo?.productId} handle={paramsInfo?.handle} />
        </section>
    )
}
