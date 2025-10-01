import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../supabaseClient'

const days = ['월', '화', '수', '목', '금', '토', '일']

const CreateStorePage = ({ user }) => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [openDays, setOpenDays] = useState(
    days.map((d) => ({ day: d, open: true, start: '09:00', end: '18:00' }))
  )
  const [deadline, setDeadline] = useState('목') // 기본 목요일
  const [error, setError] = useState('')

  const toggleDay = (index) => {
    const copy = [...openDays]
    copy[index].open = !copy[index].open
    setOpenDays(copy)
  }

  const updateTime = (index, field, value) => {
    const copy = [...openDays]
    copy[index][field] = value
    setOpenDays(copy)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('매장 이름을 입력해주세요.')
      return
    }

    // 1) stores 테이블에 매장 생성
    const { data: store, error: storeError } = await db.stores.create({
      name: name.trim(),
      created_by: user.id   // ← 반드시 추가!
    })    
    if (storeError) {
      console.error('❌ Store creation error:', storeError)
      setError(storeError.message)
      return
    }

    // 2) store_settings 테이블에 추가 정보 저장
    const settingsPayload = {
      store_id: store.id,
      deadline_day: deadline,
      open_days: openDays.map((d) => ({
        day: d.day,
        open: d.open,
        start: d.start,
        end: d.end
      }))
    }

    // 2.5) store_members 테이블에 관리자 본인 추가
    const { error: memberError } = await db.storeMembers.add({
      store_id: store.id,
      user_id: user.id,
      role: 'manager'
    })
    if (memberError) {
      console.error('❌ Member add error:', memberError)
      setError(memberError.message)
      return
    }
    console.log('👤 Store member added:', user.id)

    const { error: settingsError } = await db.storeSettings.create(settingsPayload)
    if (settingsError) {
      console.error('❌ Settings error:', settingsError)
      setError(settingsError.message)
      return
    }

    // 완료 후 대시보드로 이동
    navigate('/dashboard')
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">새 매장 만들기</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 매장 이름 */}
        <div>
          <label className="block font-medium mb-1">매장 이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded-lg"
            required
          />
        </div>

        {/* 요일별 영업시간 */}
        <div>
          <label className="block font-medium mb-2">요일별 영업시간</label>
          <div className="space-y-2">
            {openDays.map((d, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 border-b pb-2 last:border-none"
              >
                <input
                  type="checkbox"
                  checked={d.open}
                  onChange={() => toggleDay(idx)}
                />
                <span className="w-6">{d.day}</span>
                {d.open ? (
                  <>
                    <input
                      type="time"
                      value={d.start}
                      onChange={(e) => updateTime(idx, 'start', e.target.value)}
                      className="border rounded p-1"
                    />
                    ~
                    <input
                      type="time"
                      value={d.end}
                      onChange={(e) => updateTime(idx, 'end', e.target.value)}
                      className="border rounded p-1"
                    />
                  </>
                ) : (
                  <span className="text-gray-400">휴무</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 근무표 마감일 */}
        <div>
          <label className="block font-medium mb-1">근무표 마감 요일</label>
          <select
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full border p-2 rounded-lg"
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            예: 목요일 선택 시 "다음 주 근무표는 전 주 목요일까지 제출 완료"
          </p>
        </div>

        {/* 제출 */}
        <button
          type="submit"
          className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition"
        >
          저장
        </button>
      </form>
    </div>
  )
}

export default CreateStorePage
