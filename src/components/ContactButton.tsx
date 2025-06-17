import { useRouter } from 'next/navigation'

export default function ContactButton() {
    const router = useRouter()
    return (
        <button
            onClick={() => router.push('/contact')}
            className="fixed bottom-8 right-8 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        >
            문의
        </button>
    )
} 