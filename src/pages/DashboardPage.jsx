import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../supabaseClient'

const DashboardPage = ({ user }) => {
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      const { data, error } = await db.shifts.listForUser(user.id)
      if (error) setError(error.message || '시프트 로드 실패')
      setShifts(data || [])
      setLoading(false)
    }
    load()
  }, [user.id])

  if (loading) return <div>불러오는 중...</div>
  if (error) return <div className="alert alert-error">{error}</div>
  if (!shifts.length) return <div>예정된 시프트가 없습니다.</div>

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>내 시프트</h2>
      <div className="card-list">
        {shifts.map((row) => (
          <div className="card" key={row.id}>
            <h3>{row.title}</h3>
            <p>{new Date(row.start_time).toLocaleString()} ~ {new Date(row.end_time).toLocaleString()}</p>
            {row.location && <p>장소: {row.location}</p>}
            <Link to={`/shift/${row.id}`} className="btn btn-primary" style={{ marginTop: 10 }}>
              상세보기
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardPage
