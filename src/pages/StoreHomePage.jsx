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
            주 시작: {week.week_start} · 마감: {week.due_at ? new Date(week.due_at).toLocaleString() : '설정없음'} · 상태: {week.status}
          </p>
        </div>
        <div className="flex gap-2">
          <Link className="px-3 py-2 rounded-lg bg-[#3AC0C3] text-white" to={`/stores/${storeId}/needs`}>수요 관리</Link>
          <Link className="px-3 py-2 rounded-lg bg-gray-800 text-white" to={`/stores/${storeId}/assign`}>배정 관리</Link>
        </div>
      </header>

      {/* 가로 7열로 요일 쭉 나열 */}
      <div className="grid grid-cols-7 gap-4 overflow-x-auto">
        {weekdays.map((label, dow) => (
          <div key={dow} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 min-h-[200px]">
            <h3 className="font-semibold text-gray-800 mb-2 text-center">{label}</h3>

            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-1">필요 인원</p>
                {(needsByDay.get(dow) || []).map(n => (
                  <div key={n.id} className="text-gray-700">
                    {n.start_time}~{n.end_time} · {n.required_staff}명
                  </div>
                ))}
                {(!needsByDay.get(dow) || needsByDay.get(dow).length===0) && (
                  <p className="text-xs text-gray-400">없음</p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">제출된 가능 시간</p>
                {(availsByDay.get(dow) || []).map(a => (
                  <div key={a.id} className="text-gray-600">
                    {a.user_id.slice(0,8)}… · {a.start_time}~{a.end_time}
                  </div>
                ))}
                {(!availsByDay.get(dow) || availsByDay.get(dow).length===0) && (
                  <p className="text-xs text-gray-400">없음</p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">배정</p>
                {(shiftsByDay.get(dow) || []).map(s => (
                  <div key={s.id} className="text-gray-800">
                    {s.user_id.slice(0,8)}… · {s.start_time}~{s.end_time}
                  </div>
                ))}
                {(!shiftsByDay.get(dow) || shiftsByDay.get(dow).length===0) && (
                  <p className="text-xs text-gray-400">없음</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-right">
        <Link className="text-[#3AC0C3] hover:underline" to={`/stores/${storeId}/availability`}>내 가능 시간 제출하기 →</Link>
      </div>
    </div>
  )
}

export default StoreHomePage
