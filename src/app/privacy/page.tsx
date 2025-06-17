'use client'

import { FC } from 'react'
import Link from 'next/link'

const PrivacyPage: FC = () => {
    return (
        <main className="min-h-screen p-8 bg-white">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">개인정보 처리방침</h1>
                
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. 수집하는 개인정보 항목</h2>
                    <p className="mb-4">문의하기 기능을 통해 다음과 같은 개인정보를 수집합니다:</p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>IP 주소</li>
                        <li>문의 내용</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">2. 개인정보의 수집 및 이용목적</h2>
                    <p className="mb-4">수집된 개인정보는 다음의 목적을 위해 이용됩니다:</p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>문의사항 처리 및 답변</li>
                        <li>부정이용 방지 및 서비스 개선</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. 개인정보의 보유 및 이용기간</h2>
                    <p className="mb-4">
                        수집된 개인정보는 문의사항 처리 완료 후 1년간 보관되며, 이후 파기됩니다.
                        단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 해당 기간 동안 보관됩니다.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">4. 개인정보의 파기절차 및 방법</h2>
                    <p className="mb-4">
                        보관기간이 경과한 개인정보는 다음과 같은 방법으로 파기됩니다:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>전자적 파일 형태로 저장된 개인정보는 복구할 수 없는 기술적 방법을 사용하여 삭제</li>
                        <li>데이터베이스에 저장된 개인정보는 영구 삭제</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">5. 이용자의 권리와 그 행사방법</h2>
                    <p className="mb-4">
                        이용자는 개인정보 보호법에 따라 다음과 같은 권리를 행사할 수 있습니다:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>개인정보 열람요구</li>
                        <li>오류 등이 있을 경우 정정 요구</li>
                        <li>삭제요구</li>
                        <li>처리정지 요구</li>
                    </ul>
                    <p className="mb-4">
                        위 권리 행사는 <Link href="/contact" className="text-blue-600 hover:underline">문의하기</Link> 페이지의 '기타' 카테고리를 통해 요청하실 수 있습니다.
                        요청 시 본인임을 확인할 수 있는 정보(IP 주소, 문의 내용 등)를 함께 기재해 주시기 바랍니다.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">6. 개인정보 관련 문의</h2>
                    <p className="mb-4">
                        개인정보 처리와 관련한 문의사항이 있으시면 <Link href="/contact" className="text-blue-600 hover:underline">문의하기</Link> 페이지의 '기타' 카테고리를 통해 문의해 주시기 바랍니다.
                        문의하신 내용에 대해 신속하고 충분한 답변을 드리도록 하겠습니다.
                    </p>
                </section>
            </div>
        </main>
    )
}

export default PrivacyPage 