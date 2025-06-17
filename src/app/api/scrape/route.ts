'use server'

import { NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'

interface Category {
    name: string
    url: string
    brands: Brand[]
}

interface Brand {
    name: string
    url: string
    products: Product[]
}

interface Product {
    name: string
    price: string
    imageUrl: string
    url: string
}

export async function GET() {
    try {
        // 1. 메인 페이지에서 카테고리 정보 가져오기
        const response = await axios.get('https://mukawa-spirit.com/')
        const $ = cheerio.load(response.data)

        const categories: Category[] = []

        // 사이드바의 카테고리 목록 가져오기
        $('.side_category_list li').each((_, element) => {
            const $element = $(element)
            const $link = $element.find('a')
            const name = $link.text().trim()
            const url = $link.attr('href') || ''

            if (name && url) {
                categories.push({
                    name,
                    url,
                    brands: []
                })
            }
        })

        // 2. 각 카테고리 페이지에서 브랜드 정보 가져오기
        for (const category of categories) {
            const categoryResponse = await axios.get(category.url)
            const $category = cheerio.load(categoryResponse.data)

            // 브랜드 목록 가져오기
            $category('.side_category_list li').each((_, element) => {
                const $element = $category(element)
                const $link = $element.find('a')
                const name = $link.text().trim()
                const url = $link.attr('href') || ''

                if (name && url) {
                    category.brands.push({
                        name,
                        url,
                        products: []
                    })
                }
            })
        }

        // 3. 각 브랜드 페이지에서 제품 정보 가져오기
        for (const category of categories) {
            for (const brand of category.brands) {
                const brandResponse = await axios.get(brand.url)
                const $brand = cheerio.load(brandResponse.data)

                // 제품 목록 가져오기
                $brand('.item_list li').each((_, element) => {
                    const $element = $brand(element)
                    const $link = $element.find('a')
                    const $img = $element.find('img')
                    const $price = $element.find('.price')

                    const name = $link.text().trim()
                    const url = $link.attr('href') || ''
                    const imageUrl = $img.attr('src') || ''
                    const price = $price.text().trim()

                    if (name && url) {
                        brand.products.push({
                            name,
                            url,
                            imageUrl,
                            price
                        })
                    }
                })
            }
        }

        return NextResponse.json({ categories })
    } catch (error) {
        console.error('Scraping error:', error)
        return NextResponse.json({ error: 'Failed to scrape data' }, { status: 500 })
    }
} 