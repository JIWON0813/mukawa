import { FC, useState, useEffect } from 'react'

interface Category {
    name: string
    brands: Brand[]
}

interface Brand {
    name: string
    products: Product[]
}

interface Product {
    name: string
    price: string
    imageUrl: string
    url: string
}

interface ApiResponse {
    categories?: Category[]
    error?: string
}

const ProductList: FC = () => {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    // useEffect(() => {
    //     const fetchData = async (): Promise<void> => {
    //         try {
    //             const response = await fetch('/api/scrape')
    //             const data: ApiResponse = await response.json()

    //             if (data.error) {
    //                 setError(data.error)
    //             } else if (data.categories) {
    //                 setCategories(data.categories)
    //             }
    //         } catch (err) {
    //             setError('데이터를 불러오는데 실패했습니다.')
    //         } finally {
    //             setLoading(false)
    //         }
    //     }

    //     fetchData()
    // }, [])

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-700">무카와 상품 목록 보여질 수 있도록 준비 중입니다</h2>
                <p className="mt-4 text-gray-500">차후 구현 예정입니다.</p>
            </div>
        </div>
    )
}

export default ProductList 