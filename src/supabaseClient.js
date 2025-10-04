import { createClient } from '@supabase/supabase-js'

// =============================
// 환경변수
// =============================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase env not set')
}

// =============================
// Supabase 클라이언트
// =============================
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// =============================
// 인증
// =============================
export const auth = {
  signIn: async (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),
  signOut: async () => supabase.auth.signOut(),
  getSession: () => supabase.auth.getSession(),
  onAuthStateChange: (callback) =>
    supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null)
    }),
  signInWithKakao: async () =>
    supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: window.location.origin + '/dashboard' },
    }),
}

// =============================
// 날짜 헬퍼
// =============================
const toISODate = (d) =>
  typeof d === 'string' ? d : d.toISOString().slice(0, 10)

const mondayOf = (d) => {
  const dt = new Date(d)
  const day = dt.getDay() // 0=Sun
  const diff = day === 0 ? -6 : 1 - day // Monday start
  dt.setDate(dt.getDate() + diff)
  dt.setHours(0, 0, 0, 0)
  return toISODate(dt)
}

// =============================
// DB API
// =============================
export const db = {
  // ... (기존 profiles, stores 등은 그대로 두고)

  // ---------------------------
  // store_members
  // ---------------------------
  storeMembers: {
    join: async (storeId) => {
      const { data: userRes, error: userErr } = await supabase.auth.getUser()
      if (userErr || !userRes?.user?.id) {
        return {
          data: null,
          error: userErr || { message: '로그인 정보가 없습니다.' },
        }
      }

      const userId = userRes.user.id
      const parsedStoreId = parseInt(storeId, 10)

      const payload = {
        store_id: parsedStoreId,
        user_id: userId,
        role: 'staff', // ✅ 항상 staff으로 가입
      }

      console.log('storeMembers.join payload:', payload)

      const { data, error } = await supabase
        .from('store_members')
        .insert([payload])
        .select()
        .single()

      return { data, error }
    },

    myStores: async () => {
      const { data: userRes } = await supabase.auth.getUser()
      const uid = userRes?.user?.id
      if (!uid) return { data: [], error: null }
      const { data, error } = await supabase
        .from('store_members')
        .select('store_id, role')
        .eq('user_id', uid)
      return { data, error }
    },

    // ✅ 멤버 목록 조회
    listForStore: async (storeId) => {
      const { data, error } = await supabase
        .from('store_members')
        .select('user_id, role, profiles(display_name)')
        .eq('store_id', storeId)
      return { data, error }
    },

    // ✅ 역할 변경
    updateRole: async (storeId, userId, role) => {
      const { data, error } = await supabase
        .from('store_members')
        .update({ role })
        .eq('store_id', storeId)
        .eq('user_id', userId)
        .select()
        .single()
      return { data, error }
    },

    // ✅ 멤버 삭제
    remove: async (storeId, userId) => {
      const { error } = await supabase
        .from('store_members')
        .delete()
        .eq('store_id', storeId)
        .eq('user_id', userId)
      return { error }
    },
  },
}
