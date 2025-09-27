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

// 임시 db 객체 (기능 없음, 에러 방지용)
export const db = {
  shifts: {
    listForUser: async () => ({ data: [], error: null })
  }
}
