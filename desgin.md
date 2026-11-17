# 제주 주말소비 분석 포털 3대 핵심 화면 통합 디자인 명세서 (.md)

> **프로젝트명**: 제주 구도심 주말소비 정밀 분석 포털 (Jeju Weekend Pulse Portal)  
> **주관 기관**: (재)제주테크노파크(JTP) 디지털융합센터 빅데이터연구팀 & 제주데이터허브  
> **기준 원천 데이터**: 제주데이터허브 제608호 (제주도 구도심 상권 주말 소비 카드 트래픽 정밀 집계, 2016.09 ~ 2017.11 총 120행 100% 매칭 검증)  
> **적용 디자인 시스템**: `Jeju TP Insight Public Portal` (디자인 시스템 ID: DESIGN_SYSTEM_2)  
> **문서 버전**: v2.0 (화면 3종 UI 컴포넌트·데이터 스키마·코드 구조 통합판)  

---

## Ⅰ. 디자인 시스템 및 공통 디자인 토큰 (Design Tokens)

### 1.1 글로벌 컬러 팔레트 (Color Palette)

| 구분 | 토큰명 | Hex Code | 용도 및 의미 |
| :--- | :--- | :--- | :--- |
| **Primary Brand** | Primary Blue | `#005BAC` | 제주테크노파크 대표 시그니처 블루, 핵심 CTA 버튼, GNB 활성 탭, 헤드라인 하이라이트 |
| **Primary Dark** | Brand Navy | `#0A1E3F` | 대헤드라인, 어두운 배너 배경, 시스템 상태바 배경, 높은 가독성 텍스트 |
| **Hover State** | Primary Hover | `#004380` | 주요 버튼 및 상호작용 요소 마우스 호버 상태 |
| **토요일 (Sat)** | Teal-600 | `#0D9488` | 토요일 결제 건수, 토요일 점유율 막대 그래프, 토요일 우세 뱃지 |
| **토요일 배경** | Teal-50 | `#F0FDFA` | 토요일 통계 카드 배경, 테두리 (`#CCFBF1`) |
| **일요일 (Sun)** | Blue-600 | `#2563EB` | 일요일 결제 건수, 일요일 점유율 막대 그래프, 일요일 우세 뱃지 |
| **일요일 배경** | Blue-50 | `#EFF6FF` | 일요일 통계 카드 배경, 테두리 (`#DBEAFE`) |
| **격차 우세 지표** | Emerald-600 | `#059669` | 순 차이(+288건, +2.18%) 등 긍정적 지표 강조, 배경 (`#ECFDF5`) |
| **표면 배경 (Surface)**| Slate-50 | `#F8F9FA` | 전체 페이지 기본 본문 배경 (`bg-[#F8F9FA]`) |
| **카드 표면 (Card)** | Pure White | `#FFFFFF` | 콘텐츠 패널, 데이터 카드, 팝오버 기본 배경 |
| **보더 라인 (Border)**| Slate-200 | `#E2E8F0` | 공공 포털 규격의 단정한 카드 및 테이블 구분선 |

### 1.2 타이포그래피 규칙 (Typography System)
- **Primary Font**: `Public Sans`, `Pretendard`, `Noto Sans KR`, `system-ui, -apple-system, sans-serif`
- **숫자 가독성 원칙**: 통계 수치 및 건수 데이터는 **`font-variant-numeric: tabular-nums`** 필수 적용 (열 정렬 오차 방지).
- **스케일**:
  - Hero Display Title: `32px ~ 36px` (Bold 700~800, leading 1.3)
  - Section Headings: `22px ~ 26px` (Bold 700)
  - Box / Card Titles: `17px ~ 19px` (SemiBold 600)
  - Large Metrics: `28px ~ 32px` (ExtraBold 800)
  - Body Text: `14px ~ 15px` (Regular 400 ~ Medium 500, leading 1.6)
  - Badges / Captions: `11px ~ 12px` (SemiBold 600)

