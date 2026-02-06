'use client'

import { FC, useState, useEffect } from 'react'
import SearchBar from '@/components/SearchBar'
import ProductList from '@/components/ProductList'
import iconv from 'iconv-lite'
import wordMapping from '@/data/word_mapping.json'
import { search } from '@/lib/db/search'
import { statistics, SiteType } from '@/lib/db/statistics'

interface WordMapping {
  [key: string]: string
}

const Home: FC = () => {
  const [ipAddress, setIpAddress] = useState<string>('')
  const [siteType, setSiteType] = useState<SiteType>('mukawa')

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
    const isJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/

    if (isJapanese.test(text)) {
      const buffer = iconv.encode(text, 'EUC-JP')
      return Array.from(buffer)
        .map(byte => '%' + byte.toString(16).toUpperCase().padStart(2, '0'))
        .join('')
    } else {
      return encodeURIComponent(
        text.split('').map(char => {
          const code = char.charCodeAt(0)
          if (code > 127) {
            return `&#${code};`
          }
          return char
        }).join('')
      )
    }
  }

  const convertToJapanese = (text: string): { result: string; unmapped: string[] } => {
    // 숫자+년도 패턴 처리 (12, 15, 18, 21)
    const processYearPattern = (input: string): string => {
      // "12년", "15년" 등을 "12年", "15年"으로 변환
      let processed = input.replace(/(12|15|18|21)년/gi, '$1年')
      // 숫자만 있는 경우도 "年" 추가 (단, 이미 年이 붙어있지 않은 경우)
      processed = processed.replace(/(12|15|18|21)(?!年)/g, '$1年')
      // 일본어/한글 바로 뒤에 숫자가 오면 공백 추가 (예: 山崎12年 → 山崎 12年)
      processed = processed.replace(/([\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF])(\d+年)/g, '$1 $2')
      return processed
    }

    if ((wordMapping as WordMapping)[text]) {
      return { result: processYearPattern((wordMapping as WordMapping)[text]), unmapped: [] }
    }

    let result = text
    const unmapped: string[] = []
    let isMapped = false

    Object.entries(wordMapping as WordMapping).forEach(([kor, jap]) => {
      if (text.includes(kor)) {
        result = result.replace(kor, jap)
        isMapped = true
      }
    })

    // 숫자+년도 패턴 처리
    result = processYearPattern(result)

    // 숫자+年 패턴이 있으면 매핑된 것으로 간주
    if (/(12|15|18|21)年/.test(result)) {
      isMapped = true
    }

    if (!isMapped) {
      unmapped.push(text)
    }

    return { result, unmapped }
  }

  const handleSearch = async (keyword: string): Promise<void> => {
    const normalized = keyword.replace(/\s+/g, '').toUpperCase()
    const forbidden = ['류카', '뉴카', '뉴본']
    if (forbidden.some(word => normalized.includes(word.toUpperCase()))) {
      alert('검색결과가 존재하지 않습니다')
      return
    }
    const { result: japaneseKeyword, unmapped } = convertToJapanese(normalized)

    // 영어+숫자만 포함하는지 확인 (공백 제외 후)
    const isEnglishOnly = /^[a-zA-Z0-9]+$/.test(normalized)

    // 검색 실패 처리
    if (unmapped.length > 0) {
      // 무카와는 무조건 매핑 필요
      if (siteType === 'mukawa') {
        try {
          await search.createFail({
            keyword: normalized,
            ip_address: ipAddress
          })
        } catch (error) {
          console.error('검색 실패 저장 중 오류 발생:', error)
        }
        alert(`다음 검색어의 일본어 매핑이 없습니다:\n${keyword}`)
        return
      }
      
      // 야후/라쿠텐/메루카리: 영어+숫자만인 경우 그대로 검색 허용
      if (!isEnglishOnly) {
        try {
          await search.createFail({
            keyword: normalized,
            ip_address: ipAddress
          })
        } catch (error) {
          console.error('검색 실패 저장 중 오류 발생:', error)
        }
        alert(`다음 검색어의 일본어 매핑이 없습니다:\n${keyword}`)
        return
      }
    }

    // 검색 성공 시 statistics 테이블에 저장 (사이트별 카운트 증가)
    try {
      await statistics.increment(normalized, siteType)
    } catch (error) {
      console.error('통계 저장 중 오류 발생:', error)
    }

    // 최종 검색 키워드 결정 (매핑 실패 + 영어만인 경우 원본 사용)
    const finalKeyword = (unmapped.length > 0 && isEnglishOnly) ? normalized : japaneseKeyword

    // 사이트별 검색 URL 생성
    let searchUrl: string
    if (siteType === 'mukawa') {
      const encodedKeyword = encodeToEucJp(finalKeyword)
      searchUrl = `https://mukawa-spirit.com/?mode=srh&cid=&keyword=${encodedKeyword}`
    } else if (siteType === 'yahoo') {
      const encodedKeyword = encodeURIComponent(finalKeyword)
      searchUrl = `https://auctions.yahoo.co.jp/search/search?p=${encodedKeyword}`
    } else if (siteType === 'rakuten') {
      const encodedKeyword = encodeURIComponent(finalKeyword)
      searchUrl = `https://search.rakuten.co.jp/search/mall/${encodedKeyword}/`
    } else {
      // mercari
      const encodedKeyword = encodeURIComponent(finalKeyword)
      searchUrl = `https://jp.mercari.com/search?keyword=${encodedKeyword}`
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    try {
      if (isMobile) {
        window.location.href = searchUrl
      } else {
        const newWindow = window.open(searchUrl, '_blank')
        if (!newWindow) {
          window.location.href = searchUrl
        }
      }
    } catch (error) {
      console.error('URL 열기 실패:', error)
      window.location.href = searchUrl
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* 배경 그라데이션 효과 */}
      <div className="absolute inset-0 bg-hero-pattern pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* 헤더 */}
      <header className="relative z-10 glass border-b border-dark-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-dark-900 font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-dark-100 hidden sm:block">일본 위스키 검색 사이트</span>
            </div>
            <button
              onClick={() => window.location.href = '/contact'}
              className="px-5 py-2.5 rounded-xl glass-light text-dark-200 hover:text-amber-400 hover:border-amber-400/30 transition-all duration-300 text-sm font-medium"
            >
              문의하기
            </button>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="animate-fade-in text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-dark-100">위스키</span>
            <br />
            <span className="text-gradient">한국어 검색</span>
          </h1>
          <p className="animate-slide-up delay-100 text-dark-400 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            한국어로 검색하면 일본어로 자동 변환되어
            <br className="hidden sm:block" />
            선택한 사이트에서 바로 검색됩니다
          </p>

          {/* 사이트 선택 */}
          <div className="animate-slide-up delay-150 flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
            <button
              onClick={() => setSiteType('mukawa')}
              className={`
                px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base
                ${siteType === 'mukawa'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-dark-900'
                  : 'glass-light text-dark-300 hover:text-dark-100 hover:border-dark-500'
                }
              `}
            >
              무카와
            </button>
            <button
              onClick={() => setSiteType('yahoo')}
              className={`
                px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base
                ${siteType === 'yahoo'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-dark-900'
                  : 'glass-light text-dark-300 hover:text-dark-100 hover:border-dark-500'
                }
              `}
            >
              야후 옥션
            </button>
            <button
              onClick={() => setSiteType('rakuten')}
              className={`
                px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base
                ${siteType === 'rakuten'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-dark-900'
                  : 'glass-light text-dark-300 hover:text-dark-100 hover:border-dark-500'
                }
              `}
            >
              라쿠텐
            </button>
            <button
              onClick={() => setSiteType('mercari')}
              className={`
                px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base
                ${siteType === 'mercari'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-dark-900'
                  : 'glass-light text-dark-300 hover:text-dark-100 hover:border-dark-500'
                }
              `}
            >
              메루카리
            </button>
          </div>

          {/* 검색바 */}
          <div className="animate-slide-up delay-200 max-w-2xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* 사용 방법 카드 */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="animate-slide-up delay-300 glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-dark-100">사용 방법</h2>
            </div>
            
            <div className="space-y-6 text-dark-300">
              {/* 1번 설명 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-400 text-sm font-semibold">1</span>
                </div>
                <div>
                  <p className="leading-relaxed">
                    한국어 또는 영어로 검색하면 일본어로 자동 번역 후 사이트로 이동해 검색 결과가 나옵니다.
                    <br />
                    무카와는 검색 시에 일본어 매핑이 없을 시, 검색이 되지 않습니다.
                    <br />
                    야후, 라쿠텐, 메루카리는 일본어 매핑이 없으면 영어 그대로 검색됩니다. (한국어는 매핑 없으면 불가)
                  </p>
                </div>
              </div>

              {/* 2번 설명 */}
              <div className="flex gap-4 pt-4 border-t border-dark-700/50">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-400 text-sm font-semibold">2</span>
                </div>
                <div className="space-y-3">
                  <p className="leading-relaxed">
                    일부 검색어는 무카와 사이트의 카테고리에 맞게 변환되어 검색됩니다.
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <div className="glass-light rounded-xl px-4 py-2 text-sm">
                      <span className="text-dark-400">피트</span>
                      <span className="text-amber-400 mx-2">→</span>
                      <span className="text-dark-200">아일라</span>
                    </div>
                    <div className="glass-light rounded-xl px-4 py-2 text-sm">
                      <span className="text-dark-400">버번</span>
                      <span className="text-amber-400 mx-2">→</span>
                      <span className="text-dark-200">아메리칸</span>
                    </div>
                  </div>
                  <p className="text-sm text-dark-400">
                    무카와에서 "블렌디드", "스카치" 검색 시 둘 다 묶여서 검색됩니다. 종류가 많이 나옵니다.
                  </p>
                </div>
              </div>

              {/* 3번 설명 */}
              <div className="flex gap-4 pt-4 border-t border-dark-700/50">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-400 text-sm font-semibold">3</span>
                </div>
                <div>
                  <p className="leading-relaxed">
                    무카와에서 결과가 이상하게 나오는 것은 무카와의 검색엔진 문제입니다.
                    <br />
                    사이트 내에 일본어로 직접 검색했을 때도 이상하게 나오는 현상이 있습니다.
                  </p>
                </div>
              </div>

              {/* 4번 설명 */}
              <div className="flex gap-4 pt-4 border-t border-dark-700/50">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-400 text-sm font-semibold">4</span>
                </div>
                <div>
                  <p className="leading-relaxed">
                    메루카리, 야후, 라쿠텐은 영어 검색이 가능하지지만, 
                    <br />
                    일본어로 검색할시에 결과물이 다르게 나오는 경우가 있어 편의를 위해 추가했습니다
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 상품 목록 섹션 */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <ProductList />
        </div>
      </section>

      {/* 푸터 */}
      <footer className="relative z-10 glass border-t border-dark-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row justify-between gap-8">
            {/* 공식사이트 링크 */}
            <div className="flex-1">
              <h3 className="text-dark-300 text-sm font-semibold mb-4">
                공식사이트로 가기
              </h3>
              <div className="flex flex-col gap-2">
                <a
                  href="https://mukawa-spirit.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400/80 hover:text-amber-400 text-sm transition-colors flex items-center gap-2 w-fit"
                >
                  무카와 스피릿 (Mukawa Spirit)
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a
                  href="https://auctions.yahoo.co.jp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400/80 hover:text-amber-400 text-sm transition-colors flex items-center gap-2 w-fit"
                >
                  야후 옥션 (Yahoo Auctions)
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a
                  href="https://www.rakuten.co.jp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400/80 hover:text-amber-400 text-sm transition-colors flex items-center gap-2 w-fit"
                >
                  라쿠텐 (Rakuten)
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a
                  href="https://jp.mercari.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400/80 hover:text-amber-400 text-sm transition-colors flex items-center gap-2 w-fit"
                >
                  메루카리 (Mercari)
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
            
            {/* 저작권 표시 */}
            <div className="flex flex-col items-start lg:items-end justify-end gap-2">
              <p className="text-dark-500 text-xs">
                이 사이트는 위 공식 사이트들과 관련이 없습니다
              </p>
              <p className="text-dark-600 text-xs">
                © 2025 Whisky Search. All rights reserved.
              </p>
              <p className="text-dark-500 text-xs">
                제작자 인스타 아이디 : <a
                  href="https://www.instagram.com/sool.won"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400/80 hover:text-amber-400 transition-colors"
                >@sool.won</a> · 제안/문의 환영
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default Home
