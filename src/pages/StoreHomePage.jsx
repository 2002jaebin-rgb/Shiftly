import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db } from '../supabaseClient'

const weekdays = ['일','월','화','수','목','금','토']

const StoreHomePage = ({ user }) => {
  const { storeId } = useParams()
  const [week, setWeek] = useState(null)
  const [needs, setNeeds] = useState([])
  const [avails, setAvails] = useState([])
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: w } = await db.storeWeeks.getOrCreate(storeId, new Date())
      setWeek(w || null)
      if (w?.id) {
        const [{ data: n }, { data: a }, { data: s }] = await Promise.all([
          db.weekNeeds.list(w.id),
          db.availabilitiesWeekly.listForWeek(w.id),
          db.shiftsWeekly.listForWeek(w.id)
        ])
        setNeeds(n || [])
        setAvails(a || [])
        setShifts(s || [])
      }
      setLoading(false)
    }
    load()
  }, [storeId])

  if (loading) return <p>불러오는 중...</p>
  if (!week) return <p>주 정보를 불러올 수 없습니다.</p>

  const byDay = (arr) => {
    const m = new Map()
    for (let i=0;i<7;i++) m.set(i, [])
    arr.forEach(item => {
      m.get(item.weekday)?.push(item)
    })
    return m
  }

  const needsByDay = byDay(needs)
  const availsByDay = byDay(avails)
  const shiftsByDay = byDay(shifts)

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
          <Link className="px-3 py-2 rounded-lg bg-[#3AC0C3] text-white" to={`/stores/${storeId}/needs`}>수요 관리</Link>
          <Link className="px-3 py-2 rounded-lg bg-gray-800 text-white" to={`/stores/${storeId}/assign`}>배정 관리</Link>
        </div>
      </header>

      {/* 테이블 레이아웃 */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border border-gray-200">구분</th>
              {weekdays.map((label, idx) => (
                <th key={idx} className="px-4 py-2 border border-gray-200 text-center">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* 필요 인원 */}
            <tr>
              <td className="px-4 py-2 font-medium border border-gray-200">필요 인원</td>
              {weekdays.map((_, dow) => (
                <td key={dow} className="px-4 py-2 border border-gray-200 align-top">
                  {(needsByDay.get(dow) || []).length > 0 ? (
                    needsByDay.get(dow).map(n => (
                      <div key={n.id}>
                        {n.start_time}~{n.end_time} · {n.required_staff}명
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">없음</span>
                  )}
                </td>
              ))}
            </tr>

            {/* 제출된 가능 시간 */}
            <tr>
              <td className="px-4 py-2 font-medium border border-gray-200">제출된 가능 시간</td>
              {weekdays.map((_, dow) => (
                <td key={dow} className="px-4 py-2 border border-gray-200 align-top">
                  {(availsByDay.get(dow) || []).length > 0 ? (
                    availsByDay.get(dow).map(a => (
                      <div key={a.id}>
                        {a.user_id.slice(0,8)}… · {a.start_time}~{a.end_time}
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">없음</span>
                  )}
                </td>
              ))}
            </tr>

            {/* 배정 */}
            <tr>
              <td className="px-4 py-2 font-medium border border-gray-200">배정</td>
              {weekdays.map((_, dow) => (
                <td key={dow} className="px-4 py-2 border border-gray-200 align-top">
                  {(shiftsByDay.get(dow) || []).length > 0 ? (
                    shiftsByDay.get(dow).map(s => (
                      <div key={s.id}>
                        {s.user_id.slice(0,8)}… · {s.start_time}~{s.end_time}
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">없음</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-right">
        <Link className="text-[#3AC0C3] hover:underline" to={`/stores/${storeId}/availability`}>
          내 가능 시간 제출하기 →
        </Link>
      </div>
    </div>
  )
}

export default StoreHomePage