### 1.3 공통 GNB (Global Navigation Bar) 규격
```html
<header class="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
  <div class="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
    <!-- 브랜드 로고 -->
    <div class="flex items-center gap-3">
      <div class="flex flex-col">
        <div class="flex items-center gap-2">
          <span class="font-extrabold text-slate-900 text-lg tracking-tight">(재)제주테크노파크</span>
          <span class="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">빅데이터 센터</span>
        </div>
        <span class="text-xs text-slate-500 font-medium">제주 구도심 주말소비 정밀 분석 포털</span>
      </div>
    </div>
    <!-- 네비게이션 탭 -->
    <nav class="flex items-center gap-1">
      <a href="#intro" class="px-4 py-2 text-sm font-semibold text-[#005BAC] border-b-2 border-[#005BAC]">서비스 소개</a>
      <a href="#console" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">데이터 분석 콘솔</a>
      <a href="#report" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">상인회 의사결정 보고서 / 이력</a>
    </nav>
    <!-- 우측 인증 & 진입 CTA -->
    <div class="flex items-center gap-3">
      <span class="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        공식 제608호 관측 검증 (2016.09 ~ 2017.11)
      </span>
      <button class="px-3.5 py-2 text-xs font-semibold text-white bg-[#005BAC] hover:bg-[#004380] rounded shadow-sm">
        로그인 / 상인회 인증
      </button>
    </div>
  </div>
</header>
```

---

## Ⅱ. 화면 1 상세 명세: 서비스 소개 및 퀵 스타트 랜딩페이지 (Landing Screen)

> **화면 ID**: `SCREEN_8`  
> **타이틀**: `제주 주말소비 - 서비스 소개 및 퀵 스타트`  
> **디바이스**: DESKTOP (1280px Grid 기준)  
> **핵심 목적**: 소상공인과 상인회 담당자가 별도 가입 절차 없이 1초 만에 서비스 가치를 체감하고 즉시 분석 콘솔로 유입되도록 유도.

### 2.1 화면 레이아웃 구성도
```
+-----------------------------------------------------------------------------------+
| GNB: (재)제주테크노파크 빅데이터 센터 로고 | 3대 메뉴 탭 | 제608호 검증 뱃지 | 상인회 인증 CTA |
+-----------------------------------------------------------------------------------+
| [Hero Section]                                                                    |
|  - 좌측: "데이터로 여는 제주 골목상권의 내일"                                     |
|          수작업 엑셀 0%, 공문서 인쇄 지원 설명, [데이터 분석 콘솔 바로가기] CTA   |
|  - 우측: [1초 퀵 비교 체험 위젯] (제주시 구도심/서귀포시 구도심 탭 선택 시 즉시 비교) |
|          토요일 13,502건 vs 일요일 13,214건 요약 카드 및 점유율 막대 프리뷰        |
+-----------------------------------------------------------------------------------+
| [6대 공공 분석 원클릭 서비스 카드 그리드 (3x2)]                                   |
|  1. 토·일 결제 정밀 비교      2. 자연어 대화형 질의 분석   3. 15개월 월별 추이 리포트 |
|  4. 공식 제608호 데이터 검증  5. 상인회 회의 안건 표준 서식 6. 공공데이터 표준 API 연동|
+-----------------------------------------------------------------------------------+
| [상인회 핵심 혁신 가치 3대 카드 (Core Innovation)]                               |
|  01. 수작업 엑셀 페어링 ZERO | 02. 확실한 수치 기반 안건 채택 | 03. 맥락 기억 연속 대화|
+-----------------------------------------------------------------------------------+
| [전문가용 분석 콘솔 라이브 프리뷰 & 관측 현장 권역 포토맵 2분할]                  |
|  - 좌측: 실제 질의 엔진 대화창 및 15개월 시계열 차트 목업                          |
|  - 우측: 제주시 중앙로·칠성로 원도심권 vs 서귀포시 매일올레·이중섭거리권 카드맵    |
+-----------------------------------------------------------------------------------+
| [공공데이터 신뢰 거버넌스 4단계 프로세스]                                         |
|  1. 원천 데이터 수집 -> 2. 2대 권역 지오코딩 -> 3. 1:1 완결 페어링 -> 4. 공문서 도출 |
+-----------------------------------------------------------------------------------+
| [상인회 자주 묻는 질문 (FAQ) 아코디언] (비회원 무료 여부, 증빙 효력, 1:1 페어링 원칙) |
+-----------------------------------------------------------------------------------+
| [하단 풀위드 다크 네이비 전환 배너] "지금 무료로 데이터 분석 콘솔을 시작하세요"     |
+-----------------------------------------------------------------------------------+
| 푸터 (Footer): JTP 공공기관 사업자 정보, 제주벤처마루 주소, 품질인증 및 API 가이드  |
+-----------------------------------------------------------------------------------+
```

### 2.2 핵심 UI 컴포넌트 코드 스니펫 (Hero & 퀵 체험 위젯)
```html
<section class="max-w-7xl mx-auto px-6 py-12 grid grid-cols-12 gap-8 items-center">
  <!-- 좌측 히어로 카피 & CTA -->
  <div class="col-span-7 space-y-6">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F3FF] border border-[#D0DDFF] text-xs font-semibold text-[#005BAC]">
      <span>공공데이터 제608호 공식 연동</span>
      <span class="text-slate-300">|</span>
      <span>2016.09 ~ 2017.11 전수 시계열</span>
      <span class="text-slate-300">|</span>
      <span>수작업 엑셀 페어링 ZERO</span>
    </div>
    <h1 class="text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
      <span class="text-[#005BAC] block text-xl font-bold mb-1">제주테크노파크 빅데이터 센터</span>
      데이터로 여는 제주<br><span class="text-[#005BAC]">골목상권의 내일</span>
    </h1>
    <p class="text-slate-600 text-base leading-relaxed max-w-xl">
      수작업 엑셀 작업 없이 1초 만에 완료되는 토·일 주말 소비 패턴 정밀 검증. 
      상인회 총회, 지자체 지원사업 공모, 매장 운영시간 개편에 필요한 법적·행정적 정량 근거를 비회원 무료로 즉시 생성하세요.
    </p>
    <div class="flex items-center gap-3 pt-2">
      <a href="#console" class="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#005BAC] hover:bg-[#004380] text-white font-semibold text-base rounded shadow-sm transition-all">
        <span>데이터 분석 콘솔 바로가기</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      </a>
      <button class="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm rounded border border-slate-300 shadow-sm transition-all">
        <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        <span>상인회 3분 요약 매뉴얼 PDF</span>
      </button>
    </div>
  </div>

  <!-- 우측 빠른 상권 비교 체험 위젯 -->
  <div class="col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-md">
    <div class="flex items-center justify-between pb-3 border-b border-slate-100">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[#005BAC]"></span>
        <h3 class="font-bold text-slate-900 text-sm">1초 퀵 비교 체험 위젯</h3>
      </div>
      <span class="text-xs text-slate-400">기준: '17년 11월 마감</span>
    </div>
    <!-- 권역 선택 탭 -->
    <div class="grid grid-cols-2 gap-2 mt-4">
      <button class="py-2 text-xs font-bold rounded bg-[#005BAC] text-white">제주시 구도심 (관덕정/중앙로)</button>
      <button class="py-2 text-xs font-medium rounded bg-slate-100 text-slate-600 hover:bg-slate-200">서귀포시 구도심 (이중섭/매일올레)</button>
    </div>
    <!-- 비교 결과 요약 카드 -->
    <div class="grid grid-cols-2 gap-3 mt-4">
      <div class="p-3 bg-[#F0FDFA] rounded border border-[#CCFBF1]">
        <div class="text-xs font-medium text-[#0D9488]">토요일 (Sat)</div>
        <div class="text-2xl font-extrabold text-slate-900 tabular-nums">13,502 <span class="text-xs font-normal">건</span></div>
        <div class="text-xs text-slate-500 mt-1">카드 승인건 (50.5%)</div>
      </div>
      <div class="p-3 bg-[#EFF6FF] rounded border border-[#DBEAFE]">
        <div class="text-xs font-medium text-[#2563EB]">일요일 (Sun)</div>
        <div class="text-2xl font-extrabold text-slate-900 tabular-nums">13,214 <span class="text-xs font-normal">건</span></div>
        <div class="text-xs text-slate-500 mt-1">카드 승인건 (49.5%)</div>
      </div>
    </div>
    <!-- 결론 뱃지 & 액션 가이드 -->
    <div class="mt-4 p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 leading-relaxed">
      <div class="flex items-center justify-between mb-1">
        <span class="font-semibold text-slate-900">제주시 구도심 · 내국인 소비 건수</span>
        <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">토요일 우세 (+288건)</span>
      </div>
      <p class="text-slate-500 text-[11px]">
        💡 의사결정 팁: 제주시 구도심은 토요일 점심·오후 유입이 일요일 대비 +2.18% 견고합니다. 일요일 조기마감보다는 주말 풀타임 영업 인력 배치가 유리합니다.
      </p>
    </div>
  </div>
</section>
```

