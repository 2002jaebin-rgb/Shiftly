import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // 경로 확인 필요

export default function LoginPage() {
  const navigate = useNavigate();

  // 입력값 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 로딩/에러 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 로그인 함수
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // 로그인 성공 → 대시보드로 이동
    navigate("/dashboard");
  };

  // 회원가입 (MVP용 간단 구현)
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    alert("회원가입 성공! 이메일로 인증 메일을 확인하세요.");
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Shiftly 로그인</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </div>

        <div>
          <label>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ marginRight: "10px" }}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
        <button onClick={handleSignup} disabled={loading}>
          회원가입
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
