import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, db } from '../supabaseClient'

const DashboardPage = ({ user }) => {
  const navigate = useNavigate()
  const [role, setRole] = useState(null)
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)

  // 로그인한 사용자 역할 불러오기
  const loadProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('account_role')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error(error)
      return
    }
    setRole(data.account_role)
  }

  // 로그인한 사용자의 매장 불러오기
  const loadStores = async () => {
    const { data, error } = await db.stores.listForUser(user.id)
    if (error) {
      console.error(error)
      return
    }
    setStores(data || [])
  }

  useEffect(() => {
    const init = async () => {
      await loadProfile()
      await loadStores()
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!loading && role === 'staff') {
      if (!stores || stores.length === 0) {
        // staff이고 매장에 소속되지 않은 경우 → 매장 참가 페이지로 이동
        navigate('/stores/join')
      } else {
        // staff이고 매장이 있는 경우 → 첫 번째 매장의 기본 페이지로 이동
        navigate(`/stores/${stores[0].store.id}`)
      }
    }
  }, [loading, role, stores, navigate])

  if (loading) return <p className="text-center mt-10">불러오는 중...</p>

  // manager 전용 화면
  if (role === 'manager') {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">내 매장</h2>
        {stores.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-500">
            아직 매장이 없습니다. <br />
            <button
              onClick={() => navigate('/stores')}
              className="mt-4 bg-teal-500 text-white px-4 py-2 rounded-lg shadow hover:bg-teal-600"
            >
              매장 만들기 +
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.map((s, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow hover:shadow-md p-6 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{s.store?.name}</h3>
                    <p className="text-sm text-gray-500">{s.role}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/stores/${s.store?.id}`)}
                    className="text-teal-600 hover:underline"
                  >
                    관리 →
                  </button>
                </div>
              </div>
            ))}
            {/* 추가 매장 만들기 버튼 */}
            <div
              onClick={() => navigate('/stores')}
              className="cursor-pointer bg-gray-100 flex items-center justify-center rounded-xl shadow hover:shadow-md p-6 transition"
            >
              <span className="text-3xl text-gray-400">＋</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // staff는 useEffect에서 이미 리디렉트되므로 이 화면은 보이지 않음
  return <p>리디렉트 중...</p>
}

export default DashboardPage