---

## Ⅲ. 화면 2 상세 명세: 주말소비 데이터 분석 콘솔 (Console Screen)

> **화면 ID**: `SCREEN_6`  
> **타이틀**: `제주 주말소비 - 데이터 분석 콘솔`  
> **디바이스**: DESKTOP (1280px Grid 기준)  
> **핵심 목적**: 소상공인이 자연어 질문 또는 정밀 파라미터 필터를 통해 2016~2017 관측 원천 데이터의 1:1 토·일 결제량과 5개월 시계열 장부를 1초 만에 확인.

### 3.1 화면 레이아웃 구성도
```
+-----------------------------------------------------------------------------------+
| GNB: (재)제주테크노파크 빅데이터 센터 | 데이터 분석 콘솔 (활성 탭) | 인증 상태       |
+-----------------------------------------------------------------------------------+
| [상단 시스템 검증 상태 바]                                                       |
|  - [공식 데이터 608호] 120행 관측 데이터 정합성 검증 완료                         |
|  - [실시간 규칙 기반 연산] 인메모리 캐시 동기화 완료 (외부 AI 미사용, 데이터 주권) |
+-----------------------------------------------------------------------------------+
| [듀얼 인터페이스 패널 (Dual Interface)]                                           |
|  - 좌측 (7): [자연어 상권 질의 엔진] (한국어 파서 v2.4 탑재)                     |
|              질문창: "17년 11월 제주 구도심 내국인 토·일 비교해줘" + [비교 결과 보기]|
|              추천 칩: #17년 11월 제주 내국인  #서귀포시 17년 11월 내국인  #연속 질의|
|  - 우측 (5): [다차원 정밀 필터]                                                  |
|              지역: [제주시 구도심] / [서귀포시 구도심]                            |
|              소비자/카드: [내국인 소비] / [중국인 관광객]                         |
|              기준월 선택: 2017년 11월 ~ 2017년 11월 + [직접 선택으로 집계 재연산] |
+-----------------------------------------------------------------------------------+
| [관측 결과 리포트 요약 (2017년 11월 주말 결제량 정밀 비교)]                        |
|  - 상단: 핵심 의사결정 인사이트 박스 ("토요일 13,502건 vs 일요일 13,214건, +288건")|
|  - 3개 메트릭 카드: [토요일 총 결제] vs [일요일 총 결제] vs [순 차이량 (+288건)]  |
|  - 토요일 vs 일요일 점유율 및 누적 스펙트럼 (0 기준 비례 가로 막대 시각화)         |
+-----------------------------------------------------------------------------------+
| [시계열 추세 & 현장 구역 정보 2열 그리드]                                         |
|  - 좌측 (7): 5개월 시계열 꺾은선 그래프 ('17.07 ~ '17.11 토·일 결제선 추이)       |
|  - 우측 (5): [관측 현장 구역] 제주시 중앙로·동문시장 권역 포토맵 & 업종 점유 비중 |
+-----------------------------------------------------------------------------------+
| [월별 토·일 1:1 페어링 관측 상세 장부 (Data Grid)]                                |
|  - 관측연월 | 토요일 결제건 | 일요일 결제건 | 순 차이량 | 우세 판정 | 상인회 액션 가이드  |
|  - 2017.11: 13,502건  | 13,214건  | +288건 (+2.18%) | [토요일 우세] | 피크타임 집중|
|  - 2017.10: 14,210건  | 13,950건  | +260건 (+1.86%) | [토요일 우세] | 연휴 특수 대응|
|  - 2017.09: 13,880건  | 13,420건  | +460건 (+3.43%) | [토요일 우세] | 플리마켓 효과|
|  - 2017.08: 15,120건  | 14,800건  | +320건 (+2.16%) | [토요일 우세] | 성수기 연장영업|
|  - 2017.07: 13,950건  | 13,670건  | +280건 (+2.05%) | [토요일 우세] | 점심 특선 강화|
+-----------------------------------------------------------------------------------+
| [데이터 산출 원칙 및 통계적 무결성 검증 기준 아코디언] (1:1 페어링 원칙 & 보정 안내) |
+-----------------------------------------------------------------------------------+
```

