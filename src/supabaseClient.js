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

  // (옵션) 카카오 소셜 로그인
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
    // ✅ 매장 생성: created_by는 DB default(auth.uid()), 그리고
    //    현재 로그인 유저를 manager로 store_members에 자동 등록
    create: async (name) => {
      // 현재 로그인 사용자
      const { data: userRes, error: userErr } = await supabase.auth.getUser()
      if (userErr || !userRes?.user?.id) {
        return { data: null, error: userErr || { message: '로그인 정보가 없습니다.' } }
      }
      const userId = userRes.user.id

      // 1) store 생성
      const { data: store, error: err1 } = await supabase
        .from('stores')
        .insert([{ name }]) // created_by는 DB default auth.uid()로 자동 세팅
        .select()
        .single()

      if (err1) return { data: null, error: err1 }

      // 2) 매니저 자신을 store_members에 추가 (RLS: user_id=auth.uid() 조건 충족)
      const { error: err2 } = await supabase
        .from('store_members')
        .insert([{ store_id: store.id, user_id: userId, role: 'manager' }])

      if (err2) return { data: null, error: err2 }

      return { data: store, error: null }
    },

    // 내가 속한 매장 목록 (RLS 재귀 방지를 위해 2단계 조회)
    listForUser: async (userId) => {
      // 1) membership
      const { data: memberships, error } = await supabase
        .from('store_members')
        .select('store_id, role')
        .eq('user_id', userId)

      if (error) return { data: null, error }
      if (!memberships || memberships.length === 0) return { data: [], error: null }

      // 2) stores
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
    // 직원으로 참여
    join: async (storeId) => {
      const { data: userRes, error: userErr } = await supabase.auth.getUser()
      if (userErr || !userRes?.user?.id) {
        return { data: null, error: userErr || { message: '로그인 정보가 없습니다.' } }
      }
      const userId = userRes.user.id

      const payload = { store_id: Number(storeId), user_id: userId, role: 'staff' }
      const { data, error } = await supabase
        .from('store_members')
        .insert([payload])
        .select()
        .single()
      return { data, error }
    }
  },

  shiftNeeds: {
    // 매장별 필요 인원 조회
    listForStore: async (storeId) => {
      const { data, error } = await supabase
        .from('shift_needs')
        .select('*')
        .eq('store_id', storeId)
        .order('date', { ascending: true })
      return { data, error }
    },

    // 필요 인원 등록 (매니저 전용)
    create: async (storeId, date, startTime, endTime, requiredStaff, dueDate) => {
      const { data, error } = await supabase
        .from('shift_needs')
        .insert([{
          store_id: storeId,
          date,
          start_time: startTime,
          end_time: endTime,
          required_staff: requiredStaff,
          due_date: dueDate
        }])
        .select()
        .single()
      return { data, error }
    }
  }
}
