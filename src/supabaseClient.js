import { createClient } from '@supabase/supabase-js'

// 환경변수 (Cloudflare Pages에서 설정 필요)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 로그인 / 로그아웃 관련 간단한 함수들
export const auth = {
  // 이메일 + 비밀번호 로그인
  signIn: async (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),

  // 로그아웃
  signOut: async () =>
    supabase.auth.signOut(),

  // 현재 로그인 세션 불러오기
  getSession: () =>
    supabase.auth.getSession(),

  // 로그인 상태 변경 감지 (로그인 / 로그아웃)
  onAuthStateChange: (callback) =>
    supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null)
    }),
}

// DB 관련 간단한 함수들
export const db = {
  shifts: {
    // 특정 사용자의 시프트 목록 불러오기
    listForUser: async (userId) => {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .order('start_time', { ascending: true })

      // 일단 전체 shifts 불러오기 → 나중에 userId로 필터링 확장
      return { data, error }
    }
  }
}