### 3.2 핵심 데이터 비교 카드 & 점유율 스펙트럼 스니펫
```html
<!-- 메트릭 3종 카드 -->
<div class="grid grid-cols-3 gap-6 mt-6">
  <!-- 토요일 카드 -->
  <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
    <div class="flex items-center justify-between">
      <span class="text-sm font-semibold text-slate-500">토요일 결제 총량 (Saturday)</span>
      <span class="px-2.5 py-0.5 rounded text-xs font-bold bg-[#F0FDFA] text-[#0D9488]">점유율 50.5%</span>
    </div>
    <div class="mt-3 flex items-baseline gap-1">
      <span class="text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">13,502</span>
      <span class="text-base font-semibold text-slate-600">건</span>
    </div>
    <div class="mt-2 text-xs text-slate-400">11월 토요일 (4회 기준) · 일평균 약 3,375.5건</div>
  </div>

  <!-- 일요일 카드 -->
  <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
    <div class="flex items-center justify-between">
      <span class="text-sm font-semibold text-slate-500">일요일 결제 총량 (Sunday)</span>
      <span class="px-2.5 py-0.5 rounded text-xs font-bold bg-[#EFF6FF] text-[#2563EB]">점유율 49.5%</span>
    </div>
    <div class="mt-3 flex items-baseline gap-1">
      <span class="text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">13,214</span>
      <span class="text-base font-semibold text-slate-600">건</span>
    </div>
    <div class="mt-2 text-xs text-slate-400">11월 일요일 (4회 기준) · 일평균 약 3,303.5건</div>
  </div>

  <!-- 순 차이량 카드 -->
  <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
    <div class="flex items-center justify-between">
      <span class="text-sm font-semibold text-slate-500">순 차이량 (토요일 - 일요일)</span>
      <span class="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700">토요일 우세</span>
    </div>
    <div class="mt-3 flex items-baseline gap-1">
      <span class="text-4xl font-extrabold text-[#005BAC] tracking-tight tabular-nums">+288</span>
      <span class="text-base font-semibold text-slate-600">건 (+2.18%)</span>
    </div>
    <div class="mt-2 text-xs text-slate-500">상인회 제안: 토요일 오후 인력 보강 및 재고 사전배치 추천</div>
  </div>
</div>

<!-- 0 기준 점유율 스펙트럼 바 -->
<div class="mt-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
  <div class="flex items-center justify-between text-xs font-semibold mb-2">
    <span class="text-[#0D9488]">■ 토요일: 13,502건 (50.54%)</span>
    <span class="text-slate-400">총 주말 집계: 26,716건</span>
    <span class="text-[#2563EB]">일요일: 13,214건 (49.46%) ■</span>
  </div>
  <div class="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
    <div class="h-full bg-[#0D9488]" style="width: 50.54%"></div>
    <div class="h-full bg-[#2563EB]" style="width: 49.46%"></div>
  </div>
  <div class="flex justify-between items-center text-[11px] text-slate-400 mt-1">
    <span>0%</span>
    <span>Δ 1.08%p 차이 (균등 분할 대비 소폭 토요 편중)</span>
    <span>100%</span>
  </div>
</div>
```

