# WorkTracker - GitHub 저장소 연동 가이드

## 🚀 빠른 시작

### 1. GitHub Repository 생성

1. GitHub에서 새 Repository 생성 (예: `worktracker-data`)
2. Public 또는 Private 선택 (Private 권장)
3. README는 생성하지 않아도 됨

### 2. GitHub Personal Access Token 생성

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)" 클릭
3. 설정:
   - Note: `WorkTracker App`
   - Expiration: `No expiration` (또는 원하는 기간)
   - **권한 선택: `repo` 전체 체크** ✅
4. "Generate token" 클릭
5. **생성된 토큰을 복사** (한 번만 보여줍니다!)

### 3. 환경변수 설정

#### 로컬 개발 (개발용)

1. `.env.example` 파일을 복사하여 `.env` 파일 생성:
   ```bash
   cp .env.example .env
   ```

2. `.env.local` 파일 생성 (Next.js는 `.env.local` 사용):
   ```env
   NEXT_PUBLIC_GITHUB_OWNER=your-username        # 본인의 GitHub 사용자명
   NEXT_PUBLIC_GITHUB_REPO=worktracker-data      # 생성한 Repository 이름
   NEXT_PUBLIC_GITHUB_PATH=data/work-records.json
   NEXT_PUBLIC_GITHUB_TOKEN=ghp_xxxxxxxxxxxxx    # 복사한 Personal Access Token
   NEXT_PUBLIC_GITHUB_BRANCH=main
   ```

3. 앱 실행:
   ```bash
   npm install
   npm run dev
   ```

#### Vercel 배포 (실제 사용)

1. Vercel 프로젝트 설정 → Environment Variables
2. 다음 변수들을 추가:

   | Name | Value | Example |
   |------|-------|---------|
   | `NEXT_PUBLIC_GITHUB_OWNER` | GitHub 사용자명 | `john-doe` |
   | `NEXT_PUBLIC_GITHUB_REPO` | Repository 이름 | `worktracker-data` |
   | `NEXT_PUBLIC_GITHUB_TOKEN` | Personal Access Token | `ghp_xxxxxxxxxxxx` |
   | `NEXT_PUBLIC_GITHUB_PATH` | JSON 파일 경로 | `data/work-records.json` |
   | `NEXT_PUBLIC_GITHUB_BRANCH` | 브랜치 이름 | `main` |

3. "Save" 후 재배포

### 4. 작동 확인

1. 앱에서 출퇴근 기록 추가
2. GitHub Repository에서 `data/work-records.json` 파일이 생성되었는지 확인
3. 다른 기기에서 같은 URL 접속 → 데이터가 동기화되는지 확인

---

## 📁 데이터 구조

GitHub에 저장되는 JSON 파일 형식:

```json
[
  {
    "id": "1699999999999",
    "date": "2025-01-15",
    "name": "홍길동",
    "clockIn": "09:00",
    "clockOut": "18:00",
    "workHours": 9
  }
]
```

---

## ⚙️ 동작 방식

1. **읽기**: 앱 로드 시 GitHub에서 JSON 파일 다운로드
2. **쓰기**: 데이터 추가/수정/삭제 시 GitHub에 자동 업로드
3. **백업**: 로컬 스토리지에도 자동 백업 (오프라인 대비)
4. **동기화**: 여러 기기에서 접속해도 같은 데이터 공유

---

## 🔒 보안 주의사항

- ⚠️ **Personal Access Token을 GitHub Repository에 올리지 마세요!**
- `.env` 파일은 `.gitignore`에 포함되어야 함
- Token은 Vercel 환경변수에만 저장
- Private Repository 사용 권장

---

## 🛠️ 문제 해결

### "GitHub API error: 404"
- Repository 이름이 정확한지 확인
- Private repo인 경우 Token에 `repo` 권한이 있는지 확인

### "Failed to save records"
- Token이 만료되지 않았는지 확인
- Token 권한에 `repo` 전체가 체크되어 있는지 확인

### "로컬 데이터를 사용합니다" 메시지
- 환경변수가 제대로 설정되지 않은 경우
- 로컬 스토리지로 폴백됨 (정상 작동)

---

## 🎯 Vercel 배포 방법

1. GitHub에 코드 푸시
2. Vercel에서 Import Project
3. Framework Preset: **Next.js** 선택 (자동 감지됨)
4. Environment Variables 추가 (위 표 참고)
5. Deploy 클릭

---

## 💡 팁

- GitHub Token은 주기적으로 갱신하는 것이 좋습니다
- 데이터 백업은 GitHub Repository를 클론하면 됩니다
- 여러 매장을 관리하려면 Repository를 여러 개 만들 수 있습니다
