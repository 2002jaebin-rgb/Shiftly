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
  signOut: async () => supabase.auth.signOut(),

  // 현재 세션 가져오기
  getSession: () => supabase.auth.getSession(),

  // 로그인 상태 변화 감지
  onAuthStateChange: (callback) =>
    supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null)
    }),

  // (옵션) 카카오 소셜 로그인 — 현재는 버튼만 남겨두고 계정 정보 연동은 추후
  signInWithKakao: async () =>
    supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    })
}

// DB 함수 모음
export const db = {
  // shifts (MVP 데모용)
  shifts: {
    listForUser: async () => {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .order('start_time', { ascending: true })
      return { data, error }
    }
  },

  // stores (매장)
  stores: {
    // 매장 생성 (created_by는 DB default auth.uid()로 자동 세팅)
    create: async (name) => {
      const { data, error } = await supabase
        .from('stores')
        .insert([{ name }])
        .select()
        .single()
      return { data, error }
    },

    // 내가 속한 매장 목록: join 없이 2단계 조회 → 병합 (RLS 재귀 회피)
    listForUser: async (userId) => {
      // 1) membership
      const { data: memberships, error } = await supabase
        .from('store_members')
        .select('store_id, role')
        .eq('user_id', userId)

      if (error) return { data: null, error }
      if (!memberships || memberships.length === 0) return { data: [], error: null }

      // 2) store info
      const ids = memberships.map(m => m.store_id)
      const { data: stores, error: storeError } = await supabase
        .from('stores')
        .select('id, name')
        .in('id', ids)

      if (storeError) return { data: null, error: storeError }

      // 3) 병합
      const merged = memberships.map(m => ({
        role: m.role,
        store: stores.find(s => s.id === m.store_id) || null
      }))

      return { data: merged, error: null }
    }
  },

  // store_members (매장 합류)
  storeMembers: {
    // 매장 참여 (staff로 자기 자신 추가)
    join: async (storeId, userId) => {
      const payload = { store_id: Number(storeId), user_id: userId, role: 'staff' }
      const { data, error } = await supabase
        .from('store_members')
        .insert([payload])
        .select()
        .single()
      return { data, error }
    }
  }
}
