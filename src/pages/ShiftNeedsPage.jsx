import React, { useState, useEffect } from 'react'
import { db, supabase } from '../supabaseClient'
import { useParams } from 'react-router-dom'

const ShiftNeedsPage = ({ user }) => {
  const { storeId } = useParams()
  const [needs, setNeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [role, setRole] = useState(null) // ✅ 유저 권한 저장

  // 입력 상태
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [requiredStaff, setRequiredStaff] = useState(1)
  const [dueDate, setDueDate] = useState('')

  // 매장 근무 필요 인원 불러오기
  const loadNeeds = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await db.shiftNeeds.listForStore(storeId)
    if (error) setError(error.message)
    setNeeds(data || [])
    setLoading(false)
  }

  // 현재 유저의 role 확인
  const loadRole = async () => {
    const { data, error } = await supabase
      .from('store_members')
      .select('role')
      .eq('store_id', storeId)
      .eq('user_id', user.id)
      .single()

    if (!error && data) {
      setRole(data.role)
    }
  }

  useEffect(() => {
    loadNeeds()
    loadRole()
  }, [storeId])

  const handleCreate = async (e) => {
    e.preventDefault()
    const { error } = await db.shiftNeeds.create(
      storeId,
      date,
      startTime,
      endTime,
      requiredStaff,
      dueDate
    )
    if (error) {
      alert(error.message)
    } else {
      setDate('')
      setStartTime('')
      setEndTime('')
      setRequiredStaff(1)
      setDueDate('')
      await loadNeeds()
    }
  }

  if (loading) return <p>불러오는 중...</p>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">근무 필요 인원</h2>
      {error && <p className="text-red-500">{error}</p>}

      {/* 근무 필요 인원 리스트 */}
      <div className="space-y-3">
        {needs.length === 0 ? (
          <p className="text-gray-500">아직 등록된 근무 필요 인원이 없습니다.</p>
        ) : (
          needs.map((n) => (
            <div
              key={n.id}
              className="bg-white shadow-sm rounded-xl p-4 border border-gray-100"
            >
              <p className="text-gray-800 font-medium">
                {n.date} {n.start_time} ~ {n.end_time}
              </p>
              <p className="text-sm text-gray-500">
                필요 인원: {n.required_staff}명
              </p>
              <p className="text-sm text-gray-400">
                마감일: {n.due_date ? new Date(n.due_date).toLocaleString() : '없음'}
              </p>
            </div>
          ))
        )}
      </div>

      {/* ✅ 매니저만 등록 폼 보이게 */}
      {role === 'manager' && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-800">새 필요 인원 추가</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3AC0C3] focus:outline-none"
            />
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3AC0C3] focus:outline-none"
            />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3AC0C3] focus:outline-none"
            />
            <input
              type="number"
              min="1"
              value={requiredStaff}
              onChange={(e) => setRequiredStaff(e.target.value)}
              required
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3AC0C3] focus:outline-none"
            />
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3AC0C3] focus:outline-none sm:col-span-2"
            />
          </div>
          <button
            type="submit"
            className="bg-[#3AC0C3] text-white px-4 py-2 rounded-lg shadow hover:bg-[#2FA6A9] transition"
          >
            등록
          </button>
        </form>
      )}
    </div>
  )
}

export default ShiftNeedsPage
