import { supabase } from '../supabase'

interface SearchData {
    keyword: string
    ip_address?: string | null
}

export const search = {
    /**
     * 새로운 검색어를 저장합니다.
     * @param data 검색어 데이터
     * @returns 생성된 검색어 데이터와 에러 정보
     */
    create: async (data: SearchData) => {
        return await supabase
            .from('search')
            .insert([data])
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