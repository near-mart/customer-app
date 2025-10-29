import { Suspense } from 'react'
import SearchMain from './_components'

export default function Search() {
    return (
        <div>
            <Suspense fallback={<div className="p-10 text-center">Loading search...</div>}>
                <SearchMain />
            </Suspense>
        </div>
    )
}
