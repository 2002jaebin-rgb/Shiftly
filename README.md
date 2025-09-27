# Shiftly - 직원 근무표 관리 시스템

한국형 Hotschedules 서비스로, 직원들의 근무표 관리와 교체 요청을 처리할 수 있는 웹 애플리케이션입니다.

## 기술 스택

- **Frontend**: React + Vite
- **Backend**: Supabase (PostgreSQL + Auth)
- **Hosting**: Cloudflare Pages
- **Routing**: React Router DOM

## 주요 기능

- 🔐 이메일/비밀번호 로그인 (Supabase Auth)
- 📅 직원 근무표 조회
- 🔄 근무 교체 요청 시스템
- ✅ 교체 요청 승인/거부
- 📱 반응형 UI

## 설치 및 실행

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경 변수 설정**
   - `env.example` 파일을 `.env`로 복사
   - Supabase 프로젝트에서 URL과 Anon Key를 가져와서 설정
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

4. **빌드**
   ```bash
   npm run build
   ```

## Supabase 데이터베이스 설정

다음 테이블들이 필요합니다:

### users 테이블
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'employee',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### shifts 테이블
```sql
CREATE TABLE shifts (
  id SERIAL PRIMARY KEY,
  title TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  notes TEXT,
  employee_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### swap_requests 테이블
```sql
CREATE TABLE swap_requests (
  id SERIAL PRIMARY KEY,
  shift_id INTEGER REFERENCES shifts(id),
  requester_id UUID REFERENCES users(id),
  target_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### notifications 테이블
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 프로젝트 구조

```
src/
├── components/
│   └── Navbar.jsx          # 네비게이션 바
├── pages/
│   ├── LoginPage.jsx       # 로그인 페이지
│   ├── DashboardPage.jsx   # 대시보드 (근무표 조회)
│   ├── ShiftDetailPage.jsx # 시프트 상세 (교체 요청)
│   └── SwapRequestsPage.jsx # 교체 요청 관리
├── supabaseClient.js       # Supabase 클라이언트 설정
├── App.jsx                 # 메인 앱 컴포넌트
├── main.jsx               # 앱 진입점
└── index.css              # 기본 스타일
```

## 주요 컴포넌트

### LoginPage
- 이메일/비밀번호 로그인
- Supabase Auth 연동

### DashboardPage
- 사용자의 근무표 조회
- 주간 뷰로 시프트 표시

### ShiftDetailPage
- 개별 시프트 상세 정보
- 교체 요청 기능

### SwapRequestsPage
- 교체 요청 목록 조회
- 승인/거부 기능 (관리자)

## 다음 단계

- [ ] 관리자 대시보드 추가
- [ ] 시프트 생성/편집 기능
- [ ] 알림 시스템 구현
- [ ] 모바일 최적화
- [ ] 다크 모드 지원
