import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db } from '../supabaseClient'
import MemberManagementModal from '../components/MemberManagementModal' // ✅ 추가

const weekdays = ['일', '월', '화', '수', '목', '금', '토']

// store_settings.open_hours 기반(없으면 08~23 기본)으로 1시간 슬롯 생성
const generateHourSlots = (settings) => {
  const pad = (n) => n.toString().padStart(2, '0')
  let startH = 8,
    endH = 23 // 기본 범위

  const oh = settings?.open_hours
  if (Array.isArray(oh) && oh.length > 0) {
    const toMin = (t) => {
      if (!t || typeof t !== 'string' || !t.includes(':')) return null
      const [h, m] = t.split(':').map(Number)
      return h * 60 + (m || 0)
    }
    const starts = oh.map((d) => toMin(d.start)).filter((v) => typeof v === 'number')
    const ends = oh.map((d) => toMin(d.end)).filter((v) => typeof v === 'number')
    if (starts.length && ends.length) {
      startH = Math.floor(Math.min(...starts) / 60)
      endH = Math.ceil(Math.max(...ends) / 60)
      if (startH === endH) endH = startH + 1
    }
  }

  const slots = []
  for (let h = startH; h < endH; h++) {
    slots.push({ label: `${pad(h)}:00~${pad(h + 1)}:00`, hour: h })
  }
  return slots
}

const StoreHomePage = ({ user }) => {
  const { storeId } = useParams()
  const [week, setWeek] = useState(null)
  const [shifts, setShifts] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  // ✅ 추가: 내 역할 & 모달 표시 상태
  const [myRole, setMyRole] = useState(null)
  const [showMemberModal, setShowMemberModal] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      const { data: w } = await db.storeWeeks.getOrCreate(storeId, new Date())
      setWeek(w || null)

      const { data: s } = await db.shiftsWeekly.listForWeek(w?.id)
      setShifts(s || [])

      const { data: setting } = await db.storeSettings.get(storeId)
      setSettings(setting || null)

      setLoading(false)
    }
    load()
  }, [storeId])

  // ✅ 추가: 내 멤버십 역할 불러오기 (manager만 멤버 관리 버튼 보이도록)
  useEffect(() => {
    const fetchRole = async () => {
      const { data: memberships } = await db.storeMembers.myStores()
      const me = memberships?.find((m) => String(m.store_id) === String(storeId))
      setMyRole(me?.role || null)
    }
    fetchRole()
  }, [storeId])

  if (loading) return <p>불러오는 중...</p>
  if (!week || !settings) return <p>주 또는 매장 설정 정보를 불러올 수 없습니다.</p>

  // 전체 운영시간 기준으로 공통 슬롯 생성
  const baseSlots = generateHourSlots(settings)
  const timeSlotsByDay = weekdays.map(() => baseSlots) // eslint 경고 방지용 남김 (사용 X)

  // 특정 요일+시간에 해당하는 shift 찾기
  const getShiftAt = (dow, hour) => {
    return shifts.find((s) => {
      if (s.weekday !== dow) return false
      const startH = parseInt(s.start_time.split(':')[0], 10)
      const endH = parseInt(s.end_time.split(':')[0], 10)
      return hour >= startH && hour < endH
    })
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">이번 주 근무표</h2>
          <p className="text-gray-500 text-sm">
            주 시작: {week.week_start} · 마감:{' '}
            {week.due_at ? new Date(week.due_at).toLocaleString() : '설정없음'} · 상태:{' '}
            {week.status}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            className="px-3 py-2 rounded-lg bg-[#3AC0C3] text-white"
            to={`/stores/${storeId}/assign`}
          >
            배정 관리
          </Link>

          {/* ✅ 추가: 매니저일 때만 멤버 관리 버튼 노출 */}
          {myRole === 'manager' && (
            <button
              onClick={() => setShowMemberModal(true)}
              className="px-3 py-2 rounded-lg bg-gray-600 text-white"
            >
              멤버 관리
            </button>
          )}
        </div>
      </header>

      {/* 시간대 기반 테이블 (원본 유지) */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full text-sm text-center table-fixed border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-24 px-2 py-2 border border-gray-200">시간</th>
              {weekdays.map((day, idx) => (
                <th key={idx} className="px-2 py-2 border border-gray-200">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {baseSlots.map((slot, rowIdx) => (
              <tr key={rowIdx}>
                {/* 시간 라벨 */}
                <td className="px-2 py-1 border border-gray-200 font-medium bg-gray-50 text-left">
                  {slot.label}
                </td>

                {/* 요일별 칸 */}
                {weekdays.map((_, dow) => {
                  const openDay = settings.open_days?.[dow] ?? false
                  const openInfo = settings.open_hours?.find(
                    (d) => d.day === weekdays[dow]
                  )

                  let isOpen = openDay
                  if (isOpen && openInfo) {
                    const startH = parseInt(openInfo.start.split(':')[0], 10)
                    const endH = parseInt(openInfo.end.split(':')[0], 10)
                    isOpen = slot.hour >= startH && slot.hour < endH
                  }

                  const shift = isOpen ? getShiftAt(dow, slot.hour) : null

                  return (
                    <td
                      key={dow}
                      className={`px-1 py-1 border border-gray-200 ${
                        !isOpen ? 'bg-gray-200' : ''
                      }`}
                    >
                      {isOpen ? (
                        shift ? (
                          <div className="bg-teal-100 text-teal-800 rounded px-1 text-xs font-medium">
                            {shift.user_id.slice(0, 8)}…
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">-</span>
                        )
                      ) : (
                        <span className="text-gray-400 text-xs">휴무</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ 추가: 멤버 관리 모달 */}
      {showMemberModal && (
        <MemberManagementModal
          storeId={storeId}
          onClose={() => setShowMemberModal(false)}
        />
      )}
    </div>
  )
}

export default StoreHomePage
