'use client'

import { FC, useState, ChangeEvent, KeyboardEvent, useEffect } from 'react'

interface SearchBarProps {
    onSearch: (keyword: string) => void
}

const MAX_RECENT_SEARCHES = 5

const SearchBar: FC<SearchBarProps> = ({ onSearch }) => {
    const [searchText, setSearchText] = useState<string>('')
    const [recentSearches, setRecentSearches] = useState<string[]>([])

    useEffect(() => {
        // 세션 스토리지에서 최근 검색어 불러오기
        const savedSearches = sessionStorage.getItem('recentSearches')
        if (savedSearches) {
            setRecentSearches(JSON.parse(savedSearches))
        }
    }, [])

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setSearchText(e.target.value)
    }

    const handleSearch = (): void => {
        if (!searchText.trim()) return

        // 최근 검색어 업데이트
        const newRecentSearches = [
            searchText.trim(),
            ...recentSearches.filter(s => s !== searchText.trim())
        ].slice(0, MAX_RECENT_SEARCHES)

        setRecentSearches(newRecentSearches)
        sessionStorage.setItem('recentSearches', JSON.stringify(newRecentSearches))
        onSearch(searchText)
    }

    const handleRecentSearchClick = (keyword: string): void => {
        setSearchText(keyword)
        onSearch(keyword)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={searchText}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="검색어를 입력하세요"
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                />
                <button
                    onClick={handleSearch}
                    onTouchEnd={handleSearch}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors touch-manipulation"
                    type="button"
                >
                    검색
                </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">최근 검색어</h3>
                <div className="flex flex-wrap gap-2">
                    {recentSearches.length > 0 ? (
                        recentSearches.map((keyword, index) => (
                            <button
                                key={index}
                                onClick={() => handleRecentSearchClick(keyword)}
                                className="px-3 py-1 bg-white border rounded-full text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                {keyword}
                            </button>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">최근 검색어가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SearchBar 