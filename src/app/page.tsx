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
        let isMapped = false

        // 전체 텍스트에 대해 매핑 검사
        Object.entries(wordMapping as WordMapping).forEach(([kor, jap]) => {
            if (text.includes(kor)) {
                result = result.replace(kor, jap)
                isMapped = true
            }
        })

        // 매핑된 것이 없으면 전체 텍스트를 unmapped로 처리
        if (!isMapped) {
            unmapped.push(text)
        }

        return { result, unmapped }
    }

    const handleSearch = async (keyword: string): Promise<void> => {
        // 검색어에서 모든 공백 제거 및 영어 대문자 변환
        const normalized = keyword.replace(/\s+/g, '').toUpperCase()
        // 특수 키워드 차단
        const forbidden = ['류카', '뉴카', '뉴본']
        if (forbidden.some(word => normalized.includes(word.toUpperCase()))) {
            alert('검색결과가 존재하지 않습니다')
            return
        }
        // 한글/일본어는 대소문자 영향 없음, 영어는 대문자로 통일
        const { result: japaneseKeyword, unmapped } = convertToJapanese(normalized)

        // 검색어 저장
        try {
            await search.create({
                keyword: normalized,
                is_fail: unmapped.length > 0 ? true : null,
                ip_address: ipAddress
            })
        } catch (error) {
            console.error('검색어 저장 중 오류 발생:', error)
        }

        if (unmapped.length > 0) {
            alert(`다음 검색어의 일본어 매핑이 없습니다:\n${keyword}`)
            return
        }

        const encodedKeyword = encodeToEucJp(japaneseKeyword)
        const searchUrl = `https://mukawa-spirit.com/?mode=srh&cid=&keyword=${encodedKeyword}`

        // 모바일 환경 감지
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

        // console.log('검색 URL:', searchUrl)
        // console.log('모바일 환경:', isMobile)

        try {
            if (isMobile) {
                // 모바일에서는 현재 창에서 열기 (팝업 차단 방지)
                // console.log('모바일에서 현재 창으로 이동')
                window.location.href = searchUrl
            } else {
                // 데스크톱에서는 새 탭에서 열기
                // console.log('데스크톱에서 새 탭으로 열기')
                const newWindow = window.open(searchUrl, '_blank')
                if (!newWindow) {
                    // console.log('팝업이 차단됨, 현재 창으로 이동')
                    window.location.href = searchUrl
                }
            }
        } catch (error) {
            console.error('URL 열기 실패:', error)
            // 폴백: 현재 창에서 열기
            window.location.href = searchUrl
        }
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
                    <h2 className="text-xl font-semibold mb-2">사용 방법</h2>
                    <p className="text-gray-600">
                        한국어 또는 영어로 검색 시 일본어로 자동 번역 후 무카와 사이트로 이동해 검색 결과가 나옵니다
                        <br />
                        [피트 {'>'}  아일라 / 버번 {'>'}  아메리칸] 로 변경되어 검색됩니다. 블렌디드, 스카치는 둘 다 묶어나와 종류가 많이 나옵니다.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        ps 해당 사이트에서 결과가 바로 나올 수 있도록 하고 싶었는데 그러면 사이트가 막혀 사이트 이동으로 구현할 수 밖에 없었습니다..ㅠㅠ
                    </p>
                </div>
                <div className="mt-4 text-center">
                    무카와 주문방법(추후 추가 예정)
                </div>
                <div className="mt-8">
                    <ProductList />
                </div>
            </div>
        </main>
    )
}

export default Home 