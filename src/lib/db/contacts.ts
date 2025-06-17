import { supabase } from '../supabase'

interface ContactData {
    category: string
    korean?: string | null
    english?: string | null
    japanese?: string | null
    content?: string | null
    ip_address?: string | null
}

export const contacts = {
    /**
     * 새로운 문의를 생성합니다.
     * @param data 문의 데이터
     * @returns 생성된 문의 데이터와 에러 정보
     */
    create: async (data: ContactData) => {
        // KST 시간 설정 (UTC+9)
        const now = new Date()
        const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))

        return await supabase
            .from('contacts')
            .insert([{ ...data, created_at: kstTime.toISOString() }])
            .select()
    },

    /**
     * 모든 문의를 조회합니다.
     * @returns 문의 목록과 에러 정보
     */
    getAll: async () => {
        return await supabase
            .from('contacts')
            .select('*')
            .order('created_at', { ascending: false })
    },

    /**
     * 특정 카테고리의 문의를 조회합니다.
     * @param category 카테고리
     * @returns 문의 목록과 에러 정보
     */
    getByCategory: async (category: string) => {
        return await supabase
            .from('contacts')
            .select('*')
            .eq('category', category)
            .order('created_at', { ascending: false })
    }
} 