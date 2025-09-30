import { createClient } from '@supabase/supabase-js'

// 환경변수
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase env not set')
}

// Supabase 클라이언트
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 인증
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
      options: { redirectTo: window.location.origin + '/dashboard' }
    })
}

// 날짜 헬퍼
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

// DB
export const db = {
  // 기존 shifts (데모)
  shifts: {
    listForUser: async () => {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .order('start_time', { ascending: true })
      return { data, error }
    }
  },

  // 프로필 (가입시 역할 저장/조회)
  profiles: {
    getMine: async () => {
      const { data: userRes } = await supabase.auth.getUser()
      const uid = userRes?.user?.id
      if (!uid) return { data: null, error: { message: 'no user' } }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle()
      return { data, error }
    },
    upsertMine: async ({ display_name, account_role }) => {
      const { data: userRes } = await supabase.auth.getUser()
      const uid = userRes?.user?.id
      if (!uid) return { data: null, error: { message: 'no user' } }
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: uid, display_name, account_role })
        .select()
        .single()
      return { data, error }
    }
  },

  // stores
  stores: {
    create: async (name) => {
      const { data: userRes, error: userErr } = await supabase.auth.getUser()
      if (userErr || !userRes?.user?.id) {
        return {
          data: null,
          error: userErr || { message: '로그인 정보가 없습니다.' }
        }
      }
      const userId = userRes.user.id
      // 1) store
      const { data: store, error: err1 } = await supabase
        .from('stores')
        .insert([{ name }])
        .select()
        .single()
      if (err1) return { data: null, error: err1 }
      // 2) manager membership
      const { error: err2 } = await supabase
        .from('store_members')
        .insert([{ store_id: store.id, user_id: userId, role: 'manager' }])
      if (err2) return { data: null, error: err2 }
      // 3) 기본 설정 레코드
      await supabase.from('store_settings').upsert({ store_id: store.id }) // 기본값으로 생성
      return { data: store, error: null }
    },

    listForUser: async (userId) => {
      const { data: memberships, error } = await supabase
        .from('store_members')
        .select('store_id, role')
        .eq('user_id', userId)
      if (error) return { data: null, error }
      if (!memberships || memberships.length === 0)
        return { data: [], error: null }

      const ids = memberships.map((m) => m.store_id)
      const { data: stores, error: storeError } = await supabase
        .from('stores')
        .select('id, name')
        .in('id', ids)
      if (storeError) return { data: null, error: storeError }

      const merged = memberships.map((m) => ({
        role: m.role,
        store: stores.find((s) => s.id === m.store_id) || null
      }))
      return { data: merged, error: null }
    }
  },

  // store_members
  storeMembers: {
    join: async (storeId, role = 'staff') => {
      const { data: userRes, error: userErr } = await supabase.auth.getUser()
      if (userErr || !userRes?.user?.id) {
        return {
          data: null,
          error: userErr || { message: '로그인 정보가 없습니다.' }
        }
      }
      const userId = userRes.user.id
      const { data, error } = await supabase
        .from('store_members')
        .insert([{ store_id: Number(storeId), user_id: userId, role }])
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
    }
  },

  // ====== 주 단위 ======

  // 매장 설정
  storeSettings: {
    get: async (storeId) => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('store_id', storeId)
        .maybeSingle()
      return { data, error }
    },
    upsert: async (storeId, { open_days, open_hours, due_dow, due_time }) => {
      const payload = { store_id: Number(storeId) }
      if (open_days !== undefined) payload.open_days = open_days
      if (open_hours !== undefined) payload.open_hours = open_hours
      if (due_dow !== undefined) payload.due_dow = due_dow
      if (due_time !== undefined) payload.due_time = due_time
      const { data, error } = await supabase
        .from('store_settings')
        .upsert(payload)
        .select()
        .single()
      return { data, error }
    },
    // ✅ 추가: create 함수 (프론트엔드 호환용)
    create: async (storeId, { open_days, open_hours, due_dow, due_time }) => {
      const payload = { store_id: Number(storeId) }
      if (open_days !== undefined) payload.open_days = open_days
      if (open_hours !== undefined) payload.open_hours = open_hours
      if (due_dow !== undefined) payload.due_dow = due_dow
      if (due_time !== undefined) payload.due_time = due_time
      const { data, error } = await supabase
        .from('store_settings')
        .insert(payload)
        .select()
        .single()
      return { data, error }
    }
  },

  // 주 레코드
  storeWeeks: {
    getOrCreate: async (storeId, anyDateInWeek = new Date()) => {
      const week_start = mondayOf(anyDateInWeek)
      let { data: w, error } = await supabase
        .from('store_weeks')
        .select('*')
        .eq('store_id', storeId)
        .eq('week_start', week_start)
        .maybeSingle()
      if (!w) {
        const { data: setts } = await supabase
          .from('store_settings')
          .select('due_dow, due_time')
          .eq('store_id', storeId)
          .maybeSingle()
        let due_at = null
        if (setts?.due_dow !== undefined && setts?.due_time) {
          const ws = new Date(week_start)
          const dow = setts.due_dow
          const due = new Date(ws)
          const mondayDow = 1
          const target = dow === 0 ? 7 : dow
          const diff = target - mondayDow
          due.setDate(due.getDate() + diff)
          due_at = new Date(`${toISODate(due)}T${setts.due_time}:00Z`)
        }
        const res = await supabase
          .from('store_weeks')
          .insert([{ store_id: Number(storeId), week_start, due_at }])
          .select()
          .single()
        w = res.data
        error = res.error
      }
      return { data: w, error }
    },
    listRecent: async (storeId, limit = 8) => {
      const { data, error } = await supabase
        .from('store_weeks')
        .select('*')
        .eq('store_id', storeId)
        .order('week_start', { ascending: false })
        .limit(limit)
      return { data, error }
    }
  },

  // 주간 수요
  weekNeeds: {
    list: async (store_week_id) => {
      const { data, error } = await supabase
        .from('week_shift_needs')
        .select('*')
        .eq('store_week_id', store_week_id)
        .order('weekday', { ascending: true })
      return { data, error }
    },
    create: async (
      store_week_id,
      weekday,
      start_time,
      end_time,
      required_staff
    ) => {
      const { data, error } = await supabase
        .from('week_shift_needs')
        .insert([
          { store_week_id, weekday, start_time, end_time, required_staff }
        ])
        .select()
        .single()
      return { data, error }
    }
  },

  // 주간 availability
  availabilitiesWeekly: {
    listForWeek: async (store_week_id) => {
      const { data, error } = await supabase
        .from('availabilities')
        .select('id, user_id, weekday, start_time, end_time')
        .eq('store_week_id', store_week_id)
        .order('weekday', { ascending: true })
      return { data, error }
    },
    create: async (storeId, store_week_id, weekday, start_time, end_time) => {
      const { data: userRes } = await supabase.auth.getUser()
      const uid = userRes?.user?.id
      const { data, error } = await supabase
        .from('availabilities')
        .insert([
          {
            store_id: storeId,
            store_week_id,
            user_id: uid,
            weekday,
            start_time,
            end_time
          }
        ])
        .select()
        .single()
      return { data, error }
    }
  },

  // 주간 배정
  shiftsWeekly: {
    listForWeek: async (store_week_id) => {
      const { data, error } = await supabase
        .from('shifts')
        .select('id, user_id, weekday, start_time, end_time')
        .eq('store_week_id', store_week_id)
        .order('weekday', { ascending: true })
      return { data, error }
    },
    assign: async (
      storeId,
      store_week_id,
      weekday,
      user_id,
      start_time,
      end_time
    ) => {
      const { data, error } = await supabase
        .from('shifts')
        .insert([
          {
            store_id: storeId,
            store_week_id,
            weekday,
            user_id,
            start_time,
            end_time
          }
        ])
        .select()
        .single()
      return { data, error }
    }
  },

  // ====== 기존 일 단위 API (레거시 – 유지) ======
  shiftNeeds: {
    listForStore: async (storeId) => {
      const { data, error } = await supabase
        .from('shift_needs')
        .select('*')
        .eq('store_id', storeId)
        .order('date', { ascending: true })
      return { data, error }
    },
    create: async (storeId, date, startTime, endTime, requiredStaff, dueDate) => {
      const { data, error } = await supabase
        .from('shift_needs')
        .insert([
          {
            store_id: storeId,
            date,
            start_time: startTime,
            end_time: endTime,
            required_staff: requiredStaff,
            due_date: dueDate
          }
        ])
        .select()
        .single()
      return { data, error }
    }
  },

  availabilities: {
    listForNeed: async (needId) => {
      const { data, error } = await supabase
        .from('availabilities')
        .select('id, user_id, date, start_time, end_time')
        .eq('need_id', needId)
      return { data, error }
    },
    create: async (storeId, needId, date, startTime, endTime) => {
      const { data: userRes, error: userErr } = await supabase.auth.getUser()
      if (userErr || !userRes?.user?.id) {
        return {
          data: null,
          error: userErr || { message: '로그인 정보가 없습니다.' }
        }
      }
      const userId = userRes.user.id
      const { data, error } = await supabase
        .from('availabilities')
        .insert([
          {
            store_id: storeId,
            need_id: needId,
            user_id: userId,
            date,
            start_time: startTime,
            end_time: endTime
          }
        ])
        .select()
        .single()
      return { data, error }
    }
  }
}
