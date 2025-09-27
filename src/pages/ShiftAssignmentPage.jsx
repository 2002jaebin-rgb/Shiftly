import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db, supabase } from '../supabaseClient'

/**
 * 매니저 전용: 근무 수요(shift_needs) + 직원 availabilities를 보며
 * 특정 슬롯에 직원을 배정(shifts insert)하는 페이지 (수동 배정 MVP)
 *
 * URL: /stores/:storeId/assign
 */
const ShiftAssignmentPage = ({ user }) => {
  const { storeId } = useParams()
  const [role, setRole] = useState(null)

  const [needs, setNeeds] = useState([])
  const [avails, setAvails] = useState([])
  const [shifts, setShifts] = useState([])

  const [members, setMembers] = useState([]) // staff + manager
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 선택 상태
  const [selectedNeedId, setSelectedNeedId] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [overrideDate, setOverrideDate] = useState('')
  const [overrideStart, setOverrideStart] = useState('')
  const [overrideEnd, setOverrideEnd] = useState('')

  // 현재 사용자 role 확인
  const loadRole = async () => {
    const { data, error } = await supabase
      .from('store_members')
      .select('role')
      .eq('store_id', storeId)
      .eq('user_id', user.id)
      .single()
    if (!error && data) setRole(data.role)
  }

  // 데이터 로드
  const loadAll = async () => {
    setLoading(true)
    setError('')

    const { data: needsData, error: needsErr } = await db.shiftNeeds.listForStore(storeId)
    if (needsErr) setError(needsErr.message)

    const { data: avData, error: avErr } = await db.availabilities.listForStore(storeId)
    if (avErr) setError(avErr.message)

    const { data: shData, error: shErr } = await db.shifts.listForStore
      ? await db.shifts.listForStore(storeId)
      : await fetchShiftsFallback(storeId)
    if (shErr) setError(shErr.message)

    const { data: membersData, error: membersErr } = await listMembersForStore(storeId)
    if (membersErr) setError(membersErr.message)

    setNeeds(needsData || [])
    setAvails(avData || [])
    setShifts(shData || [])
    setMembers(membersData || [])
    setLoading(false)
  }

  // shifts listForStore 없을 때 fallback
  const fetchShiftsFallback = async (storeId) => {
    const { data, error } = await supabase
      .from('shifts')
      .select('id, need_id, user_id, date, start_time, end_time')
      .eq('store_id', storeId)
      .order('date', { ascending: true })
    return { data, error }
  }

  // staff + manager 모두 가져오기
  const listMembersForStore = async (storeId) => {
    const { data, error } = await supabase
      .from('store_members')
      .select('user_id, role')
      .eq('store_id', storeId)
      .in('role', ['staff', 'manager'])
    return { data, error }
  }

  useEffect(() => {
    loadRole()
    loadAll()
  }, [storeId])

  const selectedNeed = useMemo(
    () => needs.find(n => String(n.id) === String(selectedNeedId)),
    [needs, selectedNeedId]
  )

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!selectedUserId) return alert('직원을 선택하세요.')

    const date = overrideDate || (selectedNeed?.date ?? '')
    const start = overrideStart || (selectedNeed?.start_time ?? '')
    const end   = overrideEnd   || (selectedNeed?.end_time   ?? '')

    if (!date || !start || !end) return alert('배정할 날짜/시간을 확인하세요.')

    let resp
    if (db.shifts.assign) {
      resp = await db.shifts.assign(storeId, selectedUserId, date, start, end, selectedNeed?.id ?? null)
    } else {
      resp = await supabase
        .from('shifts')
        .insert([{
          store_id: Number(storeId),
          need_id:  selectedNeed?.id ?? null,
          user_id:  selectedUserId,
          date,
          start_time: start,
          end_time:   end
        }])
        .select()
        .single()
    }

    const { error } = resp
    if (error) return alert(error.message)

    setSelectedUserId('')
    await loadAll()
  }

  if (loading) return <p>불러오는 중...</p>

  return (
    <div style={{ maxWidth: 900, margin: '20px auto', display: 'grid', gap: 24 }}>
      <h2>근무 배정 (Store #{storeId})</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* 수요 목록 */}
      <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
        <h3>근무 수요 (shift_needs)</h3>
        {needs.length === 0 ? (
          <p>등록된 수요가 없습니다.</p>
        ) : (
          <ul>
            {needs.map(n => (
              <li key={n.id}
                  style={{
                    padding: 6,
                    background: String(selectedNeedId) === String(n.id) ? '#eef7ff' : 'transparent',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedNeedId(n.id)}
              >
                #{n.id} | {n.date} {n.start_time}~{n.end_time} / {n.required_staff}명 필요
                {n.due_date && <> (마감: {new Date(n.due_date).toLocaleString()})</>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 직원 availabilities */}
      <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
        <h3>직원 가능 시간 (availabilities)</h3>
        {avails.length === 0 ? (
          <p>제출된 가능 시간이 없습니다.</p>
        ) : (
          <ul>
            {avails.map(a => (
              <li key={a.id}>
                {a.user_id} — {a.date} {a.start_time}~{a.end_time}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 배정 폼 */}
      {role === 'manager' ? (
        <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
          <h3>배정하기</h3>
          <form onSubmit={handleAssign} style={{ display: 'grid', gap: 12 }}>
            <div>
              <label>선택한 수요(need): </label>
              <select value={selectedNeedId} onChange={e => setSelectedNeedId(e.target.value)}>
                <option value="">(선택 안 함)</option>
                {needs.map(n => (
                  <option key={n.id} value={n.id}>
                    #{n.id} {n.date} {n.start_time}~{n.end_time}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div>
                <label>직원: </label>
                <select
                  required
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                >
                  <option value="">직원 선택</option>
                  {members.map(m => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.user_id} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>날짜(override): </label>
                <input type="date" value={overrideDate} onChange={e => setOverrideDate(e.target.value)} />
              </div>
              <div>
                <label>시작(override): </label>
                <input type="time" value={overrideStart} onChange={e => setOverrideStart(e.target.value)} />
              </div>
              <div>
                <label>종료(override): </label>
                <input type="time" value={overrideEnd} onChange={e => setOverrideEnd(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">배정</button>
          </form>
        </section>
      ) : (
        <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
          <p>배정 기능은 매니저만 사용할 수 있습니다.</p>
        </section>
      )}

      {/* 확정된 근무표 */}
      <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
        <h3>확정된 근무표 (shifts)</h3>
        {shifts.length === 0 ? (
          <p>아직 배정된 근무가 없습니다.</p>
        ) : (
          <ul>
            {shifts.map(s => (
              <li key={s.id}>
                {s.date} {s.start_time}~{s.end_time} — {s.user_id || '(미배정)'} {s.need_id ? `(need #${s.need_id})` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default ShiftAssignmentPage
