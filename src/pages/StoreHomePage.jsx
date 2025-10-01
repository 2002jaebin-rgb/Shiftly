import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db } from '../supabaseClient'

const weekdays = ['일', '월', '화', '수', '목', '금', '토']

// 시간대 생성 함수 (ex: '09:00' ~ '18:00')
const generateHourSlots = (startStr, endStr) => {
  const slots = []
  const start = parseInt(startStr.split(':')[0], 10)
  const end = parseInt(endStr.split(':')[0], 10)
  for (let hour = start; hour < end; hour++) {
    const label = `${hour.toString().padStart(2, '0')}:00~${(hour + 1).toString().padStart(2, '0')}:00`
    slots.push({ label, hour })
  }
  return slots
}

const StoreHomePage = ({ user }) => {
  const { storeId } = useParams()
  const [week, setWeek] = useState(null)
  const [shifts, setShifts] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) return <p>불러오는 중...</p>
  if (!week || !settings) return <p>주 또는 매장 설정 정보를 불러올 수 없습니다.</p>

  // 요일별 시간 슬롯 생성
  const timeSlotsByDay = weekdays.map((_, idx) => {
    const dayStr = weekdays[idx]
    const openInfo = settings.open_days?.find(d => d.day === dayStr)
    if (!openInfo || !openInfo.open) return [] // 휴무일
    return generateHourSlots(openInfo.start, openInfo.end)
  })

  // 최대 슬롯 길이 (행 수 정렬용)
  const maxSlots = Math.max(...timeSlotsByDay.map(slots => slots.length))

  // 특정 요일+시간에 해당하는 shift 찾기
  const getShiftAt = (dow, hour) => {
    return shifts.find(s => {
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
            {week.due_at ? new Date(week.due_at).toLocaleString() : '설정없음'} · 상태: {week.status}
          </p>
        </div>
        <div className="flex gap-2">
          <Link className="px-3 py-2 rounded-lg bg-[#3AC0C3] text-white" to={`/stores/${storeId}/assign`}>배정 관리</Link>
        </div>
      </header>

      {/* 시간대 기반 테이블 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full text-sm text-center table-fixed border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-24 px-2 py-2 border border-gray-200">시간</th>
              {weekdays.map((day, idx) => (
                <th key={idx} className="px-2 py-2 border border-gray-200">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(maxSlots)].map((_, rowIdx) => (
              <tr key={rowIdx}>
                {/* 시간 라벨 (왼쪽 맨 첫 열) */}
                <td className="px-2 py-1 border border-gray-200 font-medium bg-gray-50 text-left">
                  {
                    // 가장 왼쪽 열은 월요일 기준으로 시간 표시
                    timeSlotsByDay[1][rowIdx]?.label || ''
                  }
                </td>

                {/* 각 요일별 칸 */}
                {weekdays.map((_, dow) => {
                  const slot = timeSlotsByDay[dow][rowIdx]
                  if (!slot) {
                    return <td key={dow} className="border border-gray-200 bg-gray-50" />
                  }

                  const shift = getShiftAt(dow, slot.hour)
                  return (
                    <td key={dow} className="px-1 py-1 border border-gray-200">
                      {shift ? (
                        <div className="bg-teal-100 text-teal-800 rounded px-1 text-xs font-medium">
                          {shift.user_id.slice(0, 8)}…
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">-</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StoreHomePage
