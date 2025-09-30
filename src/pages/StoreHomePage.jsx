import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db } from '../supabaseClient'

const weekdays = ['일', '월', '화', '수', '목', '금', '토']

// 08:00 ~ 23:00 시간 슬롯 생성
const generateHourSlots = () => {
  const slots = []
  for (let hour = 8; hour < 23; hour++) {
    const start = hour.toString().padStart(2, '0') + ':00'
    const end = (hour + 1).toString().padStart(2, '0') + ':00'
    slots.push({ label: `${start}~${end}`, hour })  // hour 기준으로 매핑
  }
  return slots
}

const StoreHomePage = ({ user }) => {
  const { storeId } = useParams()
  const [week, setWeek] = useState(null)
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: w } = await db.storeWeeks.getOrCreate(storeId, new Date())
      setWeek(w || null)
      if (w?.id) {
        const { data: s } = await db.shiftsWeekly.listForWeek(w.id)
        setShifts(s || [])
      }
      setLoading(false)
    }
    load()
  }, [storeId])

  if (loading) return <p>불러오는 중...</p>
  if (!week) return <p>주 정보를 불러올 수 없습니다.</p>

  const timeSlots = generateHourSlots()

  // 각 셀에 맞는 shift를 매핑
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

      {/* 시간대 테이블 */}
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
            {timeSlots.map(({ label, hour }) => (
              <tr key={label}>
                <td className="px-2 py-1 border border-gray-200 font-medium bg-gray-50 text-left">{label}</td>
                {weekdays.map((_, dow) => {
                  const shift = getShiftAt(dow, hour)
                  return (
                    <td key={`${dow}-${hour}`} className="px-1 py-1 border border-gray-200">
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
