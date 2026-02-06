'use client'

import { FC, useState, ChangeEvent, KeyboardEvent, useEffect } from 'react'

interface SearchBarProps {
  onSearch: (keyword: string) => void
}

const MAX_RECENT_SEARCHES = 5

const SearchBar: FC<SearchBarProps> = ({ onSearch }) => {
  const [searchText, setSearchText] = useState<string>('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isFocused, setIsFocused] = useState<boolean>(false)

  useEffect(() => {
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
      {/* 검색 입력 영역 */}
      <div 
        className={`
          relative flex items-center gap-2 p-2 rounded-2xl
          glass transition-all duration-300
          ${isFocused ? 'glow-amber ring-1 ring-amber-400/50' : 'hover:ring-1 hover:ring-dark-600'}
        `}
      >
        {/* 검색 아이콘 */}
        <div className="pl-3">
          <svg 
            className={`w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-amber-400' : 'text-dark-500'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          type="text"
          value={searchText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="위스키 이름을 입력하세요 (예: 맥캘란, 글렌피딕)"
          className="flex-1 px-2 py-3 bg-transparent text-dark-100 placeholder-dark-500 text-base sm:text-lg focus:outline-none"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        <button
          onClick={handleSearch}
          onTouchEnd={(e) => {
            e.preventDefault()
            handleSearch()
          }}
          className="
            px-6 py-3 rounded-xl font-medium text-dark-900
            bg-gradient-to-r from-amber-400 to-amber-500
            hover:from-amber-500 hover:to-amber-600
            active:scale-95 transition-all duration-200
            touch-manipulation whitespace-nowrap
          "
          type="button"
        >
          검색
        </button>
      </div>

      {/* 최근 검색어 */}
      <div className="glass-light rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-dark-400">최근 검색어</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {recentSearches.length > 0 ? (
            recentSearches.map((keyword, index) => (
              <button
                key={index}
                onClick={() => handleRecentSearchClick(keyword)}
                className="
                  px-4 py-2 rounded-lg text-sm
                  bg-dark-800/50 text-dark-300
                  hover:bg-dark-700/50 hover:text-amber-400
                  border border-dark-700/50 hover:border-amber-400/30
                  transition-all duration-200
                "
              >
                {keyword}
              </button>
            ))
          ) : (
            <p className="text-sm text-dark-600">검색 기록이 없습니다</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchBar
