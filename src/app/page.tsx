'use client'

import { FC, useState, useEffect } from 'react'
import SearchBar from '@/components/SearchBar'
import ProductList from '@/components/ProductList'
import iconv from 'iconv-lite'
import wordMapping from '@/data/word_mapping.json'
import { search } from '@/lib/db/search'

interface WordMapping {
    [key: string]: string
}

const Home: FC = () => {
    const [ipAddress, setIpAddress] = useState<string>('')

    useEffect(() => {
        const fetchIpAddress = async () => {
            try {
                const response = await fetch('https://api.ipify.org?format=json')
                const data = await response.json()
                setIpAddress(data.ip)
            } catch (error) {
                console.error('error : ', error)
                setIpAddress('unknown')
            }
        }
        fetchIpAddress()
    }, [])

    const encodeToEucJp = (text: string): string => {
        // 일본어 문자인지 확인하는 정규식
        const isJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/

        if (isJapanese.test(text)) {
            // 일본어인 경우 EUC-JP로 인코딩
            const buffer = iconv.encode(text, 'EUC-JP')
            return Array.from(buffer)
                .map(byte => '%' + byte.toString(16).toUpperCase().padStart(2, '0'))
                .join('')
        } else {
            // 한글인 경우 HTML 엔티티로 변환 후 URL 인코딩
            return encodeURIComponent(
                text.split('').map(char => {
                    const code = char.charCodeAt(0)
                    // ASCII 코드 127을 초과하는 문자(한글, 일본어 등)를 HTML 엔티티로 변환
                    if (code > 127) {
                        return `&#${code};`
                    }
                    return char
                }).join('')
            )
        }
    }

    const convertToJapanese = (text: string): { result: string; unmapped: string[] } => {
        // 매핑된 단어가 있는지 확인
        if ((wordMapping as WordMapping)[text]) {
            return { result: (wordMapping as WordMapping)[text], unmapped: [] }
        }

        // 부분 매칭 시도
        let result = text
        const unmapped: string[] = []
        const words = text.split(/(?=[가-힣])/) // 한글 단어 단위로 분리

        words.forEach(word => {
            if (word.trim() === '') return

            let isMapped = false
            Object.entries(wordMapping as WordMapping).forEach(([kor, jap]) => {
                if (word.includes(kor)) {
                    result = result.replace(kor, jap)
                    isMapped = true
                }
            })

            if (!isMapped) {
                unmapped.push(word)
            }
        })

        return { result, unmapped }
    }

    const handleSearch = async (keyword: string): Promise<void> => {
        // 검색어에서 모든 공백 제거 및 영어 대문자 변환
        const normalized = keyword.replace(/\s+/g, '').toUpperCase()
        // 한글/일본어는 대소문자 영향 없음, 영어는 대문자로 통일
        const { result: japaneseKeyword, unmapped } = convertToJapanese(normalized)

        if (unmapped.length > 0) {
            alert(`다음 단어들의 일본어 매핑이 없습니다:\n${unmapped.join(', ')}`)
            return
        }

        // 검색어 저장
        try {
            await search.create({
                keyword: normalized,
                ip_address: ipAddress
            })
        } catch (error) {
            console.error('검색어 저장 중 오류 발생:', error)
        }

        const encodedKeyword = encodeToEucJp(japaneseKeyword)
        const searchUrl = `https://mukawa-spirit.com/?mode=srh&cid=&keyword=${encodedKeyword}`
        window.open(searchUrl, '_blank')
    }

    return (
        <main className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-center">무카와 스피릿 한국어 검색</h1>
                    <button
                        onClick={() => window.location.href = '/contact'}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        문의
                    </button>
                </div>
                <SearchBar onSearch={handleSearch} />
                <div className="mt-4 text-center">
                    <a 
                        href="https://gall.dcinside.com/mgallery/board/view?id=nuncestbibendum&no=16287"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        무카와 주문방법
                    </a>
                </div>
                <div className="mt-8">
                    <ProductList />
                </div>
            </div>
        </main>
    )
}

export default Home 