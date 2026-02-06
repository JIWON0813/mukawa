import { supabase } from '../supabase'

interface SearchFailData {
  keyword: string
  ip_address?: string | null
}

export const search = {
  /**
   * 검색 실패 시 검색어를 저장합니다.
   * @param data 검색어 데이터
   * @returns 생성된 검색어 데이터와 에러 정보
   */
  createFail: async (data: SearchFailData) => {
    // KST 시간 설정 (UTC+9)
    const now = new Date()
    const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))

    return await supabase
      .from('search')
      .insert([{ ...data, is_fail: true, created_at: kstTime.toISOString() }])
      .select()
  },

  /**
   * 모든 실패 검색어를 조회합니다.
   * @returns 검색어 목록과 에러 정보
   */
  getAllFails: async () => {
    return await supabase
      .from('search')
      .select('*')
      .eq('is_fail', true)
      .order('created_at', { ascending: false })
  }
} 