import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const LoginPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('staff') // 기본값 staff
  const [isSignup, setIsSignup] = useState(false) // true면 회원가입 모드
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isSignup) {
      // 회원가입
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      // 프로필 테이블에 역할 저장
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            account_role: role
          }
        ])
        if (profileError) {
          setError('회원가입은 되었지만 프로필 저장 중 오류 발생: ' + profileError.message)
        }
      }

      alert('회원가입 성공! 로그인 후 이용해주세요.')
      setIsSignup(false) // 로그인 모드로 전환
    } else {
      // 로그인
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }
      navigate('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#3AC0C3]">
          {isSignup ? '회원가입' : '로그인'}
        </h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border p-2 rounded-lg"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border p-2 rounded-lg"
          />

          {isSignup && (
            <div>
              <label className="block text-sm mb-1">역할 선택</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border p-2 rounded-lg"
              >
                <option value="manager">매니저</option>
                <option value="staff">스태프</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3AC0C3] text-white py-2 rounded-lg hover:bg-[#2A9FA2] transition"
          >
            {loading ? '처리 중...' : isSignup ? '회원가입' : '로그인'}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4 text-center">
          {isSignup ? (
            <>
              이미 계정이 있으신가요?{' '}
              <button
                className="text-[#3AC0C3] hover:underline"
                onClick={() => setIsSignup(false)}
              >
                로그인
              </button>
            </>
          ) : (
            <>
              아직 회원이 아니신가요?{' '}
              <button
                className="text-[#3AC0C3] hover:underline"
                onClick={() => setIsSignup(true)}
              >
                회원가입
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export default LoginPage
