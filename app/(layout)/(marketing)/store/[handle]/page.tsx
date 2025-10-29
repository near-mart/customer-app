import StoreProductsPage from '@/features/store-products/store-products-page'

export default async function StoreHandle({ params }) {
    const paramsInfo = await params

    return (
        <StoreProductsPage handle={paramsInfo?.handle} />
    )
}
