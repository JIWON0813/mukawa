'use client'

import { FC, useState, FormEvent, ChangeEvent, useEffect } from 'react'
import { contacts } from '@/lib/db/contacts'

interface Category {
    value: string
    label: string
}

const categories: Category[] = [
    { value: 'add', label: '검색어 추가' },
    { value: 'feature', label: '기능 추가 요청' },
    { value: 'etc', label: '기타' }
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

        // 개인정보 처리방침 동의 확인
        if (!privacyAgreed) {
            setError('개인정보 처리방침에 동의해주세요.')
            setIsSubmitting(false)
            return
        }

        // 필수 입력 필드 검증
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
            // 폼 초기화
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

    const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        setCategory(e.target.value)
    }

    const handleKoreanChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setKorean(e.target.value)
    }

    const handleEnglishChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setEnglish(e.target.value)
    }

    const handleJapaneseChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setJapanese(e.target.value)
    }

    const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
        setContent(e.target.value)
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-white">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-gray-50 p-8 rounded-lg shadow-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">문의하기</h2>
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}
                <label className="block mb-2 font-semibold">카테고리</label>
                <select
                    className="w-full mb-6 p-2 border rounded"
                    value={category}
                    onChange={handleCategoryChange}
                    disabled={isSubmitting}
                >
                    {categories.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                </select>

                {category === 'add' ? (
                    <div className="space-y-4 mb-6">
                        <div>
                            <input
                                type="text"
                                placeholder="한국어 *"
                                className="w-full p-2 border rounded"
                                value={korean}
                                onChange={handleKoreanChange}
                                disabled={isSubmitting}
                            />
                            <p className="text-sm text-gray-500 mt-1">* 필수 입력</p>
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="영어"
                                className="w-full p-2 border rounded"
                                value={english}
                                onChange={handleEnglishChange}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="일본어"
                                className="w-full p-2 border rounded"
                                value={japanese}
                                onChange={handleJapaneseChange}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <textarea
                            placeholder="내용을 입력하세요 *"
                            className="w-full h-40 p-2 border rounded mb-1 resize-none"
                            value={content}
                            onChange={handleContentChange}
                            disabled={isSubmitting}
                        />
                        <p className="text-sm text-gray-500 mb-6">* 필수 입력</p>
                    </div>
                )}

                <div className="mb-6">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={privacyAgreed}
                            onChange={(e) => setPrivacyAgreed(e.target.checked)}
                            disabled={isSubmitting}
                            className="rounded"
                        />
                        <span className="text-sm">
                            <a 
                                href="/privacy" 
                                target="_blank" 
                                className="text-blue-600 hover:underline"
                            >
                                개인정보 처리방침
                            </a>
                            에 동의합니다. (무분별한 문의를 막기 위한 IP 주소 수집 포함)
                        </span>
                    </label>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? '제출 중...' : '제출'}
                </button>
            </form>
        </main>
    )
}

export default ContactPage 