---

## Ⅳ. 화면 3 상세 명세: 상인회 의사결정 보고서 및 이력 (Report Screen)

> **화면 ID**: `SCREEN_4`  
> **타이틀**: `제주 주말소비 - 상인회 의사결정 보고서 및 이력`  
> **디바이스**: DESKTOP (1280px Grid 기준)  
> **핵심 목적**: 소상공인시장진흥공단 지원사업 심의 및 상인회 정기총회 의결 시 즉시 인쇄·제출 가능한 표준 A4 공문서 서식 출력 및 의사결정 이력 보존.

### 4.1 화면 레이아웃 구성도
```
+-----------------------------------------------------------------------------------+
| GNB: (재)제주테크노파크 빅데이터 센터 | 상인회 의사결정 보고서 / 이력 (활성 탭)      |
+-----------------------------------------------------------------------------------+
| [상단 공식 공문서 컨트롤러 바]                                                    |
|  - 좌측 타이틀: 상인회 정량 의사결정 공식 리포트 및 분석 이력 (제주테크노파크 인증) |
|  - 우측 액션: [공식 회의용 A4 리포트 인쇄/PDF] [지자체 제출용 직인 날인] [엑셀 다운]|
+-----------------------------------------------------------------------------------+
| [메인 콘텐츠 레이아웃 (4:8 분할 구조)]                                            |
|                                                                                   |
| [좌측 사이드 패널 (Col-4)]           | [우측 A4 공식 공문서 본체 (Col-8)]          |
|  1. 소속 상인회 인증 카드            |  - 문서번호: 제주-JTP-2024-1108호           |
|     (제주시 구도심상인상생협의회 정회원) |  - 발급인증: 제주테크노파크원장 직인 날인     |
|  2. 즐겨찾는 안건 폴더 (2개 프로젝트) |  - 의결 안건: 주말 영업일 인력 및 재고 배분 |
|     - 2024 상인회 정기총회 안건 (활성)|  - 1. 주말 소비 트래픽 정량 비교 요약 표    |
|     - 서귀포 야간 차없는거리 심의     |       (토 13,502건 vs 일 13,214건, +288건)  |
|  3. 최근 질문 히스토리 필터          |  - 2. 상인회 공식 의사결정 권고안           |
|     - '17년 11월 제주 구도심 내국인  |       * 토요일 피크타임(14~19시) 알바 집중  |
|     - 서귀포시 17년 11월 내국인      |       * 일요일 19:30 이후 조기마감 권고     |
|     - 5개월 추이 / 중국인 세그먼트   |  - 3. 15개월 시계열 추이 및 분기별 격차 원장 |
|  4. 행정기관 보고서 무결성 보증 배너 |  - 전자서명 검증키: JTP-AUTH-88F4-0012      |
+-----------------------------------------------------------------------------------+
| [하단 활성 DB 엔진 상태 바]                                                       |
|  - 상태: 정상 가동 (v2024.11-608, 120행 100% 매칭) | SHA256 해시 | [동기화 즉시 확인]|
+-----------------------------------------------------------------------------------+
```

