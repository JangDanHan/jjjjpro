'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ExternalLink,
  ChevronDown,
  TrendingUp,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

// 제주 바다 웨이브 심벌 (24x24px)
function JejuWaveSymbol({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#005BAC" />
      {/* 한라산 능선 */}
      <path d="M4 21L12 12L18 18L28 8" stroke="#E6F4FE" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* 바다 수평선 및 파도 물결 */}
      <path d="M4 25C9 23 13 27 18 25C23 23 27 27 28 25" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
      {/* 제주 감귤 포인트 */}
      <circle cx="23" cy="8" r="3" fill="#EA580C" />
    </svg>
  )
}

// 배경에 은은하게 깔리는 연한 블루톤 한라산 능선 곡선 SVG
function MountainSeaSilhouettes() {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 left-0 right-0 w-full opacity-20 text-[#005BAC]"
      viewBox="0 0 1200 120"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0,60 C320,110 460,20 720,55 C980,90 1080,25 1200,60 L1200,120 L0,120 Z"
        fill="#005BAC"
        fillOpacity="0.08"
      />
      <path
        d="M0,90 C340,65 670,115 940,80 C1080,60 1150,95 1200,85 L1200,120 L0,120 Z"
        fill="#0D9488"
        fillOpacity="0.12"
      />
    </svg>
  )
}

type LandingPortalProps = {
  user?: { id: string; name: string; email: string } | null
  isAdmin?: boolean
}

