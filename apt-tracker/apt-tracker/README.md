# 🏠 서울 대장 아파트 호가 트래커

네이버 부동산 실시간 호가를 매일 오전 7시에 Slack으로 자동 발송합니다.
**Claude 토큰 완전 0 사용 · 완전 무료**

---

## 📋 구성

- **우리집**: 양천구 신트리4단지 20평 (맨 위 초록색 강조)
- **25개 대장 아파트**: 강남4구 / 마용성 / 광역중심 / 기타 자치구
- **4개 구간 비교**: 전일 / 2주전 / 한달전 / 세달전 (금액 + %)
- **자동 발송**: 매일 오전 7시 KST

---

## 🚀 배포 방법 (딱 5분!)

### 1️⃣ GitHub에 올리기

방법 A (드래그앤드롭 - 제일 쉬움):
1. [github.com](https://github.com) 로그인 → 우측 상단 **+** → **New repository**
2. 이름: `apt-tracker` → **Create repository**
3. 화면에 **uploading an existing file** 클릭
4. zip 압축 풀고 파일 4개 드래그앤드롭 → **Commit changes**

방법 B (Git CLI):
```bash
git init
git add .
git commit -m "초기 배포"
git remote add origin https://github.com/본인아이디/apt-tracker.git
git push -u origin main
```

---

### 2️⃣ Vercel 배포

1. [vercel.com/new](https://vercel.com/new) 접속
2. **Continue with GitHub** 클릭 → 로그인
3. `apt-tracker` 레포 선택 → **Import** → **Deploy** 클릭
4. 배포 완료 후 **Settings** → **Environment Variables** 클릭
5. 다음 2개 환경변수 추가:

| Name | Value |
|------|-------|
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/services/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` |
| `CRON_SECRET` | `my-secret-key-12345` (아무 문자열) |

6. **Redeploy** 버튼 한번 더 클릭 (환경변수 적용)

---

### 3️⃣ 즉시 테스트

배포 완료 후 브라우저에서:
```
https://본인프로젝트이름.vercel.app/api/send-alert
```
접속하면 바로 Slack 발송! 🎉

---

## ⏰ 자동 발송 확인

- **스케줄**: `매일 오전 7:00 KST` (UTC 22:00 전날)
- Vercel 대시보드 → **Cron Jobs** 탭에서 실행 로그 확인 가능

---

## 💾 전일/2주전/한달전/세달전 가격 저장 (선택)

정확한 변동금액 계산을 위해 **Vercel KV** 추가 (무료):

1. Vercel 대시보드 → **Storage** → **Create** → **KV**
2. 프로젝트에 연결하면 환경변수 자동 추가
3. 이후 전일/2주전/한달전/세달전 대비가 정확하게 표시됨

**KV 없이도 작동하지만** 첫 실행 시 변동금액이 모두 `–`로 표시되고, 이후부터 정상 작동합니다.

---

## 📱 Slack 알람 예시

```
🏠 서울 대장 아파트 호가 대시보드
📅 2026년 4월 26일 (일) · 30평대 기준 · 네이버 부동산

🏡 우리집 · 양천구 신트리4단지 (20평)
호가: 6억 2천 | 전일: +500만 (+0.81%) | 2주전: +1,000만 (+1.64%) | 한달전: +2,000만 (+3.34%) | 세달전: +4,500만 (+7.83%)

전체 단지: 25개 | 상승: 14개 | 하락: 6개 | 평균 변동(전일): +780만

📍 강남 4구
서초구 래미안 원베일리 (34평)
  호가: 60억 | 전일: +500만 (+0.08%) | 2주전: +3,000만 (+0.50%) | 한달전: +5,000만 (+0.84%) | 세달전: +2억 (+3.45%)

강남구 디에이치 퍼스티어 (34평)
  호가: 34억 | 전일: – (0.00%) | 2주전: +2,000만 (+0.59%) | 한달전: +3,500만 (+1.04%) | 세달전: +1억 (+3.03%)
...

🔥 전일 상승 TOP 3
🥇 나인원 한남 (용산구) +1,000만 · +0.26%
🥈 래미안 원베일리 (서초구) +500만 · +0.08%
🥉 고덕 그라시움 (강동구) +500만 · +0.26%
```

---

## 🛠️ 파일 구조

```
apt-tracker/
├── api/
│   └── send-alert.js   # 메인 크롤러 + Slack 발송 (Claude 토큰 0)
├── vercel.json          # Cron 스케줄 (매일 오전 7시)
├── package.json
└── README.md
```

---

## ❓ FAQ

**Q. Claude 토큰을 정말 안 쓰나요?**  
A. 네! 한번 배포 후엔 Vercel 서버가 자동으로 돌아가서 Claude는 전혀 사용 안 됩니다.

**Q. 비용이 드나요?**  
A. 완전 무료입니다. Vercel 무료 플랜으로 충분합니다.

**Q. 다른 단지도 추가하고 싶어요.**  
A. `api/send-alert.js` 파일의 `APTS` 배열에 단지 추가 후 재배포하면 됩니다.

**Q. 우리집 정보 변경하려면?**  
A. `api/send-alert.js` 파일의 `MY_HOME` 객체 수정 후 재배포.

**Q. 알람 시간 바꾸려면?**  
A. `vercel.json`의 `"schedule": "0 22 * * *"` 부분 수정.  
   - 오전 6시 = `"0 21 * * *"`  
   - 오전 8시 = `"0 23 * * *"`  
   - 오후 6시 = `"0 9 * * *"`

---

🎉 배포 완료하면 매일 오전 7시에 Slack으로 대시보드가 날아옵니다!
