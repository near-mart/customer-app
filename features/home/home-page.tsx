"use client"
import Header from '@/layout/header/header'
import { fetchCategory } from '@/services/categories';
import { useQuery } from '@tanstack/react-query';
import Banner from './components/banner';
import Suppliers from './components/suppliers';
import useLocationStore from '@/store/location';

export default function HomePage() {
    const { locationData } = useLocationStore()
    const { data: categories } = useQuery({
        queryKey: ["fetchCategory"],
        queryFn: ({ signal }) => fetchCategory(signal)
    });
    return (
        <>
            <Header />
            <div className='mt-[230px] md:mt-40' />
            <Banner />
            <Suppliers location={locationData} categories={categories?._payload || []} />
        </>
    )
}