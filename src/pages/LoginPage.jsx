import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../supabaseClient'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await auth.signIn(email.trim(), password)

    setLoading(false)

    if (error) {
      setError(error.message || '로그인 실패')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="auth-container" style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2 style={{ marginBottom: 16 }}>Shiftly 로그인</h2>

      {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>이메일</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label>비밀번호</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', marginTop: 16 }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      {/* ✅ 카카오 로그인 버튼 */}
      <div style={{ marginTop: 24 }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => auth.signInWithProvider('kakao')}
          style={{ width: '100%' }}
        >
          카카오 계정으로 로그인
        </button>
      </div>
    </div>
  )
}

export default LoginPage
