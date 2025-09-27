import { createClient } from '@supabase/supabase-js'

// 환경변수 (Cloudflare Pages에 설정해야 함)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase 환경변수가 설정되지 않았습니다.')
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 인증 관련 함수들
export const auth = {
  // 이메일 + 비밀번호 로그인
  signIn: async (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),

  // 로그아웃
  signOut: async () =>
    supabase.auth.signOut(),

  // 현재 세션 가져오기
  getSession: () =>
    supabase.auth.getSession(),

  // 로그인 상태 변화 감지
  onAuthStateChange: (callback) =>
    supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null)
    }),

  // ✅ 카카오 소셜 로그인
  signInWithKakao: async () =>
    supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    })
}

// (임시) DB 함수 — Dashboard에서 오류 방지용
export const db = {
  // 기존 shifts ...
  shifts: {
    listForUser: async () => {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .order('start_time', { ascending: true })
      return { data, error }
    }
  },

  // ✅ 매장 관련
  stores: {
    create: async (name, userId) => {
      // 1) store 생성
      const { data: store, error: err1 } = await supabase
        .from('stores')
        .insert([{ name, created_by: userId }])
        .select()
        .single()

      if (err1) return { data: null, error: err1 }

      // 2) store_members에 매니저 등록
      const { error: err2 } = await supabase
        .from('store_members')
        .insert([{ store_id: store.id, user_id: userId, role: 'manager' }])

      if (err2) return { data: null, error: err2 }

      return { data: store, error: null }
    },

    listForUser: async (userId) => {
      const { data, error } = await supabase
        .from('store_members')
        .select('store_id, role, stores(name)')
        .eq('user_id', userId)
      return { data, error }
    }
  }
}