export function LandingPortal(_props?: LandingPortalProps) {
  const [isHowToOpen, setIsHowToOpen] = useState(false)

  return (
    <div className="relative min-h-screen bg-[#F8F9FA] text-[#0F172A] font-sans antialiased selection:bg-[#005BAC] selection:text-white flex flex-col justify-between">
      
      {/* 1. 상단 내비게이션 바 (글로벌 공통 레이아웃 - h-14 ~ h-16) */}
      <header className="sticky top-0 z-30 h-14 sm:h-16 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-[1000px] items-center justify-between px-4 sm:px-6">
          {/* 좌측: 심벌 + 제주머니 로고 */}
          <Link href="/" className="flex items-center gap-2.5 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#005BAC]">
            <JejuWaveSymbol className="w-6 h-6 shrink-0" />
            <span className="text-lg font-bold tracking-tight text-[#0F172A]">제주머니</span>
          </Link>

          {/* 우측: 처음으로 & 자료 출처 외부 링크 (로그인/회원가입 일체 없음) */}
          <div className="flex items-center gap-4 sm:gap-6 text-sm">
            <Link
              href="/"
              className="font-medium text-[#005BAC] hover:text-[#004785] transition-colors"
            >
              처음으로
            </Link>
            <a
              href="https://www.jejudatahub.net"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-slate-800 transition-colors"
              title="제주데이터허브 제608호 공공데이터 포털 바로가기"
            >
              <span>자료 출처</span>
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* 2. 메인 콘텐츠 (화면 1: 제주머니 시작 화면 간결형) */}
      <main className="relative z-10 w-full flex-1">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6 py-10 sm:py-16 space-y-10 sm:space-y-14">
          
          {/* 히어로 헤드라인 & 단일 시작 CTA */}
          <section className="text-center space-y-6 sm:space-y-7 max-w-2xl mx-auto">
            {/* 공공데이터 공식 연동 뱃지 */}
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/80 px-3.5 py-1 text-xs font-semibold text-[#005BAC] shadow-2xs">
              <span className="size-2 rounded-full bg-[#0D9488]" />
              <span>제주데이터허브 제608호 공식 연동</span>
            </div>

            {/* 메인 헤드라인 */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-[#0F172A] leading-tight sm:leading-snug">
              토요일과 일요일,<br />
              카드를 더 많이 쓴 날은?
            </h1>

            {/* 설명 문구 */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              제주시·서귀포시 구도심의 관광객 카드 결제 건수를 비교해 보세요.
            </p>

            {/* 단일 시작 CTA 버튼 & 보조 캡션 */}
            <div className="space-y-3 pt-2">
              <Link
                href="/console"
                className="inline-flex items-center justify-center gap-2 h-14 sm:h-15 px-8 sm:px-10 rounded-xl bg-[#005BAC] hover:bg-[#004785] text-white font-bold text-base sm:text-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>주말 소비 비교하기</span>
                <ArrowRight className="size-5" />
              </Link>

              {/* 보조 캡션 */}
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                자료 기간 2016년 9월~2017년 11월
              </p>
            </div>
          </section>

          {/* 3대 핵심 가치 및 원칙 안내 카드 */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
            {/* 가치 1: 한 줄 자연어 결론 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2.5 transition hover:border-[#005BAC]/30">
              <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-[#005BAC]">
                <TrendingUp className="size-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">직관적인 자연어 결론</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                복잡한 통계표를 뒤적이지 않아도, <strong className="text-[#005BAC]">"토요일에 카드 결제가 288건 더 많았어요"</strong>처럼 직관적인 한 줄 답변으로 핵심을 전달합니다.
              </p>
            </div>

            {/* 가치 2: 착시 없는 0-기준 동일 눈금 비교 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2.5 transition hover:border-[#005BAC]/30">
              <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-[#0D9488]">
                <Scale className="size-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">착시 없는 0-기준 막대 그래프</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                축을 임의로 잘라내어 차이를 부풀리지 않습니다. 0건부터 동일한 눈금의 가로 막대 그래프로 토요일(청록)과 일요일(블루)의 결제량을 공정하게 비교합니다.
              </p>
            </div>

            {/* 가치 3: 1:1 주말 데이터 정합성 보장 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2.5 transition hover:border-[#005BAC]/30">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-[#EA580C]">
                <ShieldCheck className="size-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">1:1 주말 매칭 공공 데이터</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                토요일과 일요일 데이터가 온전히 쌍(Pair)을 이루는 15개월 공식 관측치만 엄격히 계산하여 요일 불일치로 인한 왜곡을 사전에 차단합니다.
              </p>
            </div>
          </section>

          {/* 1초 빠른 실제 관측 데이터 미리보기 카드 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-[#EA580C]" />
                <span className="text-sm font-bold text-[#0F172A]">실제 관측 데이터 미리보기</span>
              </div>
              <span className="text-xs text-slate-400">
                [적용 조건] 제주시 구도심 · 내국인 관광객 · 2017년 11월
              </span>
            </div>

            {/* 원라인 결론 문장 */}
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                토요일에 카드 결제가 <span className="text-[#0D9488] underline decoration-[#0D9488]/40 underline-offset-4">288건</span> 더 많았어요
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                총 주말 결제량 26,716건 중 토요일 결제 비중이 50.54%로 더 높았습니다.
              </p>
            </div>

            {/* 2열 나란한 메트릭 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 토요일 카드 */}
              <div className="rounded-xl border border-teal-200 bg-[#F0FDFA] p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#0D9488]">
                  <span>토요일 결제 건수</span>
                  <span className="rounded-full bg-teal-100 px-2 py-0.5 text-teal-800">우세 (+288건)</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#0D9488] tabular-nums tracking-tight">
                    13,502
                  </span>
                  <span className="text-sm font-semibold text-teal-700">건</span>
                </div>
                <p className="text-xs text-teal-700">점유율 50.5%</p>
              </div>

              {/* 일요일 카드 */}
              <div className="rounded-xl border border-blue-200 bg-[#EFF6FF] p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#2563EB]">
                  <span>일요일 결제 건수</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">안정 소비</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#2563EB] tabular-nums tracking-tight">
                    13,214
                  </span>
                  <span className="text-sm font-semibold text-blue-700">건</span>
                </div>
                <p className="text-xs text-blue-700">점유율 49.5%</p>
              </div>
            </div>

            {/* 0 기준 동일 눈금 가로 막대 그래프 */}
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>0건 기준 착시 없는 동일 눈금 막대 그래프</span>
                <span className="tabular-nums">최대 16,000건 스케일</span>
              </div>

              <div className="space-y-2">
                {/* 토요일 바 */}
                <div className="flex items-center gap-3">
                  <span className="w-12 text-xs font-bold text-[#0D9488] shrink-0">토요일</span>
                  <div className="h-4 w-full rounded-full bg-slate-200/80 overflow-hidden">
                    <div className="h-full rounded-full bg-[#0D9488]" style={{ width: '84.4%' }} />
                  </div>
                  <span className="w-20 text-right text-xs font-bold text-slate-800 tabular-nums shrink-0">
                    13,502건
                  </span>
                </div>

                {/* 일요일 바 */}
                <div className="flex items-center gap-3">
                  <span className="w-12 text-xs font-bold text-[#2563EB] shrink-0">일요일</span>
                  <div className="h-4 w-full rounded-full bg-slate-200/80 overflow-hidden">
                    <div className="h-full rounded-full bg-[#2563EB]" style={{ width: '82.6%' }} />
                  </div>
                  <span className="w-20 text-right text-xs font-bold text-slate-800 tabular-nums shrink-0">
                    13,214건
                  </span>
                </div>
              </div>
            </div>

            {/* 콘솔 유입 CTA */}
            <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                서귀포시, 중국인 관광객 및 15개월 전체 추이를 바로 비교해볼 수 있습니다.
              </span>
              <Link
                href="/console"
                className="w-full sm:w-auto h-11 px-5 rounded-lg bg-[#005BAC] hover:bg-[#004785] text-white text-sm font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>직접 조건 골라 비교하기</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>

          {/* 접이식 이용 방법 마이크로 아코디언 */}
          <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setIsHowToOpen(!isHowToOpen)}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-bold text-[#0F172A] hover:bg-slate-50 transition cursor-pointer"
            >
              <span>이용 방법 알아보기</span>
              <ChevronDown
                className={`size-4 text-slate-500 transition-transform duration-200 ${
                  isHowToOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isHowToOpen && (
              <div className="border-t border-slate-100 p-5 bg-slate-50/60 text-sm text-slate-600 space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-[#005BAC] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0F172A]">1단계: 자연어 질문 또는 추천 칩 클릭</strong>
                    <p className="text-xs text-slate-500 mt-0.5">
                      검색창에 "17년 11월 제주시 내국인 관광객 비교해줘"와 같이 편하게 적거나 추천 질문 칩을 누르면 즉시 분석됩니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-[#005BAC] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0F172A]">2단계: 직접 조건 선택기 활용</strong>
                    <p className="text-xs text-slate-500 mt-0.5">
                      지역(제주시 구도심/서귀포시 구도심), 관광객 구분(내국인/중국인), 기간을 직접 클릭하여 자유롭게 비교할 수 있습니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-[#005BAC] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0F172A]">3단계: 정직한 결론 및 월별 상세 확인</strong>
                    <p className="text-xs text-slate-500 mt-0.5">
                      한 줄 결론 문장, 토·일 결제 건수 카드, 0-기준 막대 그래프 및 15개월 전체 추이 표를 즉시 확인하세요.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

        </div>
      </main>

      {/* 은은한 배경 한라산 능선 SVG 장식 */}
      <MountainSeaSilhouettes />

      {/* 3. 간결한 하단 푸터 (글로벌 공통 규격) */}
      <footer className="relative z-10 border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6 text-center text-xs text-slate-500">
          제주머니 · 자료 출처 제주데이터허브
        </div>
      </footer>
    </div>
  )
}
