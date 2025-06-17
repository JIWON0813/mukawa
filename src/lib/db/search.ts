import { supabase } from '../supabase'

interface SearchData {
    keyword: string
    is_fail?: boolean | null
    ip_address?: string | null
}

export const search = {
    /**
     * 새로운 검색어를 저장합니다.
     * @param data 검색어 데이터
     * @returns 생성된 검색어 데이터와 에러 정보
     */
    create: async (data: SearchData) => {
        // KST 시간 설정 (UTC+9)
        const now = new Date()
        const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))

        return await supabase
            .from('search')
            .insert([{ ...data, created_at: kstTime.toISOString() }])
            .select()
    },

    /**
     * 모든 검색어를 조회합니다.
     * @returns 검색어 목록과 에러 정보
     */
    getAll: async () => {
        return await supabase
            .from('search')
            .select('*')
            .order('created_at', { ascending: false })
    }
} 