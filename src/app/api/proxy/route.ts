import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
        return new NextResponse('URL is required', { status: 400 })
    }

    try {
        const response = await fetch(url)
        const html = await response.text()

        // CORS 헤더 설정
        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*',
            },
        })
    } catch (error) {
        return new NextResponse('Error fetching content', { status: 500 })
    }
} 