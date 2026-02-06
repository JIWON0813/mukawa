'use client'

import { FC } from 'react'

const ProductList: FC = () => {
  return (
    <div className="animate-slide-up delay-400">
      <div className="glass rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-dark-800 flex items-center justify-center">
          <svg className="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-dark-200 mb-2">
          상품 목록 준비 중
        </h2>
        <p className="text-dark-500 text-sm">
          상품을 한눈에 볼 수 있도록 준비하고 있습니다
        </p>
      </div>
    </div>
  )
}

export default ProductList
