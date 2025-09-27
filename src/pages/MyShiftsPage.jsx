import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../supabaseClient'

const MyShiftsPage = ({ user }) => {
  const { storeId } = useParams()
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadShifts = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error } = await db.shifts.listForUserInStore(storeId, user.id)
      if (error) setError(error.message)
      setShifts(data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadShifts()
  }, [storeId, user.id])

  if (loading) return <p>불러오는 중...</p>

  return (
    <div style={{ maxWidth: 600, margin: '20px auto' }}>
      <h2>내 근무표</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {shifts.length === 0 ? (
        <p>아직 배정된 근무가 없습니다.</p>
      ) : (
        <ul>
          {shifts.map(s => (
            <li key={s.id}>
              {s.date} {s.start_time}~{s.end_time}
              {s.need_id && <> (need #{s.need_id})</>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MyShiftsPage
