import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../supabaseClient'

const DashboardPage = ({ user }) => {
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadShifts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadShifts = async () => {
    try {
      setLoading(true)
      setError('')
      // 프로젝트 헬퍼 사용: 본인 시프트만
      const { data, error } = await db.shifts.getByUserId(user.id)
      if (error) throw error
      setShifts(data || [])
    } catch (err) {
      console.error(err)
      setError('근무표를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const formatRange = (row) => {
    // 스키마가 TIMESTAMP 또는 DATE+TIME일 수 있으므로 모두 처리
    const hasISO = (v) => typeof v === 'string' && v.includes('T')

    if (row.start_time && hasISO(row.start_time)) {
      // TIMESTAMP 케이스
      const s = new Date(row.start_time)
      const e = new Date(row.end_time)
      const dateStr = s.toLocaleDateString()
      const sTime = s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const eTime = e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      return `${dateStr} ${sTime} ~ ${eTime}`
    }

    // DATE + TIME 케이스
    const d = row.date || ''
    const sTime = row.start_time || ''
    const eTime = row.end_time || ''
    return `${d} ${sTime} ~ ${eTime}`
  }

  if (loading) return <div>근무표 불러오는 중…</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  if (!shifts.length) {
    return <div>등록된 근무표가 없습니다.</div>
  }

  return (
    <div>
      <h2>내 근무표</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {shifts.map((shift) => (
          <div key={shift.id} style={{ border: '1px solid #ddd', borderRadius: 6, padding: 12 }}>
            <div><strong>근무</strong></div>
            <div>{formatRange(shift)}</div>
            <div>상태: {shift.status}</div>
            <Link to={`/shift/${shift.id}`} className="btn btn-primary" style={{ marginTop: 8 }}>
              상세보기
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardPage
