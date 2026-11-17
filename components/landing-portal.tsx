'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart2,
  Calendar,
  CheckCircle,
  ChevronDown,
  Database,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  Info,
  Layers,
  Lightbulb,
  Lock,
  MessageSquare,
  Network,
  Printer,
  Rocket,
  Scale,
  Send,
  ShieldCheck,
  TrendingUp,
  User,
  Verified,
  X,
} from 'lucide-react'

type Props = {
  user: { id: string; name: string; email: string } | null
  isAdmin: boolean
}

type WidgetItem = {
  sat: string
  sun: string
  diff: string
  satShare: string
  sunShare: string
  satWidth: string
  sunWidth: string
  dominant: string
  dominantColor: string
  insight: string
  queryDistrict: string
  queryUserType: string
}

const widgetData: Record<'jeju' | 'seogwipo', Record<'korean' | 'chinese', WidgetItem>> = {
  jeju: {
    korean: {
      sat: '13,502',
      sun: '13,214',
      diff: '+288건',
      satShare: '50.5%',
      sunShare: '49.5%',
      satWidth: '50.54%',
      sunWidth: '49.46%',
      dominant: '토요일 우세 (+288건)',
      dominantColor: 'bg-emerald-100 text-emerald-800',
      insight:
        '제주시 구도심은 토요일 점심·오후 유입이 일요일 대비 +2.18% 견고합니다. 일요일 조기마감보다는 주말 풀타임 영업 인력 배치가 유리합니다.',
      queryDistrict: '제주시',
      queryUserType: '내국인',
    },
    chinese: {
      sat: '279',
      sun: '352',
      diff: '-73건',
      satShare: '44.2%',
      sunShare: '55.8%',
      satWidth: '44.22%',
      sunWidth: '55.78%',
      dominant: '일요일 우세 (+73건)',
      dominantColor: 'bg-blue-100 text-blue-800',
      insight:
        '외국인 관광객(은련카드)은 면세점 및 크루즈 일정 연계로 일요일 결제 비중이 55.8%로 상승합니다. 일요일 다국어 메뉴판 집중 운영을 권장합니다.',
      queryDistrict: '제주시',
      queryUserType: '중국인',
    },
  },
  seogwipo: {
    korean: {
      sat: '11,507',
      sun: '10,509',
      diff: '+998건',
      satShare: '52.3%',
      sunShare: '47.7%',
      satWidth: '52.27%',
      sunWidth: '47.73%',
      dominant: '토요일 우세 (+998건)',
      dominantColor: 'bg-emerald-100 text-emerald-800',
      insight:
        '이중섭거리·올레시장 일대는 토요일 저녁 외식 및 야시장 지출이 압도적입니다(+998건 우세). 토요일 재료 수급 및 알바 추가 배치가 필수적입니다.',
      queryDistrict: '서귀포시',
      queryUserType: '내국인',
    },
    chinese: {
      sat: '40',
      sun: '47',
      diff: '-7건',
      satShare: '46.0%',
      sunShare: '54.0%',
      satWidth: '45.98%',
      sunWidth: '54.02%',
      dominant: '일요일 우세 (+7건)',
      dominantColor: 'bg-blue-100 text-blue-800',
      insight:
        '서귀포시 외국인 결제는 일요일 귀항 전 올레시장 특산물 선물 구매로 집중됩니다. 감귤 초콜릿, 흑돼지 가공식품 번들 판매가 유효합니다.',
      queryDistrict: '서귀포시',
      queryUserType: '중국인',
    },
  },
}

