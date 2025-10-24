"use client"
import Header from '@/layout/header/header'
import { fetchCategory } from '@/services/categories';
import { useQuery } from '@tanstack/react-query';
import Categories from './components/categories';
import Banner from './components/banner';
import Suppliers from './components/suppliers';
import useLocationStore from '@/store/location';
import Products from './components/products';
import { fetchProducts } from '@/services/products';
export default function HomePage() {
    const { locationData } = useLocationStore()
    const { data: categories, isLoading } = useQuery({
        queryKey: ["fetchCategory"],
        queryFn: ({ signal }) => fetchCategory(signal)
    });
    const { data: products, isLoading: isProductLoading } = useQuery({
        queryKey: ["fetchProducts"],
        queryFn: ({ signal }) => fetchProducts(signal, { page: 0, page_size: 10 })
    });

    return (
        <>
            <Header />
            <div className='mt-[280px] md:mt-[160px]' />
            <Banner />
            <Categories categories={categories?._payload || []} loading={isLoading} />
            <Products products={products?._payload || []} loading={isProductLoading} />
            <Suppliers location={locationData} categories={categories?._payload || []} />
        </>
    )
}