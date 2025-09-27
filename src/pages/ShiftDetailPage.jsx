import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '../supabaseClient'

const ShiftDetailPage = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [shift, setShift] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSwapForm, setShowSwapForm] = useState(false)
  const [targetUserId, setTargetUserId] = useState('')
  const [users, setUsers] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadShift()
    loadUsers()
  }, [id])

  const loadShift = async () => {
    try {
      setLoading(true)
      const { data, error } = await db.shifts.getAll()
      
      if (error) {
        setError('시프트를 불러오는 중 오류가 발생했습니다.')
        console.error('Error loading shift:', error)
      } else {
        const foundShift = data?.find(s => s.id === parseInt(id))
        if (foundShift) {
          setShift(foundShift)
        } else {
          setError('시프트를 찾을 수 없습니다.')
        }
      }
    } catch (err) {
      setError('시프트를 불러오는 중 오류가 발생했습니다.')
      console.error('Error loading shift:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await db.users.getAll()
      if (!error && data) {
        // 현재 사용자 제외
        setUsers(data.filter(u => u.id !== user.id))
      }
    } catch (err) {
      console.error('Error loading users:', err)
    }
  }

  const handleSwapRequest = async (e) => {
    e.preventDefault()
    if (!targetUserId) return

    setSubmitting(true)
    try {
      const swapData = {
        shift_id: parseInt(id),
        requester_id: user.id,
        target_id: targetUserId,
        status: 'pending',
        message: `교체 요청: ${shift?.title || '근무'}`
      }

      const { data, error } = await db.swapRequests.create(swapData)
      
      if (error) {
        alert('교체 요청 생성 중 오류가 발생했습니다.')
        console.error('Error creating swap request:', error)
      } else {
        alert('교체 요청이 성공적으로 전송되었습니다.')
        navigate('/swap-requests')
      }
    } catch (err) {
      alert('교체 요청 생성 중 오류가 발생했습니다.')
      console.error('Error creating swap request:', err)
    } finally {
      setSubmitting(false)
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
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          로딩 중...
        </div>
      </div>
    )
  }

  if (error || !shift) {
    return (
      <div className="container">
        <h1>시프트 상세</h1>
        <div style={{ color: 'red' }}>
          {error || '시프트를 찾을 수 없습니다.'}
        </div>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="btn btn-secondary"
          style={{ marginTop: '20px' }}
        >
          대시보드로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>시프트 상세</h1>
      
      <div className="card">
        <h2>{shift.title || '근무'}</h2>
        <p><strong>날짜:</strong> {formatDate(shift.date)}</p>
        <p><strong>시작 시간:</strong> {formatTime(shift.start_time)}</p>
        <p><strong>종료 시간:</strong> {formatTime(shift.end_time)}</p>
        <p><strong>위치:</strong> {shift.location || '미정'}</p>
        {shift.notes && (
          <p><strong>메모:</strong> {shift.notes}</p>
        )}
        
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => setShowSwapForm(!showSwapForm)}
            className="btn btn-primary"
          >
            {showSwapForm ? '교체 요청 취소' : '교체 요청하기'}
          </button>
        </div>

        {showSwapForm && (
          <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>교체 요청</h3>
            <form onSubmit={handleSwapRequest}>
              <div className="form-group">
                <label className="form-label">교체할 직원 선택</label>
                <select
                  className="form-input"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  required
                >
                  <option value="">직원을 선택하세요</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={submitting}
              >
                {submitting ? '요청 중...' : '교체 요청 전송'}
              </button>
            </form>
          </div>
        )}
      </div>

      <button 
        onClick={() => navigate('/dashboard')} 
        className="btn btn-secondary"
      >
        대시보드로 돌아가기
      </button>
    </div>
  )
}

export default ShiftDetailPage