### 4.2 A4 공문서 규격 UI 컴포넌트 스니펫
```html
<!-- A4 리포트 용지 컨테이너 (실제 인쇄 규격 매핑) -->
<div class="bg-white p-10 rounded-xl border border-slate-300 shadow-lg relative max-w-3xl mx-auto">
  <!-- 공식 직인 스탬프 (우측 상단) -->
  <div class="absolute top-8 right-8 flex flex-col items-center">
    <div class="w-20 h-20 border-2 border-red-600 rounded-full flex flex-col items-center justify-center p-1 transform rotate-6 bg-red-50/20">
      <span class="text-[9px] font-bold text-red-600 tracking-tighter">제주테크노파크</span>
      <span class="text-xs font-black text-red-700 tracking-wider">원 장</span>
      <span class="text-[9px] font-bold text-red-600">직 인</span>
    </div>
    <span class="text-[10px] text-slate-400 mt-1 font-mono">JTP-OFFICIAL</span>
  </div>

  <!-- 공문서 헤더 -->
  <div class="border-b-2 border-slate-900 pb-5">
    <div class="text-xs font-bold text-[#005BAC]">(재)제주테크노파크 / 디지털융합센터 빅데이터연구팀</div>
    <div class="text-xs text-slate-500 mt-1">문서 관리번호 : 제주-JTP-2024-1108호</div>
    <div class="text-xs text-slate-500">시행 일자 : 2024. 11. 20. (수) 정기 상인총회 상정</div>
    <div class="mt-4 p-4 bg-slate-50 rounded border border-slate-200">
      <div class="text-xs font-bold text-[#005BAC]">상인회 총회 심의 의결 안건</div>
      <h2 class="text-lg font-bold text-slate-900 mt-1">
        제주시 구도심 상권 주말(토·일) 영업일 인력 및 재고 배분 안건 의결의 건
      </h2>
      <div class="text-xs text-slate-500 mt-1">
        수신: 제주시 구도심 상인상생협의회 대의원 귀하 · 참조: 제주특별자치도 경제활성화과
      </div>
    </div>
  </div>

  <!-- 안건 1: 정량 비교 요약 -->
  <div class="mt-6">
    <h3 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
      <span class="w-1.5 h-3.5 bg-[#005BAC] rounded-full"></span>
      1. 주말 소비 카드 트래픽 정량 비교 요약
    </h3>
    <div class="grid grid-cols-3 gap-3 mt-3">
      <div class="p-3 bg-[#F0FDFA] rounded border border-[#CCFBF1]">
        <div class="text-[11px] font-semibold text-[#0D9488]">토요일(Saturday) 총 결제</div>
        <div class="text-xl font-extrabold text-slate-900 tabular-nums">13,502 <span class="text-xs font-normal">건</span></div>
        <div class="text-[10px] text-slate-500">점유율 50.54%</div>
      </div>
      <div class="p-3 bg-[#EFF6FF] rounded border border-[#DBEAFE]">
        <div class="text-[11px] font-semibold text-[#2563EB]">일요일(Sunday) 총 결제</div>
        <div class="text-xl font-extrabold text-slate-900 tabular-nums">13,214 <span class="text-xs font-normal">건</span></div>
        <div class="text-[10px] text-slate-500">점유율 49.46%</div>
      </div>
      <div class="p-3 bg-[#0A1E3F] text-white rounded">
        <div class="text-[11px] font-semibold text-slate-300">토 vs 일 격차 분석</div>
        <div class="text-xl font-extrabold text-emerald-400 tabular-nums">+288 <span class="text-xs font-normal text-white">건</span></div>
        <div class="text-[10px] text-slate-300">+2.18% 토요일 우세 집중</div>
      </div>
    </div>
  </div>

  <!-- 안건 2: 상인회 공식 의사결정 권고안 -->
  <div class="mt-6 p-4 bg-blue-50/60 rounded-lg border border-blue-200">
    <h3 class="text-xs font-bold text-[#005BAC] flex items-center gap-1.5">
      <svg class="w-4 h-4 text-[#005BAC]" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/></svg>
      2. 상인회 공식 의사결정 권고안 (Executive Guidance)
    </h3>
    <p class="text-xs text-slate-700 leading-relaxed mt-2 font-medium">
      "토요일 피크타임(14:00~19:00) 아르바이트 집중 배치 및 일요일 조기마감 탄력제 도입 권고"
    </p>
    <p class="text-[11px] text-slate-600 mt-1 leading-relaxed">
      빅데이터 관측 결과 주말 매출 발생 건수가 토요일에 가중치(+288건)를 보이고 있으므로, 상권 내 회원 점포는 주말 인건비 지출 총액을 유지하되 토요일 오후 조 인력을 15% 확충하고, 일요일 19:30 이후 조기 마감 및 재고 결산을 통한 운영 고정비 절감 전략을 총회 결의로 권고함.
    </p>
  </div>

  <!-- 안건 3: 무결성 전자서명 검증키 -->
  <div class="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
    <div>
      <span class="font-bold text-slate-700">제주공공데이터포털 공인 제608호 관측 데이터 원본 일치 증명</span><br>
      알고리즘: JTP 1:1 Weekend Paired Verification v2.4
    </div>
    <div class="text-right">
      <span class="font-mono text-xs font-bold text-[#005BAC]">JTP-AUTH-88F4-0012</span>
    </div>
  </div>
</div>
```

