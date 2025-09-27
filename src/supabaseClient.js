import { createClient } from '@supabase/supabase-js'

// Supabase 설정
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 인증 관련 함수들
export const auth = {
  // 로그인
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // 로그아웃
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // 현재 사용자 가져오기
  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  // 인증 상태 변경 감지
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// 데이터베이스 관련 함수들
export const db = {
  // 시프트 관련
  shifts: {
    // 모든 시프트 가져오기
    getAll: async () => {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .order('date', { ascending: true })
      return { data, error }
    },

    // 특정 사용자의 시프트 가져오기
    getByUserId: async (userId) => {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('employee_id', userId)
        .order('date', { ascending: true })
      return { data, error }
    },

    // 시프트 생성
    create: async (shiftData) => {
      const { data, error } = await supabase
        .from('shifts')
        .insert([shiftData])
        .select()
      return { data, error }
    },

    // 시프트 업데이트
    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('shifts')
        .update(updates)
        .eq('id', id)
        .select()
      return { data, error }
    },

    // 시프트 삭제
    delete: async (id) => {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', id)
      return { error }
    }
  },

  // 교체 요청 관련
  swapRequests: {
    // 모든 교체 요청 가져오기
    getAll: async () => {
      const { data, error } = await supabase
        .from('swap_requests')
        .select(`
          *,
          shift:shifts(*),
          requester:users!swap_requests_requester_id_fkey(*),
          target:users!swap_requests_target_id_fkey(*)
        `)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    // 특정 사용자의 교체 요청 가져오기
    getByUserId: async (userId) => {
      const { data, error } = await supabase
        .from('swap_requests')
        .select(`
          *,
          shift:shifts(*),
          requester:users!swap_requests_requester_id_fkey(*),
          target:users!swap_requests_target_id_fkey(*)
        `)
        .or(`requester_id.eq.${userId},target_id.eq.${userId}`)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    // 교체 요청 생성
    create: async (requestData) => {
      const { data, error } = await supabase
        .from('swap_requests')
        .insert([requestData])
        .select()
      return { data, error }
    },

    // 교체 요청 상태 업데이트
    updateStatus: async (id, status) => {
      const { data, error } = await supabase
        .from('swap_requests')
        .update({ status })
        .eq('id', id)
        .select()
      return { data, error }
    }
  },

  // 사용자 관련
  users: {
    // 모든 사용자 가져오기
    getAll: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name')
      return { data, error }
    },

    // 특정 사용자 가져오기
    getById: async (id) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    }
  }
}
