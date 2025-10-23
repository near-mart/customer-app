"use client"
import { Button } from '@/components/ui/button';
import Header from '@/layout/header/header'
import { fetchCategory } from '@/services/categories';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Categories from './components/categories';
import Banner from './components/banner';
import Suppliers from './components/suppliers';
import useLocationStore from '@/store/location';

export default function HomePage() {
    const { locationData } = useLocationStore()
    const { data: categories, isLoading } = useQuery({
        queryKey: ["fetchCategory"],
        queryFn: ({ signal }) => fetchCategory(signal)
    })
    return (
        <>
            <Header />
            <div className='mt-[220px] md:mt-[100px]' />
            <Banner />
            <Categories categories={categories?._payload || []} loading={isLoading} />
            <Suppliers location={locationData} />



        </>
    )
}