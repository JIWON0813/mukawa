'use client'

import { FC, useState, FormEvent, ChangeEvent, useEffect } from 'react'
import { contacts } from '@/lib/db/contacts'

interface Category {
  value: string
  label: string
  icon: string
}

const categories: Category[] = [
  { value: 'add', label: '검색어 추가', icon: 'M12 4v16m8-8H4' },
  { value: 'feature', label: '기능 요청', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { value: 'etc', label: '기타', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { value: 'dev', label: '개발자 문의', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' }
]

const ContactPage: FC = () => {
  const [category, setCategory] = useState<string>('add')
  const [korean, setKorean] = useState<string>('')
  const [english, setEnglish] = useState<string>('')
  const [japanese, setJapanese] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(false)
  const [ipAddress, setIpAddress] = useState<string>('')

  useEffect(() => {
    const fetchIpAddress = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        setIpAddress(data.ip)
      } catch (error) {
        console.error('IP 주소를 가져오는데 실패했습니다:', error)
        setIpAddress('unknown')
      }
    }
    fetchIpAddress()
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!privacyAgreed) {
      setError('개인정보 처리방침에 동의해주세요.')
      setIsSubmitting(false)
      return
    }

    if (category === 'add') {
      if (!korean.trim()) {
        setError('한국어를 입력해주세요.')
        setIsSubmitting(false)
        return
      }
    } else {
      if (!content.trim()) {
        setError('내용을 입력해주세요.')
        setIsSubmitting(false)
        return
      }
    }

    try {
      const data: any = { 
        category,
        ip_address: ipAddress
      }
      if (category === 'add') {
        data.korean = korean
        data.english = english
        data.japanese = japanese
      } else {
        data.content = content
      }

      const { error: submitError } = await contacts.create(data)

      if (submitError) throw submitError

      alert('문의가 성공적으로 제출되었습니다!')
      setCategory('add')
      setKorean('')
      setEnglish('')
      setJapanese('')
      setContent('')
      setPrivacyAgreed(false)
    } catch (err) {
      console.error('Error submitting form:', err)
      setError('문의 제출 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-hero-pattern pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* 헤더 */}
      <header className="relative z-10 glass border-b border-dark-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-dark-900 font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-dark-100 hidden sm:block">Mukawa</span>
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-5 py-2.5 rounded-xl glass-light text-dark-200 hover:text-amber-400 hover:border-amber-400/30 transition-all duration-300 text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              돌아가기
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <section className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          {/* 타이틀 */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold text-dark-100 mb-2">문의하기</h1>
            <p className="text-dark-400">검색어 추가 요청이나 기능 제안을 남겨주세요</p>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="animate-slide-up">
            <div className="glass rounded-2xl p-6 sm:p-8 space-y-6">
              {/* 에러 메시지 */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* 카테고리 선택 */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-3">카테고리</label>
                <div className="grid grid-cols-4 gap-2">
                  {categories.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      disabled={isSubmitting}
                      className={`
                        p-3 rounded-xl text-center transition-all duration-200
                        ${category === c.value 
                          ? 'bg-amber-500/20 border-amber-400/50 text-amber-400' 
                          : 'glass-light text-dark-400 hover:text-dark-200 hover:border-dark-600'
                        }
                        border disabled:opacity-50
                      `}
                    >
                      <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={c.icon} />
                      </svg>
                      <span className="text-xs font-medium">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 입력 필드 */}
              {category === 'add' && (
                <div className="space-y-4">
                  <p className="text-sm text-dark-400 bg-dark-800/30 rounded-lg px-3 py-2">
                    <span className="text-amber-400">Tip:</span> 한국어만 입력해서 요청도 가능합니다. 직접 번역해 추가하겠습니다.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      한국어 <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="예: 맥캘란"
                      className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700/50 text-dark-100 placeholder-dark-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all"
                      value={korean}
                      onChange={(e) => setKorean(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">영어</label>
                    <input
                      type="text"
                      placeholder="예: Macallan"
                      className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700/50 text-dark-100 placeholder-dark-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all"
                      value={english}
                      onChange={(e) => setEnglish(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">일본어</label>
                    <input
                      type="text"
                      placeholder="예: マッカラン"
                      className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700/50 text-dark-100 placeholder-dark-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all"
                      value={japanese}
                      onChange={(e) => setJapanese(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}

              {category !== 'add' && (
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    내용 <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    placeholder="내용을 입력하세요"
                    className="w-full h-40 px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700/50 text-dark-100 placeholder-dark-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all resize-none"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* 개인정보 동의 */}
              <div className="glass-light rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    disabled={isSubmitting}
                    className="mt-1 w-4 h-4 rounded border-dark-600 bg-dark-800 text-amber-500 focus:ring-amber-500/50 focus:ring-offset-0"
                  />
                  <span className="text-sm text-dark-400 leading-relaxed">
                    <a 
                      href="/privacy" 
                      target="_blank" 
                      className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
                    >
                      개인정보 처리방침
                    </a>
                    에 동의합니다.
                    <br />
                    <span className="text-dark-500 text-xs">(무분별한 문의를 막기 위한 IP 주소 수집 포함)</span>
                  </span>
                </label>
              </div>

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  w-full py-4 rounded-xl font-semibold text-dark-900
                  bg-gradient-to-r from-amber-400 to-amber-500
                  hover:from-amber-500 hover:to-amber-600
                  disabled:from-dark-600 disabled:to-dark-600 disabled:text-dark-400
                  transition-all duration-200 active:scale-[0.98]
                "
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    제출 중...
                  </span>
                ) : '제출하기'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}

export default ContactPage
