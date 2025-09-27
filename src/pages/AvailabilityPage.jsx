import React, { useState, useEffect } from 'react'
import { db } from '../supabaseClient'
import { useParams } from 'react-router-dom'

const AvailabilityPage = ({ user }) => {
  const { storeId, needId } = useParams()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // 입력 상태
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const loadAvailabilities = async () => {
    setLoading(true)
    const { data, error } = await db.availabilities.listForNeed(needId)
    if (error) setError(error.message)
    setList(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadAvailabilities()
  }, [needId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { error } = await db.availabilities.create(
      storeId,
      needId,
      date,
      startTime,
      endTime
    )
    if (error) {
      alert(error.message)
    } else {
      setDate('')
      setStartTime('')
      setEndTime('')
      await loadAvailabilities()
    }
  }

  if (loading) return <p>불러오는 중...</p>

  return (
    <div style={{ maxWidth: 600, margin: '20px auto' }}>
      <h2>근무 가능 시간 제출</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {list.map((a) => (
          <li key={a.id}>
            {a.user_id}: {a.date} {a.start_time}~{a.end_time}
          </li>
        ))}
      </ul>

      {/* staff 입력 폼 */}
      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <h3>내 가능 시간 제출</h3>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary" style={{ marginLeft: 8 }}>
          제출
        </button>
      </form>
    </div>
  )
}

export default AvailabilityPage
