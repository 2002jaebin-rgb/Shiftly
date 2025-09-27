# Cloudflare Pages 배포 가이드

## 1. GitHub Repository 설정

1. 이 프로젝트를 GitHub에 푸시합니다.
2. Repository를 Public 또는 Private로 설정합니다.

## 2. Cloudflare Pages 설정

### 2.1 프로젝트 연결
1. Cloudflare Dashboard → Pages → "Create a project"
2. "Connect to Git" 선택
3. GitHub repository 선택
4. 프로젝트 이름: `shiftly` (또는 원하는 이름)

### 2.2 빌드 설정
- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (기본값)

### 2.3 환경변수 설정
Cloudflare Pages Dashboard → Settings → Environment variables에서 다음을 추가:

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**중요**: 
- `VITE_` 접두사가 필요합니다 (Vite에서 클라이언트 사이드에서 접근 가능)
- Production과 Preview 환경 모두에 설정하세요

### 2.4 Supabase 설정

#### 2.4.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. Settings → API에서 URL과 anon key 복사

#### 2.4.2 데이터베이스 테이블 생성
SQL Editor에서 다음 스크립트 실행:

```sql
-- users 테이블 (Supabase Auth와 연동)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'employee',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- users 테이블 정책
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- shifts 테이블
CREATE TABLE public.shifts (
  id SERIAL PRIMARY KEY,
  title TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  notes TEXT,
  employee_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- shifts 테이블 정책
CREATE POLICY "Users can view own shifts" ON public.shifts
  FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Managers can view all shifts" ON public.shifts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

-- swap_requests 테이블
CREATE TABLE public.swap_requests (
  id SERIAL PRIMARY KEY,
  shift_id INTEGER REFERENCES public.shifts(id),
  requester_id UUID REFERENCES public.users(id),
  target_id UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;

-- swap_requests 테이블 정책
CREATE POLICY "Users can view related swap requests" ON public.swap_requests
  FOR SELECT USING (
    auth.uid() = requester_id OR 
    auth.uid() = target_id OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'manager'
    )
  );

-- notifications 테이블
CREATE TABLE public.notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
```

#### 2.4.3 사용자 프로필 자동 생성
Authentication → Triggers에서 다음 함수 생성:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 3. 배포 확인

1. Cloudflare Pages에서 "Deploy" 버튼 클릭
2. 빌드 로그 확인
3. 배포된 URL에서 앱 테스트

## 4. 도메인 설정 (선택사항)

1. Cloudflare Pages → Custom domains
2. 원하는 도메인 추가
3. DNS 설정 확인

## 5. 문제 해결

### 빌드 실패 시
- Node.js 버전 확인 (18.x 권장)
- 의존성 설치 확인
- 환경변수 설정 확인

### 런타임 오류 시
- Supabase 연결 확인
- RLS 정책 확인
- 브라우저 콘솔에서 오류 확인