---

## Ⅴ. 3개 화면 연계 데이터 무결성 검증 기준표 (Data Contract)

| 권역 / 소비자 군 | 관측 연월 | 토요일 결제건 | 일요일 결제건 | 순 격차 (토 - 일) | 우세 요일 | 화면 간 일관성 검증 |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **제주시 구도심 / 내국인** | **2017년 11월** | **13,502건** | **13,214건** | **+288건** | **토요일 우세** | 3개 화면(랜딩·콘솔·리포트) 핵심 공통 수치 |
| **제주시 구도심 / 중국인** | 2017년 11월 | 279건 | 352건 | **-73건** | 일요일 우세 | 콘솔 필터 전환 시 즉시 반영 |
| **서귀포시 구도심 / 내국인**| 2017년 11월 | 11,507건 | 10,509건 | **+998건** | 토요일 우세 | 랜딩 퀵체험 & 콘솔 파라미터 연동 |
| **서귀포시 구도심 / 중국인**| 2017년 11월 | 40건 | 47건 | **-7건** | 일요일 우세 | 콘솔 장부 및 다차원 필터 연동 |
| **제주시 구도심 / 내국인 5개월** | 2016.09 ~ 2017.01 | 57,133건 | 57,473건 | **-340건** | 일요일 우세 | 콘솔 시계열 추세선 및 누적 집계 연동 |

---

## Ⅵ. 요약 및 향후 확장 가이드

1. **디자인 통일성 보장**: 모든 페이지는 JTP의 공공 신뢰성을 상징하는 `#005BAC`와 주말 요일 전용 컬러(토요일 `#0D9488`, 일요일 `#2563EB`)를 100% 동일하게 공유합니다.
2. **소상공인 중심의 즉각적 전환**: 비회원 무료 원클릭 분석 체계를 유지하여, 첫 페이지(랜딩) 유입 후 단 1번의 클릭만으로 콘솔 분석 및 A4 공식 회의 리포트 인쇄까지 원스톱으로 연결됩니다.
3. **법적·행정적 신뢰성**: 제주데이터허브 제608호 120행 원천 관측 데이터의 1:1 페어링 알고리즘 및 전자서명 검증키를 리포트에 명기하여 지자체 소상공인 골목상권 지원사업 심의 자료로 즉시 활용 가능합니다.
