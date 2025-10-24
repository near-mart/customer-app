import ProductsWithCategoryPage from '@/features/store-products/products-with-category-page'
export default async function ProductsWithCategory({ params }) {
    const paramsInfo = await params
    return (
        <ProductsWithCategoryPage handle={decodeURIComponent(paramsInfo?.handle)} parentCategory={decodeURIComponent(paramsInfo?.category)} subCategory={decodeURIComponent(paramsInfo?.innerCategory)} />
    )
}
