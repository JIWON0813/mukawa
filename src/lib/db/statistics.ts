import { supabase } from '../supabase'

export type SiteType = 'mukawa' | 'yahoo' | 'rakuten' | 'mercari'

export const statistics = {
  /**
   * 검색 성공 시 통계를 업데이트합니다.
   * 동일 키워드가 있으면 해당 사이트 검색수+1, 없으면 새로 생성
   * @param keyword 검색 키워드
   * @param siteType 검색 사이트 (mukawa | yahoo)
   */
  increment: async (keyword: string, siteType: SiteType) => {
    return await supabase.rpc('increment_search_count', { 
      search_keyword: keyword,
      site_type: siteType
    })
  },

  /**
   * 모든 통계를 조회합니다.
   * @returns 통계 목록 (검색수 내림차순)
   */
  getAll: async () => {
    return await supabase
      .from('statistics')
      .select('*')
      .order('search_count', { ascending: false })
  },

  /**
   * 상위 N개의 인기 검색어를 조회합니다.
   * @param limit 조회할 개수
   */
  getTop: async (limit: number = 10) => {
    return await supabase
      .from('statistics')
      .select('keyword, search_count')
      .order('search_count', { ascending: false })
      .limit(limit)
  }
}