export function LandingPortal({ user, isAdmin }: Props) {
  const [curDistrict, setCurDistrict] = useState<'jeju' | 'seogwipo'>('jeju')
  const [curSegment, setCurSegment] = useState<'korean' | 'chinese'>('korean')
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({ 0: true })
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)

  const curData = widgetData[curDistrict][curSegment]

  function toggleFaq(index: number) {
    setOpenFaqs((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900 antialiased selection:bg-[#005BAC] selection:text-white">
      {/* 1. GNB (Global Navigation Bar - 명세서 1.3 표준) */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* 브랜드 로고 */}
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-slate-900">(재)제주테크노파크</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
                  빅데이터 센터
                </span>
              </div>
              <span className="text-xs font-medium text-slate-500">제주 구도심 주말소비 정밀 분석 포털</span>
            </div>
          </Link>

          {/* 중앙 네비게이션 탭 */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className="border-b-2 border-[#005BAC] px-4 py-2 text-sm font-semibold text-[#005BAC] transition-colors"
            >
              서비스 소개
            </Link>
            <Link
              href="/console"
              className="px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              데이터 분석 콘솔
            </Link>
            <Link
              href="/history"
              className="px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              상인회 의사결정 보고서 / 이력
            </Link>
          </nav>

          {/* 우측 인증 & 상태 뱃지 */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="hidden items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 xl:inline-flex">
              <span className="size-2 rounded-full bg-emerald-500" />
              공식 제608호 관측 검증 (2016.09 ~ 2017.11)
            </span>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/console"
                  className="inline-flex items-center gap-1.5 rounded bg-[#005BAC] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#004380]"
                >
                  <span>분석 콘솔 열기</span>
                  <ArrowRight className="size-3.5" />
                </Link>
                <div className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                  <User className="size-4" />
                </div>
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-1.5 rounded bg-[#005BAC] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#004380]"
              >
                <span>로그인 / 상인회 인증</span>
                <Lock className="size-3.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="w-full">
        {/* Hero Section (명세서 2.2 표준) */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:py-16">
            {/* 좌측 히어로 카피 & CTA */}
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#D0DDFF] bg-[#F0F3FF] px-3.5 py-1 text-xs font-semibold text-[#005BAC]">
                <span>공공데이터 제608호 공식 연동</span>
                <span className="text-slate-300">|</span>
                <span>2016.09 ~ 2017.11 전수 시계열</span>
                <span className="text-slate-300">|</span>
                <span className="font-bold text-[#0D9488]">수작업 엑셀 페어링 ZERO</span>
              </div>

              <div>
                <span className="mb-1 block text-lg font-bold text-[#005BAC]">제주테크노파크 빅데이터 센터</span>
                <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  데이터로 여는 제주<br />
                  <span className="text-[#005BAC]">골목상권의 내일</span>
                </h1>
              </div>

              <p className="max-w-xl text-base leading-relaxed text-slate-600">
                수작업 엑셀 작업 없이 1초 만에 완료되는 토·일 주말 소비 패턴 정밀 검증.
                상인회 총회, 지자체 지원사업 공모, 매장 운영시간 개편에 필요한 법적·행정적 정량 근거를
                비회원 무료로 즉시 생성하세요.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/console"
                  className="inline-flex items-center justify-center gap-2 rounded bg-[#005BAC] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#004380]"
                >
                  <span>데이터 분석 콘솔 바로가기</span>
                  <ArrowRight className="size-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded border border-slate-300 bg-white px-5 py-3.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                >
                  <Download className="size-4 text-slate-500" />
                  <span>상인회 3분 요약 매뉴얼 PDF</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="size-4 text-[#0D9488]" />
                  <span>가입·로그인 없는 즉시 무료 조회</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="size-4 text-[#0D9488]" />
                  <span>토·일 1:1 완결 페어링 필터</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="size-4 text-[#0D9488]" />
                  <span>A4 공문서 출력용 정량 서식</span>
                </div>
              </div>
            </div>

            {/* 우측 빠른 상권 비교 체험 위젯 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md lg:col-span-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#005BAC]" />
                  <h3 className="text-sm font-bold text-slate-900">1초 퀵 비교 체험 위젯</h3>
                </div>
                <span className="text-xs text-slate-400">기준: &apos;17년 11월 마감</span>
              </div>

              {/* 권역 선택 탭 */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCurDistrict('jeju')}
                  className={`rounded py-2 text-xs font-bold transition-all ${
                    curDistrict === 'jeju'
                      ? 'bg-[#005BAC] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  제주시 구도심 (관덕정/중앙로)
                </button>
                <button
                  type="button"
                  onClick={() => setCurDistrict('seogwipo')}
                  className={`rounded py-2 text-xs font-bold transition-all ${
                    curDistrict === 'seogwipo'
                      ? 'bg-[#005BAC] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  서귀포시 구도심 (이중섭/매일올레)
                </button>
              </div>

              {/* 소비자 세부 군집 탭 */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">소비자 세부 군집:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurSegment('korean')}
                    className={`rounded px-2.5 py-1 font-semibold transition-all ${
                      curSegment === 'korean'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    내국인 소비
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurSegment('chinese')}
                    className={`rounded px-2.5 py-1 font-semibold transition-all ${
                      curSegment === 'chinese'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    외국인(은련/중국인)
                  </button>
                </div>
              </div>

              {/* 비교 결과 요약 카드 */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded border border-[#CCFBF1] bg-[#F0FDFA] p-3.5">
                  <div className="text-xs font-semibold text-[#0D9488]">토요일 (Sat)</div>
                  <div className="mt-1 text-2xl font-extrabold tabular-nums text-slate-900">
                    {curData.sat} <span className="text-xs font-normal text-slate-500">건</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">카드 승인건 ({curData.satShare})</div>
                </div>

                <div className="rounded border border-[#DBEAFE] bg-[#EFF6FF] p-3.5">
                  <div className="text-xs font-semibold text-[#2563EB]">일요일 (Sun)</div>
                  <div className="mt-1 text-2xl font-extrabold tabular-nums text-slate-900">
                    {curData.sun} <span className="text-xs font-normal text-slate-500">건</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">카드 승인건 ({curData.sunShare})</div>
                </div>
              </div>

              {/* 0 기준 점유율 스펙트럼 바 */}
              <div className="mt-3.5 flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-[#0D9488]">토요일 {curData.satShare}</span>
                  <span className="text-[#2563EB]">일요일 {curData.sunShare}</span>
                </div>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-[#0D9488] transition-all duration-300" style={{ width: curData.satWidth }} />
                  <div className="h-full bg-[#2563EB] transition-all duration-300" style={{ width: curData.sunWidth }} />
                </div>
              </div>

              {/* 결론 뱃지 & 액션 가이드 */}
              <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 leading-relaxed">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">
                    {curDistrict === 'jeju' ? '제주시 구도심' : '서귀포시 구도심'} ·{' '}
                    {curSegment === 'korean' ? '내국인 소비' : '외국인 소비'}
                  </span>
                  <span className={`rounded px-2 py-0.5 text-[11px] font-bold ${curData.dominantColor}`}>
                    {curData.dominant}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  💡 <strong>의사결정 팁:</strong> {curData.insight}
                </p>
              </div>

              {/* 해당 조건 심층 분석 CTA */}
              <Link
                href={`/console?district=${encodeURIComponent(curData.queryDistrict)}&userType=${encodeURIComponent(curData.queryUserType)}&startMonth=2017-11&endMonth=2017-11`}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded bg-[#005BAC] py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#004380]"
              >
                <span>해당 조건 콘솔에서 심층 분석하기</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          {/* 6 Major Core Analytics Features Grid */}
          <section className="mb-16 flex flex-col gap-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-bold tracking-wider text-[#005BAC]">OFFICIAL PUBLIC CAPABILITIES</span>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  6대 공공 분석 원클릭 서비스
                </h2>
              </div>
              <p className="max-w-md text-xs text-slate-500 sm:text-sm">
                소상공인부터 도시재생 지원센터 연구원까지 누구나 직관적으로 사용할 수 있는 표준화 모듈을 제공합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <Link
                href="/console"
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#005BAC] hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#005BAC] transition-colors group-hover:bg-[#005BAC] group-hover:text-white">
                    <Scale className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-[#005BAC]">
                      토·일 결제 정밀 비교
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      토요일과 일요일의 승인 건수·단가 격차를 1:1 완결 주차 단위로 정확히 계산하여 요일별 영업 가이드를 제시합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pt-5 text-xs font-semibold text-[#005BAC]">
                  <span>콘솔 열기</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Feature 2 */}
              <Link
                href="/console"
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#005BAC] hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#005BAC] transition-colors group-hover:bg-[#005BAC] group-hover:text-white">
                    <MessageSquare className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-[#005BAC]">
                      자연어 대화형 질의 분석
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      &ldquo;작년 가을 제주시 토요일 매출은?&rdquo;, &ldquo;그럼 서귀포는?&rdquo; 처럼 직전 문맥을 기억하며 사람과 대화하듯 질의합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pt-5 text-xs font-semibold text-[#005BAC]">
                  <span>AI 쿼리 체험</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Feature 3 */}
              <Link
                href="/console"
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#005BAC] hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#005BAC] transition-colors group-hover:bg-[#005BAC] group-hover:text-white">
                    <TrendingUp className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-[#005BAC]">
                      15개월 월별 추이 리포트
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      2016년 9월부터 2017년 11월까지의 사드 배치 전후 계절 변동과 외국인 관광객 변동에 따른 상권 체질 변화를 시각화합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pt-5 text-xs font-semibold text-[#005BAC]">
                  <span>시계열 보기</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Feature 4 */}
              <Link
                href="/console"
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#005BAC] hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#005BAC] transition-colors group-hover:bg-[#005BAC] group-hover:text-white">
                    <ShieldCheck className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-[#005BAC]">
                      공식 제608호 데이터 검증
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      제주데이터허브 원천 로우데이터와 결합하여 검증 해시코드 및 무결성 메타데이터(120행 100% 매칭)를 투명하게 공개합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pt-5 text-xs font-semibold text-[#005BAC]">
                  <span>품질 규격 확인</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Feature 5 */}
              <Link
                href="/history"
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#005BAC] hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#005BAC] transition-colors group-hover:bg-[#005BAC] group-hover:text-white">
                    <FileText className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-[#005BAC]">
                      상인회 회의 안건 표준 서식
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      지자체 보조금 신청, 차 없는 거리 건의, 공동 마케팅 안건으로 바로 인쇄할 수 있는 공공 표준 A4 템플릿을 생성합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pt-5 text-xs font-semibold text-[#005BAC]">
                  <span>서식 템플릿</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Feature 6 */}
              <a
                href="https://jejudatahub.net/data/view/data/608"
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#005BAC] hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#005BAC] transition-colors group-hover:bg-[#005BAC] group-hover:text-white">
                    <Network className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-[#005BAC]">
                      공공데이터 표준 API 연동
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      지자체 스마트 행정 시스템, 대학교 산학 협력단, 스타트업 연구소에서 손쉽게 가져갈 수 있는 REST/JSON 규격을 제공합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pt-5 text-xs font-semibold text-[#005BAC]">
                  <span>API 문서 열람</span>
                  <ExternalLink className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </a>
            </div>
          </section>

          {/* 3 Big Innovation Cards: Why Merchants Love It */}
          <section className="mb-16 rounded-2xl border border-slate-200 bg-white p-8 sm:p-10">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-[#005BAC]">CORE ADVANTAGES</span>
              <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                왜 상인회는 &apos;제주 주말소비&apos;를 찾는가?
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
                복잡한 수식과 오류투성이 엑셀 매칭에서 해방되어, 오직 골목상권 활성화와 매출 성장에만 집중할 수 있는 3대 핵심 혁신.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Innovation 1 */}
              <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8F9FA] p-6 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-[#005BAC]">01</span>
                    <span className="rounded bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-semibold text-[#005BAC]">
                      100% 자동 매칭
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">수작업 엑셀 페어링 ZERO</h3>
                  <p className="text-xs leading-relaxed text-slate-600">
                    달력에 짝이 안 맞는 토요일이나 일요일이 끼어 있는 불완전 주차를 원천 배제합니다. 토·일 완결 페어링 알고리즘이 통계적 왜곡을 0%로 통제합니다.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500">
                  <span>엑셀 취합 시간</span>
                  <span className="font-semibold text-rose-500 line-through">4시간 소요</span>
                  <ArrowRight className="size-3.5 text-[#0D9488]" />
                  <span className="font-bold text-[#0D9488]">1초 즉시 계산</span>
                </div>
              </div>

              {/* Innovation 2 */}
              <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8F9FA] p-6 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-[#005BAC]">02</span>
                    <span className="rounded bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-semibold text-[#005BAC]">
                      회의용 정량 근거
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">확실한 수치 기반 안건 채택</h3>
                  <p className="text-xs leading-relaxed text-slate-600">
                    &ldquo;체감상 토요일이 더 바쁩니다&rdquo;라는 애매한 주장이 아닌 &ldquo;+288건(+2.18%) 승인 건수 우세&rdquo;라는 명확한 데이터로 의결과 행정 지원을 이끌어냅니다.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500">
                  <span>제출 신뢰도</span>
                  <span className="font-semibold text-slate-500">구두 설득</span>
                  <ArrowRight className="size-3.5 text-[#005BAC]" />
                  <span className="font-bold text-[#005BAC]">공공인증 통계 증빙</span>
                </div>
              </div>

              {/* Innovation 3 */}
              <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8F9FA] p-6 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-[#005BAC]">03</span>
                    <span className="rounded bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-semibold text-[#005BAC]">
                      대화 맥락 계승
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">맥락을 기억하는 연속 대화</h3>
                  <p className="text-xs leading-relaxed text-slate-600">
                    제주시 통계를 보다가 &ldquo;그럼 서귀포는?&rdquo;, &ldquo;중국인 비율만 따로 보면?&rdquo;이라고 묻기만 하면 이전 필터 조건을 유지한 채 비교 결과만 갱신합니다.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500">
                  <span>필터 재설정 번거로움</span>
                  <span className="font-semibold text-rose-500">매번 클릭</span>
                  <ArrowRight className="size-3.5 text-[#0D9488]" />
                  <span className="font-bold text-[#0D9488]">스마트 문맥 상속</span>
                </div>
              </div>
            </div>
          </section>

          {/* Live Console Demo Preview Showcase */}
          <section className="mb-16 flex flex-col gap-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <span className="text-xs font-bold tracking-wider text-[#0D9488]">LIVE INTERFACE PREVIEW</span>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  전문가용 콘솔을 누구나 쉽게
                </h2>
              </div>
              <Link
                href="/console"
                className="inline-flex items-center gap-1.5 self-start rounded bg-[#005BAC] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#004380] sm:self-auto"
              >
                <span>콘솔 전체 화면으로 열기</span>
                <ExternalLink className="size-3.5" />
              </Link>
            </div>

            {/* UI Mockup Container */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-md">
              {/* Mock Top Bar */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-rose-500" />
                  <span className="size-3 rounded-full bg-amber-400" />
                  <span className="size-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 text-xs font-semibold text-slate-800">
                    실시간 분석 콘솔 프리뷰 (버전 2.4-공공표준)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <CheckCircle className="size-4 text-emerald-600" />
                  <span>동기화 완료: 2017-11-30</span>
                </div>
              </div>

              {/* Mockup Grid Content */}
              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Mock Left: Natural Language Input & Chat Box */}
                <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-[#F8F9FA] p-5 lg:col-span-4">
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wide text-[#005BAC]">
                      자연어 분석기 질의 예시
                    </span>
                    <div className="flex flex-col gap-2.5">
                      <div className="max-w-[88%] self-end rounded-xl bg-[#005BAC] p-2.5 text-xs text-white">
                        2017년 10월 제주시 구도심 토요일 소비량 얼마야?
                      </div>
                      <div className="flex max-w-[92%] flex-col gap-1 self-start rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 shadow-sm">
                        <span className="font-bold text-[#0D9488]">집계 완료 (1:1 주말 매칭)</span>
                        <span className="leading-relaxed">
                          총 14,812건 (일요일 대비 +512건 우세)입니다. 주요 소비 시간대는 13~15시입니다.
                        </span>
                      </div>
                      <div className="max-w-[88%] self-end rounded-xl bg-[#005BAC] p-2.5 text-xs text-white">
                        그럼 서귀포시는 어땠어?
                      </div>
                      <div className="flex max-w-[92%] flex-col gap-1 self-start rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 shadow-sm">
                        <span className="font-bold text-[#2563EB]">문맥 유지: 2017년 10월</span>
                        <span className="leading-relaxed">
                          서귀포시 구도심 토요일은 10,230건으로 제주시와 달리 야간 18~20시 집중도가 높습니다.
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/console?question=${encodeURIComponent('11월 중국인 소비 패턴은 어때?')}`}
                    className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm transition hover:border-[#005BAC]"
                  >
                    <input
                      className="w-full cursor-pointer bg-transparent px-2.5 py-1 text-xs text-slate-700 outline-none"
                      readOnly
                      type="text"
                      value="11월 중국인 소비 패턴은 어때?"
                    />
                    <span className="flex size-7 shrink-0 items-center justify-center rounded bg-[#005BAC] text-white transition-transform group-hover:scale-105">
                      <Send className="size-3.5" />
                    </span>
                  </Link>
                </div>

                {/* Mock Right: Chart & Metric Breakdown */}
                <div className="flex flex-col gap-4 lg:col-span-8">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex flex-col rounded-xl border border-slate-200 bg-[#F8F9FA] p-4">
                      <span className="text-xs font-medium text-slate-500">15개월 누적 관측 건수</span>
                      <span className="mt-1 text-2xl font-extrabold tabular-nums text-slate-900">
                        384,290<span className="ml-0.5 text-xs font-normal">건</span>
                      </span>
                      <span className="mt-1 text-[11px] font-semibold text-[#0D9488]">무결성 100% 인증</span>
                    </div>

                    <div className="flex flex-col rounded-xl border border-slate-200 bg-[#F8F9FA] p-4">
                      <span className="text-xs font-medium text-slate-500">토요일 평균 우세율</span>
                      <span className="mt-1 text-2xl font-extrabold tabular-nums text-[#005BAC]">
                        +2.45<span className="ml-0.5 text-xs font-normal">%</span>
                      </span>
                      <span className="mt-1 text-[11px] font-semibold text-[#005BAC]">15개월 중 13개월 토요일 리드</span>
                    </div>

                    <div className="flex flex-col rounded-xl border border-slate-200 bg-[#F8F9FA] p-4">
                      <span className="text-xs font-medium text-slate-500">외국인 일요 반등률</span>
                      <span className="mt-1 text-2xl font-extrabold tabular-nums text-[#2563EB]">
                        +5.21<span className="ml-0.5 text-xs font-normal">%</span>
                      </span>
                      <span className="mt-1 text-[11px] font-semibold text-[#2563EB]">출국 직전 면세·특산품 결제</span>
                    </div>
                  </div>

                  {/* Synthetic Interactive SVG Bar Graph */}
                  <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-[#F8F9FA] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        2017년 하반기 토요일 vs 일요일 월별 결제 건수 추이
                      </span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-[#0D9488]">
                          <span className="size-2.5 rounded bg-[#0D9488]" />
                          <span>토요일</span>
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-[#2563EB]">
                          <span className="size-2.5 rounded bg-[#2563EB]" />
                          <span>일요일</span>
                        </span>
                      </div>
                    </div>

                    {/* SVG Data Visualisation */}
                    <div className="h-44 w-full pt-2">
                      <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 600 160">
                        <line stroke="#E2E8F0" strokeWidth="1" x1="40" x2="580" y1="20" y2="20" />
                        <line stroke="#E2E8F0" strokeWidth="1" x1="40" x2="580" y1="60" y2="60" />
                        <line stroke="#E2E8F0" strokeWidth="1" x1="40" x2="580" y1="100" y2="100" />
                        <line stroke="#E2E8F0" strokeWidth="1" x1="40" x2="580" y1="140" y2="140" />

                        {/* Month 7 */}
                        <rect fill="#0D9488" height="102" rx="3" width="22" x="70" y="38" />
                        <rect fill="#2563EB" height="92" rx="3" width="22" x="96" y="48" />
                        <text fill="#64748B" fontSize="11" textAnchor="middle" x="94" y="155">
                          7월
                        </text>

                        {/* Month 8 */}
                        <rect fill="#0D9488" height="116" rx="3" width="22" x="160" y="24" />
                        <rect fill="#2563EB" height="108" rx="3" width="22" x="186" y="32" />
                        <text fill="#64748B" fontSize="11" textAnchor="middle" x="184" y="155">
                          8월
                        </text>

                        {/* Month 9 */}
                        <rect fill="#0D9488" height="96" rx="3" width="22" x="250" y="44" />
                        <rect fill="#2563EB" height="88" rx="3" width="22" x="276" y="52" />
                        <text fill="#64748B" fontSize="11" textAnchor="middle" x="274" y="155">
                          9월
                        </text>

                        {/* Month 10 */}
                        <rect fill="#0D9488" height="110" rx="3" width="22" x="340" y="30" />
                        <rect fill="#2563EB" height="100" rx="3" width="22" x="366" y="40" />
                        <text fill="#64748B" fontSize="11" textAnchor="middle" x="364" y="155">
                          10월
                        </text>

                        {/* Month 11 */}
                        <rect fill="#0D9488" height="94" rx="3" width="22" x="430" y="46" />
                        <rect fill="#2563EB" height="90" rx="3" width="22" x="456" y="50" />
                        <text fill="#64748B" fontSize="11" textAnchor="middle" x="454" y="155">
                          11월
                        </text>

                        <polyline
                          fill="none"
                          points="81,38 171,24 261,44 351,30 441,46"
                          stroke="#5EEAD4"
                          strokeDasharray="4"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Visual Richness Section: Spatial District Context */}
          <section className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-6">
              <div className="space-y-2">
                <span className="w-fit rounded bg-[#005BAC] px-2 py-0.5 text-xs font-semibold text-white">
                  공간 빅데이터 결합
                </span>
                <h3 className="text-xl font-bold text-slate-900">제주시 관덕정·칠성로 원도심권</h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  제주 목관아, 동문시장, 칠성로 지하상가로 연결되는 역사문화 소비 벨트. 토요일 14~18시 청소년 및 도민 가족단위 소비가 가장 집중되는 권역입니다.
                </p>
              </div>
              <div className="relative mt-5 h-48 overflow-hidden rounded-lg border border-slate-200 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzTRnCHl-37VoiJCWtXIkYQHLJCnk3w3I2zOSELh8iYGV_0PXSQpejl6MqgiHkGASunGqqRBvnZcWLC4CJec7JwlEcjt4TMiNaxMGV3Um9T5qxCYOgxWaFhHGuB72dbNlhuBbFTQ-lcC075NEtp62E9_1kE-UJ6W784UNo_OzQp4RqVfa76g7Xljg_pZ-XrlMHLmvCvG_ZWPibT0Rc9yD6qAPa0ORg2ciXmjp-okUo"
                  alt="제주시 관덕정 및 칠성로 원도심권 상권 전경"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-2.5 left-2.5 rounded bg-slate-900/80 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                  관덕정로 일원 격자 분석 완료
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-6">
              <div className="space-y-2">
                <span className="w-fit rounded bg-[#2563EB] px-2 py-0.5 text-xs font-semibold text-white">
                  공간 빅데이터 결합
                </span>
                <h3 className="text-xl font-bold text-slate-900">서귀포시 매일올레·이중섭거리권</h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  서귀포 관광 야시장과 이중섭 문화거리가 공존하는 남부 핵심 상권. 토요일 야간 식음료 지출과 일요일 오전 특산품 매입이 상권 매출의 80% 이상을 차지합니다.
                </p>
              </div>
              <div className="relative mt-5 h-48 overflow-hidden rounded-lg border border-slate-200 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRmhDDXUxuEM1mrq9JkdN2i75twom_dYpV46meXVDs1XhcL3vbplFvFYpANSssKwuzcfZ13vUs65Tl_q3qD-NQGhwx8Z0-Fjxg4u-JSdiJ2b7-HraUy1V4Vc3n5kmqtg9-76cfhfytvyuhIU8oWZ6sbBhpFq_oV_zqHeCzLJfcggOOQEe4u5vA9XdKM2BtopUN3JwFNCUZT8je5WYr7e6hpGSrcGTPnz3G7HvZ0S8R"
                  alt="서귀포시 매일올레시장 및 이중섭거리 상권 전경"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-2.5 left-2.5 rounded bg-slate-900/80 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                  중정로 및 이중섭로 격자 분석 완료
                </div>
              </div>
            </div>
          </section>

          {/* 4-Stage Data Governance Pipeline */}
          <section className="mb-16 flex flex-col gap-6">
            <div>
              <span className="text-xs font-bold tracking-wider text-[#005BAC]">DATA QUALITY &amp; GOVERNANCE</span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                공공데이터 신뢰 거버넌스 4단계
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#005BAC] text-xs font-bold text-white">
                    1
                  </span>
                  <Database className="size-5 text-[#005BAC]" />
                </div>
                <h4 className="mt-2 text-base font-bold text-slate-900">원천 데이터 수집</h4>
                <p className="text-xs leading-relaxed text-slate-600">
                  제주데이터허브 제608호 신용카드 승인 트래픽 전수 레코드(15개월치, 120행) 정밀 인출.
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#005BAC] text-xs font-bold text-white">
                    2
                  </span>
                  <Layers className="size-5 text-[#005BAC]" />
                </div>
                <h4 className="mt-2 text-base font-bold text-slate-900">2대 권역 지오코딩</h4>
                <p className="text-xs leading-relaxed text-slate-600">
                  제주시 구도심과 서귀포시 구도심의 법정동 및 행정 격자 경계 정밀 매핑 및 필터링.
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#005BAC] text-xs font-bold text-white">
                    3
                  </span>
                  <Scale className="size-5 text-[#005BAC]" />
                </div>
                <h4 className="mt-2 text-base font-bold text-slate-900">1:1 완결 페어링</h4>
                <p className="text-xs leading-relaxed text-slate-600">
                  토요일과 일요일이 완결되지 않은 분절 주차 배제 및 요일간 비교 계량치 정규화.
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#0D9488] text-xs font-bold text-white">
                    4
                  </span>
                  <FileText className="size-5 text-[#0D9488]" />
                </div>
                <h4 className="mt-2 text-base font-bold text-slate-900">실무용 리포트 도출</h4>
                <p className="text-xs leading-relaxed text-slate-600">
                  의사결정 보고서, 회의용 안건 요약표, 정책 지원 증빙 표준 PDF 및 엑셀 다운로드.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Accordion for Merchant Associations */}
          <section className="mb-16 flex flex-col gap-6">
            <div>
              <span className="text-xs font-bold tracking-wider text-[#005BAC]">FREQUENTLY ASKED QUESTIONS</span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                상인회 자주 묻는 질문 (FAQ)
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {/* FAQ 1 */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleFaq(0)}
                  className="flex w-full items-center justify-between p-5 text-left transition hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2.5 text-sm font-bold text-slate-900 sm:text-base">
                    <span className="text-lg font-black text-[#005BAC]">Q.</span>
                    비회원이나 일반 상인도 아무 제한 없이 무료로 이용할 수 있나요?
                  </span>
                  <ChevronDown
                    className={`size-4 text-slate-400 transition-transform ${openFaqs[0] ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaqs[0] && (
                  <div className="border-t border-slate-100 bg-[#F8F9FA] px-5 pb-5 pt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    네, 맞습니다. 본 포털은 (재)제주테크노파크 빅데이터 센터가 제주 골목상권 활성화 및 소상공인 정책 지원을 목적으로 구축한 공공 서비스입니다. 별도의 회원가입이나 로그인 절차 없이 모든 통계 조회, 비교 차트, 보고서 열람 기능을 상시 무료로 개방하고 있습니다.
                  </div>
                )}
              </div>

              {/* FAQ 2 */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleFaq(1)}
                  className="flex w-full items-center justify-between p-5 text-left transition hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2.5 text-sm font-bold text-slate-900 sm:text-base">
                    <span className="text-lg font-black text-[#005BAC]">Q.</span>
                    지자체 지원사업이나 소상공인진흥공단 제출 시 공식 증빙으로 쓸 수 있나요?
                  </span>
                  <ChevronDown
                    className={`size-4 text-slate-400 transition-transform ${openFaqs[1] ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaqs[1] && (
                  <div className="border-t border-slate-100 bg-[#F8F9FA] px-5 pb-5 pt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    네, 공식 증빙으로 활용 가능합니다. 포털의 데이터는 공공데이터 개방 표준에 따라 제주데이터허브 제608호 관측 데이터를 기반으로 무결성 검증을 마쳤습니다. &apos;상인회 의사결정 보고서&apos; 메뉴에서 인쇄하기를 누르시면 공공 발급 고유 일련번호(JTP-AUTH)와 직인이 포함된 공식 A4 규격 서식으로 출력됩니다.
                  </div>
                )}
              </div>

              {/* FAQ 3 */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleFaq(2)}
                  className="flex w-full items-center justify-between p-5 text-left transition hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2.5 text-sm font-bold text-slate-900 sm:text-base">
                    <span className="text-lg font-black text-[#005BAC]">Q.</span>
                    왜 토요일과 일요일 1:1 페어링 분석이 엑셀보다 정확한가요?
                  </span>
                  <ChevronDown
                    className={`size-4 text-slate-400 transition-transform ${openFaqs[2] ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaqs[2] && (
                  <div className="border-t border-slate-100 bg-[#F8F9FA] px-5 pb-5 pt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    단순 월별 합산 엑셀을 보면 월에 따라 토요일이 5번이고 일요일이 4번인 경우가 빈번합니다. 이 경우 토요일 매출이 많은 것처럼 착시가 발생합니다. 본 시스템은 온전하게 토-일이 짝을 이루는 주차만을 자동 선별 매칭하여 평균 단가와 건수를 산출하므로, 요일별 왜곡 없이 순수한 소비 선호도를 파악할 수 있습니다.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Bottom Massive Conversion CTA Banner (명세서 1.1 Brand Navy #0A1E3F) */}
          <section className="relative overflow-hidden rounded-2xl bg-[#0A1E3F] p-8 text-white shadow-xl sm:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-[#005BAC]/30 blur-3xl" />
            <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="space-y-2">
                <span className="inline-flex w-fit items-center gap-1.5 rounded bg-[#0D9488] px-2.5 py-0.5 text-xs font-bold text-white">
                  <Rocket className="size-3.5" /> 소상공인 무료 상시 개방 포털
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  지금 무료로 데이터 분석 콘솔을 시작하세요
                </h2>
                <p className="max-w-xl text-xs text-slate-300 sm:text-sm leading-relaxed">
                  가입 필요 없음 · 즉시 조회 가능 · 제주 구도심 상인회의 정량적 의사결정을 제주테크노파크 빅데이터 센터가 뒷받침합니다.
                </p>
              </div>

              <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  href="/console"
                  className="flex items-center justify-center gap-2 rounded bg-[#005BAC] px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#004380]"
                >
                  <span>데이터 분석 콘솔 시작하기</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/history"
                  className="flex items-center justify-center rounded border border-white/20 bg-white/10 px-5 py-3.5 text-xs font-semibold text-white transition-all hover:bg-white/20"
                >
                  <span>상인회 등록 및 이력 확인</span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-slate-200 bg-white text-slate-600 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="space-y-1.5 md:col-span-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-slate-900">(재)제주테크노파크 빅데이터 센터</span>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-medium text-slate-700">디지털융합센터 공공데이터 분석팀</span>
              </div>
              <p className="text-xs text-slate-500">제주특별자치도 제주시 중앙로 217 제주벤처마루 9F (이도이동)</p>
              <p className="text-xs text-slate-500">
                연계 데이터셋: 제주데이터허브 제608호 (제주도 구도심 상권 주말 소비 카드 트래픽 정밀 집계, 120행 100% 매칭)
              </p>
            </div>

            <div className="flex flex-col justify-between gap-3 md:col-span-4 md:items-end">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
                  <Verified className="size-3.5 text-[#005BAC]" />
                  <span>공공데이터 표준 품질 인증</span>
                </div>
                <div className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
                  <Database className="size-3.5 text-[#0D9488]" />
                  <span>API 오픈데이터</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-[#005BAC]">
                <Link href="/console" className="hover:underline">
                  분석 콘솔
                </Link>
                <Link href="/history" className="hover:underline">
                  상인회 보고서
                </Link>
                <a
                  href="https://jejudatahub.net/data/view/data/608"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  제주데이터허브 608
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-2 border-t border-slate-100 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center">
            <p>© 2024–2026 Jeju Technopark Big Data Center. All rights reserved.</p>
            <p>본 공공 서비스는 소상공인 의사결정 지원 및 지역경제 활성화를 위해 비회원에게도 무상 개방됩니다.</p>
          </div>
        </div>
      </footer>

      {/* 4. 상인회 3분 요약 매뉴얼 모달 (PDF / 인쇄 미리보기) */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="닫기"
            >
              <X className="size-5" />
            </button>

            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-[#005BAC]">(재)제주테크노파크 빅데이터 센터 공식 가이드</span>
                <h3 className="mt-1 text-xl font-bold text-slate-900">상인회 3분 요약 매뉴얼</h3>
                <p className="text-xs text-slate-500">
                  제주 구도심 주말소비 분석 포털을 활용한 상인회 총회 안건 수립 및 지자체 지원사업 공모 요령
                </p>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                <div className="rounded-lg border border-[#CCFBF1] bg-[#F0FDFA] p-3.5">
                  <h4 className="font-bold text-[#0D9488]">1. 왜 1:1 주말 페어링이 필요한가?</h4>
                  <p className="mt-1">
                    단순 월별 합산은 요일 수가 4회 또는 5회로 달라져 통계 왜곡이 발생합니다. 본 포털은 온전한 토-일 짝을 이룬 주차만을 정규화하여 순수한 요일별 소비 편중을 계산합니다.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                  <h4 className="font-bold text-slate-900">2. 권역별 핵심 의사결정 권고안</h4>
                  <ul className="mt-1.5 list-inside list-disc space-y-1 text-slate-600">
                    <li>
                      <strong>제주시 관덕정·중앙로:</strong> 토요일 피크타임(14~19시) 인력 확충 및 일요일 조기결산 권고.
                    </li>
                    <li>
                      <strong>서귀포 매일올레·이중섭:</strong> 토요일 야간 야시장 식음료 특수 대비 및 일요일 오전 감귤/특산품 번들 판매 집중.
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] p-3.5">
                  <h4 className="font-bold text-[#2563EB]">3. A4 공식 공문서 인쇄 및 직인 활용</h4>
                  <p className="mt-1">
                    &apos;상인회 의사결정 보고서&apos; 화면에서 인쇄 버튼을 누르시면 제주테크노파크 직인과 문서번호가 포함된 공식 A4 규격 서식이 생성되어 지자체 제출용으로 즉시 활용 가능합니다.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Printer className="size-3.5" />
                  <span>매뉴얼 인쇄하기</span>
                </button>
                <Link
                  href="/console"
                  onClick={() => setIsManualModalOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded bg-[#005BAC] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#004380]"
                >
                  <span>데이터 분석 콘솔 바로가기</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
