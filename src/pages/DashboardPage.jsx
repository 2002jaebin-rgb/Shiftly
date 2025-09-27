import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../supabaseClient'

const DashboardPage = ({ user }) => {
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadShifts()
  }, [])

  const loadShifts = async () => {
    try {
      setLoading(true)
      const { data, error } = await db.shifts.getByUserId(user.id)
      
      if (error) {
        setError('시프트를 불러오는 중 오류가 발생했습니다.')
        console.error('Error loading shifts:', error)
      } else {
        setShifts(data || [])
      }
    } catch (err) {
      setError('시프트를 불러오는 중 오류가 발생했습니다.')
      console.error('Error loading shifts:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const formatTime = (timeString) => {
    return timeString || '시간 미정'
  }

  if (loading) {
    return (
      <div className="container">
        <h1>내 근무표</h1>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          로딩 중...
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>내 근무표</h1>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {shifts.length === 0 ? (
        <div className="card">
          <p>아직 할당된 근무가 없습니다.</p>
        </div>
      ) : (
        <div className="shift-grid">
          {shifts.map((shift) => (
            <div key={shift.id} className="shift-card">
              <h3>{shift.title || '근무'}</h3>
              <p><strong>날짜:</strong> {formatDate(shift.date)}</p>
              <p><strong>시작 시간:</strong> {formatTime(shift.start_time)}</p>
              <p><strong>종료 시간:</strong> {formatTime(shift.end_time)}</p>
              <p><strong>위치:</strong> {shift.location || '미정'}</p>
              {shift.notes && (
                <p><strong>메모:</strong> {shift.notes}</p>
              )}
              <Link 
                to={`/shift/${shift.id}`} 
                className="btn btn-primary"
                style={{ marginTop: '10px' }}
              >
                상세보기
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DashboardPage
