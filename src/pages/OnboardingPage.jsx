import React, { useState, useEffect } from 'react'
import { db } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const OnboardingPage = () => {
  const nav = useNavigate()
  const [saving, setSaving] = useState(false)

  const choose = async (role) => {
    setSaving(true)
    await db.profiles.upsertMine({ account_role: role })
    setSaving(false)
    nav('/dashboard', { replace: true })
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-2">역할 선택</h2>
      <p className="text-gray-600 mb-6">쉽표를 어떻게 사용하실 계획인가요?</p>
      <div className="flex gap-3">
        <button
          onClick={() => choose('manager')}
          className="flex-1 bg-[#3AC0C3] text-white px-4 py-3 rounded-lg hover:bg-[#2FA6A9]"
          disabled={saving}
        >
          매니저로 시작
        </button>
        <button
          onClick={() => choose('staff')}
          className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg hover:bg-black"
          disabled={saving}
        >
          스태프로 시작
        </button>
      </div>
    </div>
  )
}

export default OnboardingPage
