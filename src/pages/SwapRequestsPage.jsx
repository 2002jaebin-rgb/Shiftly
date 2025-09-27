import React, { useState, useEffect } from 'react'
import { db } from '../supabaseClient'

const SwapRequestsPage = ({ user }) => {
  const [swapRequests, setSwapRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSwapRequests()
  }, [])

  const loadSwapRequests = async () => {
    try {
      setLoading(true)
      const { data, error } = await db.swapRequests.getByUserId(user.id)
      
      if (error) {
        setError('교체 요청을 불러오는 중 오류가 발생했습니다.')
        console.error('Error loading swap requests:', error)
      } else {
        setSwapRequests(data || [])
      }
    } catch (err) {
      setError('교체 요청을 불러오는 중 오류가 발생했습니다.')
      console.error('Error loading swap requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const { error } = await db.swapRequests.updateStatus(requestId, newStatus)
      
      if (error) {
        alert('상태 업데이트 중 오류가 발생했습니다.')
        console.error('Error updating status:', error)
      } else {
        // 목록 새로고침
        loadSwapRequests()
      }
    } catch (err) {
      alert('상태 업데이트 중 오류가 발생했습니다.')
      console.error('Error updating status:', err)
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending'
      case 'approved':
        return 'status-approved'
      case 'rejected':
        return 'status-rejected'
      default:
        return ''
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '대기 중'
      case 'approved':
        return '승인됨'
      case 'rejected':
        return '거부됨'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="container">
        <h1>교체 요청</h1>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          로딩 중...
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>교체 요청</h1>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {swapRequests.length === 0 ? (
        <div className="card">
          <p>교체 요청이 없습니다.</p>
        </div>
      ) : (
        <div className="shift-grid">
          {swapRequests.map((request) => (
            <div key={request.id} className="shift-card">
              <h3>교체 요청 #{request.id}</h3>
              <p><strong>상태:</strong> <span className={getStatusClass(request.status)}>{getStatusText(request.status)}</span></p>
              
              {request.shift && (
                <div>
                  <h4>근무 정보</h4>
                  <p><strong>제목:</strong> {request.shift.title || '근무'}</p>
                  <p><strong>날짜:</strong> {formatDate(request.shift.date)}</p>
                  <p><strong>시간:</strong> {formatTime(request.shift.start_time)} - {formatTime(request.shift.end_time)}</p>
                  <p><strong>위치:</strong> {request.shift.location || '미정'}</p>
                </div>
              )}
              
              <div>
                <h4>요청 정보</h4>
                <p><strong>요청자:</strong> {request.requester?.name || request.requester?.email || '알 수 없음'}</p>
                <p><strong>대상자:</strong> {request.target?.name || request.target?.email || '알 수 없음'}</p>
                <p><strong>요청일:</strong> {formatDate(request.created_at)}</p>
                {request.message && (
                  <p><strong>메시지:</strong> {request.message}</p>
                )}
              </div>

              {/* 관리자 권한이 있다면 승인/거부 버튼 표시 */}
              {request.target_id === user.id && request.status === 'pending' && (
                <div style={{ marginTop: '15px' }}>
                  <button 
                    onClick={() => handleStatusUpdate(request.id, 'approved')}
                    className="btn btn-success"
                    style={{ marginRight: '10px' }}
                  >
                    승인
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(request.id, 'rejected')}
                    className="btn btn-danger"
                  >
                    거부
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SwapRequestsPage
