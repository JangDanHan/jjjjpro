'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart2,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  HelpCircle,
  History,
  Info,
  Layers,
  Lightbulb,
  Lock,
  MessageSquare,
  Network,
  Rocket,
  Scale,
  Send,
  ShieldCheck,
  TrendingUp,
  User,
  Verified,
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
      satWidth: '50.5%',
      sunWidth: '49.5%',
      dominant: '토요일 우세 (+288건)',
      insight: '제주시 구도심은 토요일 점심·오후 유입이 일요일 대비 +2.18% 견고합니다. 일요일 조기마감보다는 주말 풀타임 영업 인력 배치가 유리합니다.',
      queryDistrict: '제주시',
      queryUserType: '내국인',
    },
    chinese: {
      sat: '4,120',
      sun: '4,590',
      diff: '+470건',
      satShare: '47.3%',
      sunShare: '52.7%',
      satWidth: '47.3%',
      sunWidth: '52.7%',
      dominant: '일요일 우세 (+470건)',
      insight: '외국인 관광객(은련카드)은 면세점 및 크루즈 일정 연계로 일요일 결제 비중이 52.7%로 상승합니다. 일요일 다국어 메뉴판 집중 운영을 권장합니다.',
      queryDistrict: '제주시',
      queryUserType: '중국인',
    },
  },
  seogwipo: {
    korean: {
      sat: '9,840',
      sun: '9,110',
      diff: '+730건',
      satShare: '51.9%',
      sunShare: '48.1%',
      satWidth: '51.9%',
      sunWidth: '48.1%',
      dominant: '토요일 우세 (+730건)',
      insight: '이중섭거리·올레시장 일대는 토요일 저녁 외식 및 야시장 지출이 압도적입니다. 토요일 재료 수급 및 서빙 알바 추가 배치가 수익 극대화에 필수적입니다.',
      queryDistrict: '서귀포시',
      queryUserType: '내국인',
    },
    chinese: {
      sat: '2,310',
      sun: '2,480',
      diff: '+170건',
      satShare: '48.2%',
      sunShare: '51.8%',
      satWidth: '48.2%',
      sunWidth: '51.8%',
      dominant: '일요일 우세 (+170건)',
      insight: '서귀포시 외국인 결제는 일요일 귀항 전 올레시장 특산물 선물 구매로 집중됩니다. 감귤 초콜릿, 흑돼지 가공식품 번들 판매가 유효합니다.',
      queryDistrict: '서귀포시',
      queryUserType: '중국인',
    },
  },
}

export function LandingPortal({ user, isAdmin }: Props) {
  const [curDistrict, setCurDistrict] = useState<'jeju' | 'seogwipo'>('jeju')
  const [curSegment, setCurSegment] = useState<'korean' | 'chinese'>('korean')
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({ 0: true })

  const curData = widgetData[curDistrict][curSegment]

  function toggleFaq(index: number) {
    setOpenFaqs((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#111c2c] antialiased">
      {/* 1. Header (공식 JTP GNB) */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            <Link href="/" className="flex shrink-0 items-center gap-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[17px] font-bold tracking-tight text-[#004482]">(재)제주테크노파크</span>
                  <span className="rounded bg-[#dee8ff] px-1.5 py-0.5 text-[11px] font-medium text-[#424751]">빅데이터 센터</span>
                </div>
                <span className="text-[14px] font-semibold tracking-tight text-[#111c2c]">제주 구도심 주말소비 정밀 분석 포털</span>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              <Link href="/" className="rounded-lg bg-[#005bac] px-3.5 py-2 text-sm font-semibold text-white">
                서비스 소개
              </Link>
              <Link href="/console" className="rounded-lg px-3.5 py-2 text-sm font-normal text-[#424751] transition-colors hover:text-[#111c2c]">
                데이터 분석 콘솔
              </Link>
              <Link href="/history" className="rounded-lg px-3.5 py-2 text-sm font-normal text-[#424751] transition-colors hover:text-[#111c2c]">
                상인회 의사결정 보고서 / 이력
              </Link>
            </nav>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden flex-col items-end xl:flex">
                <div className="flex items-center gap-1">
                  <span className="inline-block size-2 rounded-full bg-[#006760]" />
                  <span className="text-[11px] font-semibold text-[#111c2c]">공식 제608호 관측 검증</span>
                </div>
                <span className="text-[11px] text-[#424751]">2016.09 ~ 2017.11 시계열</span>
              </div>

              <div className="hidden items-center gap-1 rounded bg-[#f0f3ff] px-2.5 py-1 sm:flex">
                <Info className="size-3.5 text-[#265cb1]" />
                <span className="text-[11px] text-[#424751]">비회원 무료 이용</span>
              </div>

              {user ? (
                <Link
                  href="/console"
                  className="flex items-center gap-1.5 rounded-lg bg-[#005bac] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#004482]"
                >
                  <span>분석 콘솔 열기</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="flex items-center gap-1.5 rounded-lg bg-[#005bac] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#004482]"
                >
                  <span>로그인 / 상인회 인증</span>
                  <Lock className="size-3.5" />
                </Link>
              )}

              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#004482]">
                <User className="size-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Body */}
      <main className="w-full bg-[#f9f9ff] pt-20">
        <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-8">
          <div className="flex w-full flex-col">
            {/* Hero Section */}
            <section className="relative mb-10 overflow-hidden rounded-2xl bg-[#f0f3ff] p-6 shadow-sm sm:p-10">
              <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-[#d5e3ff]/40 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 right-1/3 size-80 rounded-full bg-[#d8e2ff]/50 blur-2xl" />

              <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                {/* Left: Value Prop & CTA */}
                <div className="flex flex-col gap-4 lg:col-span-7">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded bg-[#005bac] px-2.5 py-0.5 text-xs font-semibold tracking-wide text-white">
                      <Verified className="size-3.5" /> 공공데이터 제608호 공식 인증
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-[#dee8ff] px-2.5 py-0.5 text-xs font-medium text-[#424751]">
                      2016.09 ~ 2017.11 전수 시계열
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-white px-2.5 py-0.5 text-xs font-semibold text-[#004d47] shadow-sm">
                      수작업 엑셀 페어링 ZERO
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <p className="text-lg font-bold tracking-tight text-[#265cb1]">제주테크노파크 빅데이터 센터</p>
                    <h1 className="mt-1 text-3xl font-extrabold leading-tight tracking-tight text-[#111c2c] sm:text-5xl">
                      데이터로 여는 제주<br />
                      <span className="text-[#005bac]">골목상권의 내일</span>
                    </h1>
                  </div>

                  <p className="max-w-xl text-base leading-relaxed text-[#424751]">
                    수작업 엑셀 작업 없이 1초 만에 완료되는 토·일 주말 소비 패턴 정밀 검증. 
                    상인회 총회, 지자체 지원사업 공모, 매장 운영시간 개편에 필요한 법적·행정적 정량 근거를 비회원 무료로 즉시 생성하세요.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href="/console"
                      className="group flex items-center gap-2 rounded-lg bg-[#005bac] px-6 py-3 text-base font-semibold text-white shadow-md transition-all hover:bg-[#004482]"
                    >
                      <span>데이터 분석 콘솔 바로가기</span>
                      <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                      href="/history"
                      className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-[#004482] shadow-sm transition-colors hover:bg-[#e7eeff]"
                    >
                      <Download className="size-4" />
                      <span>상인회 3분 요약 매뉴얼 PDF</span>
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#424751]">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="size-4 text-[#006760]" />
                      <span>가입·로그인 없는 즉시 무료 조회</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="size-4 text-[#006760]" />
                      <span>토·일 1:1 완결 페어링 필터</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="size-4 text-[#006760]" />
                      <span>A4 공문서 출력용 정량 서식</span>
                    </div>
                  </div>
                </div>

                {/* Right: Interactive Quick Compare Widget */}
                <div className="flex flex-col lg:col-span-5">
                  <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 animate-pulse rounded-full bg-[#005bac]" />
                        <span className="text-base font-bold text-[#111c2c]">1초 퀵 비교 체험 위젯</span>
                      </div>
                      <span className="rounded bg-[#e7eeff] px-2 py-0.5 text-xs text-[#424751]">기준: &apos;17년 11월 마감</span>
                    </div>

                    {/* District Selection Tabs */}
                    <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#e7eeff] p-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setCurDistrict('jeju')}
                        className={`rounded-md py-1.5 font-semibold transition-all ${
                          curDistrict === 'jeju' ? 'bg-[#005bac] text-white shadow-sm' : 'text-[#424751] hover:text-[#111c2c]'
                        }`}
                      >
                        제주시 구도심 (관덕정/중앙로)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurDistrict('seogwipo')}
                        className={`rounded-md py-1.5 font-semibold transition-all ${
                          curDistrict === 'seogwipo' ? 'bg-[#005bac] text-white shadow-sm' : 'text-[#424751] hover:text-[#111c2c]'
                        }`}
                      >
                        서귀포시 구도심 (이중섭/매일올레)
                      </button>
                    </div>

                    {/* Demographic Segment Tabs */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#424751]">소비자 세부 군집:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCurSegment('korean')}
                          className={`rounded px-2.5 py-1 ${curSegment === 'korean' ? 'bg-[#dee8ff] font-bold text-[#004482]' : 'bg-[#f0f3ff] text-[#424751] hover:bg-[#e7eeff]'}`}
                        >
                          내국인 소비
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurSegment('chinese')}
                          className={`rounded px-2.5 py-1 ${curSegment === 'chinese' ? 'bg-[#dee8ff] font-bold text-[#004482]' : 'bg-[#f0f3ff] text-[#424751] hover:bg-[#e7eeff]'}`}
                        >
                          외국인(은련/중국인)
                        </button>
                      </div>
                    </div>

                    {/* Live Result Card */}
                    <div className="flex flex-col gap-3 rounded-xl bg-[#f0f3ff] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#424751]">
                          {curDistrict === 'jeju' ? '제주시 구도심' : '서귀포시 구도심'} × {curSegment === 'korean' ? '내국인 소비 건수' : '외국인 소비 건수'}
                        </span>
                        <span className="rounded bg-[#004d47] px-2 py-0.5 text-xs font-bold text-white">
                          {curData.dominant}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        {/* Saturday Card */}
                        <div className="flex flex-col rounded-lg bg-white p-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#004d47]">토요일 (Sat)</span>
                            <Calendar className="size-3.5 text-[#004d47]" />
                          </div>
                          <span className="mt-1 text-2xl font-bold text-[#111c2c]">{curData.sat}</span>
                          <span className="text-xs text-[#424751]">카드 승인건 ({curData.satShare})</span>
                        </div>

                        {/* Sunday Card */}
                        <div className="flex flex-col rounded-lg bg-white p-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#265cb1]">일요일 (Sun)</span>
                            <Calendar className="size-3.5 text-[#265cb1]" />
                          </div>
                          <span className="mt-1 text-2xl font-bold text-[#111c2c]">{curData.sun}</span>
                          <span className="text-xs text-[#424751]">카드 승인건 ({curData.sunShare})</span>
                        </div>
                      </div>

                      {/* Difference Progress bar */}
                      <div className="flex flex-col gap-1 pt-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-[#004d47]">토요일 비중 {curData.satShare}</span>
                          <span className="text-[#265cb1]">일요일 비중 {curData.sunShare}</span>
                        </div>
                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#e7eeff]">
                          <div className="h-full bg-[#004d47] transition-all duration-300" style={{ width: curData.satWidth }} />
                          <div className="h-full bg-[#265cb1] transition-all duration-300" style={{ width: curData.sunWidth }} />
                        </div>
                      </div>

                      {/* Insights pill */}
                      <div className="flex items-start gap-1.5 rounded bg-[#e7eeff] p-2.5 text-xs text-[#111c2c]">
                        <Lightbulb className="mt-0.5 size-4 shrink-0 text-[#005bac]" />
                        <p>
                          <strong className="font-semibold text-[#005bac]">의사결정 팁:</strong> {curData.insight}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/console?district=${encodeURIComponent(curData.queryDistrict)}&userType=${encodeURIComponent(curData.queryUserType)}&startMonth=2017-11&endMonth=2017-11`}
                      className="flex items-center justify-center gap-1 rounded-lg bg-[#265cb1] py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#004482]"
                    >
                      <span>해당 조건 콘솔에서 심층 분석하기</span>
                      <ChevronRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* 6 Major Core Analytics Features Grid */}
            <section className="mb-14 flex flex-col gap-4">
              <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
                <div>
                  <span className="text-xs font-bold tracking-wider text-[#265cb1]">OFFICIAL PUBLIC CAPABILITIES</span>
                  <h2 className="text-2xl font-bold tracking-tight text-[#111c2c] sm:text-3xl">6대 공공 분석 원클릭 서비스</h2>
                </div>
                <p className="max-w-md text-xs text-[#424751] sm:text-sm">
                  소상공인부터 도시재생 지원센터 연구원까지 누구나 직관적으로 사용할 수 있는 표준화 모듈을 제공합니다.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Feature 1 */}
                <Link href="/console" className="group flex flex-col justify-between rounded-xl bg-white p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex flex-col gap-3">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-[#dee8ff] text-[#004482] transition-colors group-hover:bg-[#005bac] group-hover:text-white">
                      <Scale className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#111c2c] transition-colors group-hover:text-[#005bac]">토·일 결제 정밀 비교</h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#424751]">
                        토요일과 일요일의 승인 건수·단가 격차를 1:1 완결 주차 단위로 정확히 계산하여 요일별 영업 가이드를 제시합니다.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 pt-4 text-xs font-semibold text-[#005bac]">
                    <span>콘솔 열기</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>

                {/* Feature 2 */}
                <Link href="/console" className="group flex flex-col justify-between rounded-xl bg-white p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex flex-col gap-3">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-[#dee8ff] text-[#004482] transition-colors group-hover:bg-[#005bac] group-hover:text-white">
                      <MessageSquare className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#111c2c] transition-colors group-hover:text-[#005bac]">자연어 대화형 질의 분석</h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#424751]">
                        &ldquo;작년 가을 제주시 토요일 매출은?&rdquo;, &ldquo;그럼 서귀포는?&rdquo; 처럼 직전 문맥을 기억하며 사람과 대화하듯 질의합니다.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 pt-4 text-xs font-semibold text-[#005bac]">
                    <span>AI 쿼리 체험</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>

                {/* Feature 3 */}
                <Link href="/console" className="group flex flex-col justify-between rounded-xl bg-white p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex flex-col gap-3">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-[#dee8ff] text-[#004482] transition-colors group-hover:bg-[#005bac] group-hover:text-white">
                      <TrendingUp className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#111c2c] transition-colors group-hover:text-[#005bac]">15개월 월별 추이 리포트</h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#424751]">
                        2016년 9월부터 2017년 11월까지의 사드 배치 전후 계절 변동과 중국인 관광객 축소에 따른 상권 체질 변화를 시각화합니다.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 pt-4 text-xs font-semibold text-[#005bac]">
                    <span>시계열 보기</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>

                {/* Feature 4 */}
                <Link href="/console" className="group flex flex-col justify-between rounded-xl bg-white p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex flex-col gap-3">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-[#dee8ff] text-[#004482] transition-colors group-hover:bg-[#005bac] group-hover:text-white">
                      <ShieldCheck className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#111c2c] transition-colors group-hover:text-[#005bac]">공식 제608호 데이터 검증</h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#424751]">
                        제주데이터허브 원천 로우데이터와 결합하여 검증 해시코드 및 무결성 메타데이터를 투명하게 공개합니다.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 pt-4 text-xs font-semibold text-[#005bac]">
                    <span>품질 규격 확인</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>

                {/* Feature 5 */}
                <Link href="/history" className="group flex flex-col justify-between rounded-xl bg-white p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex flex-col gap-3">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-[#dee8ff] text-[#004482] transition-colors group-hover:bg-[#005bac] group-hover:text-white">
                      <FileText className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#111c2c] transition-colors group-hover:text-[#005bac]">상인회 회의 안건 표준 서식</h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#424751]">
                        지자체 보조금 신청, 차 없는 거리 건의, 공동 마케팅 안건으로 바로 인쇄할 수 있는 공공 표준 A4 템플릿을 생성합니다.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 pt-4 text-xs font-semibold text-[#005bac]">
                    <span>서식 템플릿</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>

                {/* Feature 6 */}
                <a href="https://jejudatahub.net/data/view/data/608" target="_blank" rel="noreferrer" className="group flex flex-col justify-between rounded-xl bg-white p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex flex-col gap-3">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-[#dee8ff] text-[#004482] transition-colors group-hover:bg-[#005bac] group-hover:text-white">
                      <Network className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#111c2c] transition-colors group-hover:text-[#005bac]">공공데이터 표준 API 연동</h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#424751]">
                        지자체 스마트 행정 시스템, 대학교 산학 협력단, 스타트업 연구소에서 손쉽게 가져갈 수 있는 REST/JSON 엔드포인트를 제공합니다.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 pt-4 text-xs font-semibold text-[#005bac]">
                    <span>API 문서 열람</span>
                    <ExternalLink className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </a>
              </div>
            </section>

            {/* 3 Big Innovation Cards: Why Merchants Love It */}
            <section className="mb-14 flex flex-col gap-6 rounded-2xl bg-[#f0f3ff] p-6 sm:p-10">
              <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-[#005bac]">CORE ADVANTAGES</span>
                <h2 className="mt-1 text-2xl font-bold text-[#111c2c] sm:text-3xl">왜 상인회는 &apos;제주 주말소비&apos;를 찾는가?</h2>
                <p className="mt-2 text-xs leading-relaxed text-[#424751] sm:text-sm">
                  복잡한 수식과 오류투성이 엑셀 매칭에서 해방되어, 오직 골목상권 활성화와 매출 성장에만 집중할 수 있는 3대 핵심 혁신.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Innovation 1 */}
                <div className="flex flex-col justify-between rounded-xl bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[#005bac]">01</span>
                      <span className="rounded bg-[#dee8ff] px-2 py-0.5 text-xs font-semibold text-[#004482]">100% 자동 매칭</span>
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-[#111c2c]">수작업 엑셀 페어링 ZERO</h3>
                    <p className="text-xs leading-relaxed text-[#424751]">
                      달력에 짝이 안 맞는 토요일이나 일요일이 끼어 있는 불완전 주차를 원천 배제합니다. 토·일 완결 페어링 알고리즘이 통계적 왜곡을 0%로 통제합니다.
                    </p>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-[#e7eeff] pt-4 text-xs text-[#424751]">
                    <span>엑셀 취합 시간</span>
                    <span className="font-semibold text-red-500 line-through">4시간 소요</span>
                    <ArrowRight className="size-3.5 text-[#004d47]" />
                    <span className="font-bold text-[#004d47]">1초 즉시 계산</span>
                  </div>
                </div>

                {/* Innovation 2 */}
                <div className="flex flex-col justify-between rounded-xl bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[#005bac]">02</span>
                      <span className="rounded bg-[#dee8ff] px-2 py-0.5 text-xs font-semibold text-[#004482]">회의용 정량 근거</span>
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-[#111c2c]">확실한 수치 기반 안건 채택</h3>
                    <p className="text-xs leading-relaxed text-[#424751]">
                      &ldquo;체감상 토요일이 더 바쁩니다&rdquo;라는 애매한 주장이 아닌 &ldquo;+288건(+2.18%) 승인 건수 우세&rdquo;라는 명확한 데이터로 의결과 행정 지원을 이끌어냅니다.
                    </p>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-[#e7eeff] pt-4 text-xs text-[#424751]">
                    <span>제출 신뢰도</span>
                    <span className="font-semibold text-[#424751]">구두 설득</span>
                    <ArrowRight className="size-3.5 text-[#005bac]" />
                    <span className="font-bold text-[#005bac]">공공인증 통계 증빙</span>
                  </div>
                </div>

                {/* Innovation 3 */}
                <div className="flex flex-col justify-between rounded-xl bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[#005bac]">03</span>
                      <span className="rounded bg-[#dee8ff] px-2 py-0.5 text-xs font-semibold text-[#004482]">대화 맥락 계승</span>
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-[#111c2c]">맥락을 기억하는 연속 대화</h3>
                    <p className="text-xs leading-relaxed text-[#424751]">
                      제주시 통계를 보다가 &ldquo;그럼 서귀포는?&rdquo;, &ldquo;중국인 비율만 따로 보면?&rdquo;이라고 묻기만 하면 이전 필터 조건을 유지한 채 비교 결과만 갱신합니다.
                    </p>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-[#e7eeff] pt-4 text-xs text-[#424751]">
                    <span>필터 재설정 번거로움</span>
                    <span className="font-semibold text-red-500">매번 클릭</span>
                    <ArrowRight className="size-3.5 text-[#004d47]" />
                    <span className="font-bold text-[#004d47]">스마트 문맥 상속</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Live Console Demo Preview Showcase */}
            <section className="mb-14 flex flex-col gap-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <span className="text-xs font-bold tracking-wider text-[#006760]">LIVE INTERFACE PREVIEW</span>
                  <h2 className="text-2xl font-bold tracking-tight text-[#111c2c] sm:text-3xl">전문가용 콘솔을 누구나 쉽게</h2>
                </div>
                <Link
                  href="/console"
                  className="flex items-center gap-1.5 self-start rounded-lg bg-[#005bac] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#004482] sm:self-auto"
                >
                  <span>콘솔 전체 화면으로 열기</span>
                  <ExternalLink className="size-3.5" />
                </Link>
              </div>

              {/* UI Mockup Container */}
              <div className="flex flex-col gap-4 overflow-hidden rounded-2xl bg-white p-5 shadow-md lg:p-7">
                {/* Mock Top Bar */}
                <div className="flex items-center justify-between border-b border-[#e7eeff] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-[#ba1a1a]" />
                    <span className="size-3 rounded-full bg-[#77a5ff]" />
                    <span className="size-3 rounded-full bg-[#006760]" />
                    <span className="ml-2 text-xs font-semibold text-[#111c2c]">실시간 분석 콘솔 프리뷰 (버전 2.4-공공표준)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#424751]">
                    <CheckCircle className="size-4 text-[#006760]" />
                    <span>동기화 완료: 2017-11-30</span>
                  </div>
                </div>

                {/* Mockup Grid Content */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                  {/* Mock Left: Natural Language Input & Chat Box */}
                  <div className="flex flex-col justify-between gap-4 rounded-xl bg-[#f0f3ff] p-4 lg:col-span-4">
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-bold uppercase tracking-wide text-[#004482]">자연어 분석기 질의 예시</span>
                      <div className="flex flex-col gap-2.5">
                        <div className="max-w-[88%] self-end rounded-xl bg-[#005bac] p-2.5 text-xs text-white">
                          2017년 10월 제주시 구도심 토요일 소비량 얼마야?
                        </div>
                        <div className="flex max-w-[92%] flex-col gap-1 self-start rounded-xl bg-white p-2.5 text-xs text-[#111c2c] shadow-sm">
                          <span className="font-bold text-[#004d47]">집계 완료 (1:1 주말 매칭)</span>
                          <span className="leading-relaxed">총 14,812건 (일요일 대비 +512건 우세)입니다. 주요 소비 시간대는 13~15시입니다.</span>
                        </div>
                        <div className="max-w-[88%] self-end rounded-xl bg-[#005bac] p-2.5 text-xs text-white">
                          그럼 서귀포시는 어땠어?
                        </div>
                        <div className="flex max-w-[92%] flex-col gap-1 self-start rounded-xl bg-white p-2.5 text-xs text-[#111c2c] shadow-sm">
                          <span className="font-bold text-[#265cb1]">문맥 유지: 2017년 10월</span>
                          <span className="leading-relaxed">서귀포시 구도심 토요일은 10,230건으로 제주시와 달리 야간 18~20시 집중도가 높습니다.</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/console?question=${encodeURIComponent('11월 중국인 소비 패턴은 어때?')}`}
                      className="group flex items-center gap-2 rounded-xl bg-white p-1.5 shadow-sm transition hover:ring-2 hover:ring-[#005bac]"
                    >
                      <input
                        className="w-full bg-transparent px-2.5 py-1 text-xs text-[#111c2c] outline-none cursor-pointer"
                        readOnly
                        type="text"
                        value="11월 중국인 소비 패턴은 어때?"
                      />
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#005bac] text-white transition-transform group-hover:scale-105">
                        <Send className="size-3.5" />
                      </span>
                    </Link>
                  </div>

                  {/* Mock Right: Chart & Metric Breakdown */}
                  <div className="flex flex-col gap-4 lg:col-span-8">
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                      <div className="flex flex-col rounded-xl bg-[#f0f3ff] p-3.5">
                        <span className="text-xs font-medium text-[#424751]">15개월 누적 관측 건수</span>
                        <span className="mt-1 text-xl font-bold text-[#111c2c]">384,290<span className="ml-0.5 text-xs font-normal">건</span></span>
                        <span className="text-[11px] font-semibold text-[#004d47]">무결성 100% 인증</span>
                      </div>
                      <div className="flex flex-col rounded-xl bg-[#f0f3ff] p-3.5">
                        <span className="text-xs font-medium text-[#424751]">토요일 평균 우세율</span>
                        <span className="mt-1 text-xl font-bold text-[#004482]">+2.45<span className="ml-0.5 text-xs font-normal">%</span></span>
                        <span className="text-[11px] font-semibold text-[#004482]">15개월 중 13개월 토요일 리드</span>
                      </div>
                      <div className="flex flex-col rounded-xl bg-[#f0f3ff] p-3.5">
                        <span className="text-xs font-medium text-[#424751]">외국인 일요 반등률</span>
                        <span className="mt-1 text-xl font-bold text-[#265cb1]">+5.21<span className="ml-0.5 text-xs font-normal">%</span></span>
                        <span className="text-[11px] font-semibold text-[#265cb1]">출국 직전 면세·특산품 결제</span>
                      </div>
                    </div>

                    {/* Synthetic Interactive SVG Bar Graph */}
                    <div className="flex flex-col gap-2 rounded-xl bg-[#f0f3ff] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#111c2c]">2017년 하반기 토요일 vs 일요일 월별 결제 건수 추이</span>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded bg-[#004d47]" />
                            <span>토요일</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded bg-[#265cb1]" />
                            <span>일요일</span>
                          </span>
                        </div>
                      </div>

                      {/* SVG Data Visualisation */}
                      <div className="h-44 w-full pt-2">
                        <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 600 160">
                          {/* Grid Lines */}
                          <line stroke="#dee8ff" strokeWidth="1" x1="40" x2="580" y1="20" y2="20" />
                          <line stroke="#dee8ff" strokeWidth="1" x1="40" x2="580" y1="60" y2="60" />
                          <line stroke="#dee8ff" strokeWidth="1" x1="40" x2="580" y1="100" y2="100" />
                          <line stroke="#dee8ff" strokeWidth="1" x1="40" x2="580" y1="140" y2="140" />

                          {/* Month 7 */}
                          <rect fill="#004d47" height="102" rx="3" width="22" x="70" y="38" />
                          <rect fill="#265cb1" height="92" rx="3" width="22" x="96" y="48" />
                          <text fill="#424751" fontSize="11" textAnchor="middle" x="94" y="155">7월</text>

                          {/* Month 8 (Peak Summer) */}
                          <rect fill="#004d47" height="116" rx="3" width="22" x="160" y="24" />
                          <rect fill="#265cb1" height="108" rx="3" width="22" x="186" y="32" />
                          <text fill="#424751" fontSize="11" textAnchor="middle" x="184" y="155">8월</text>

                          {/* Month 9 */}
                          <rect fill="#004d47" height="96" rx="3" width="22" x="250" y="44" />
                          <rect fill="#265cb1" height="88" rx="3" width="22" x="276" y="52" />
                          <text fill="#424751" fontSize="11" textAnchor="middle" x="274" y="155">9월</text>

                          {/* Month 10 */}
                          <rect fill="#004d47" height="110" rx="3" width="22" x="340" y="30" />
                          <rect fill="#265cb1" height="100" rx="3" width="22" x="366" y="40" />
                          <text fill="#424751" fontSize="11" textAnchor="middle" x="364" y="155">10월</text>

                          {/* Month 11 */}
                          <rect fill="#004d47" height="94" rx="3" width="22" x="430" y="46" />
                          <rect fill="#265cb1" height="90" rx="3" width="22" x="456" y="50" />
                          <text fill="#424751" fontSize="11" textAnchor="middle" x="454" y="155">11월</text>

                          {/* Trend overlay line for Sat */}
                          <polyline fill="none" points="81,38 171,24 261,44 351,30 441,46" stroke="#81e5da" strokeDasharray="4" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Visual Richness Section: Spatial District Context */}
            <section className="mb-14 grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="flex flex-col justify-between rounded-2xl bg-[#f0f3ff] p-6 md:col-span-6 sm:p-8">
                <div className="flex flex-col gap-2">
                  <span className="w-fit rounded bg-[#004482] px-2 py-0.5 text-xs font-semibold text-white">공간 빅데이터 결합</span>
                  <h3 className="text-xl font-bold text-[#111c2c]">제주시 관덕정·칠성로 원도심권</h3>
                  <p className="text-xs leading-relaxed text-[#424751]">
                    제주 목관아, 동문시장, 칠성로 지하상가로 연결되는 역사문화 소비 벨트. 토요일 14~18시 청소년 및 도민 가족단위 소비가 가장 집중되는 권역입니다.
                  </p>
                </div>
                <div className="relative mt-5 h-48 overflow-hidden rounded-xl shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzTRnCHl-37VoiJCWtXIkYQHLJCnk3w3I2zOSELh8iYGV_0PXSQpejl6MqgiHkGASunGqqRBvnZcWLC4CJec7JwlEcjt4TMiNaxMGV3Um9T5qxCYOgxWaFhHGuB72dbNlhuBbFTQ-lcC075NEtp62E9_1kE-UJ6W784UNo_OzQp4RqVfa76g7Xljg_pZ-XrlMHLmvCvG_ZWPibT0Rc9yD6qAPa0ORg2ciXmjp-okUo"
                    alt="제주시 관덕정 및 칠성로 원도심권 상권 전경"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 rounded bg-[#263142]/85 px-2.5 py-1 text-xs text-[#ebf1ff] backdrop-blur-sm">
                    관덕정로 일원 격자 분석 완료
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-2xl bg-[#f0f3ff] p-6 md:col-span-6 sm:p-8">
                <div className="flex flex-col gap-2">
                  <span className="w-fit rounded bg-[#265cb1] px-2 py-0.5 text-xs font-semibold text-white">공간 빅데이터 결합</span>
                  <h3 className="text-xl font-bold text-[#111c2c]">서귀포시 매일올레·이중섭거리권</h3>
                  <p className="text-xs leading-relaxed text-[#424751]">
                    서귀포 관광 야시장과 이중섭 문화거리가 공존하는 남부 핵심 상권. 토요일 야간 식음료 지출과 일요일 오전 특산품 매입이 상권 매출의 80% 이상을 차지합니다.
                  </p>
                </div>
                <div className="relative mt-5 h-48 overflow-hidden rounded-xl shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRmhDDXUxuEM1mrq9JkdN2i75twom_dYpV46meXVDs1XhcL3vbplFvFYpANSssKwuzcfZ13vUs65Tl_q3qD-NQGhwx8Z0-Fjxg4u-JSdiJ2b7-HraUy1V4Vc3n5kmqtg9-76cfhfytvyuhIU8oWZ6sbBhpFq_oV_zqHeCzLJfcggOOQEe4u5vA9XdKM2BtopUN3JwFNCUZT8je5WYr7e6hpGSrcGTPnz3G7HvZ0S8R"
                    alt="서귀포시 매일올레시장 및 이중섭거리 상권 전경"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 rounded bg-[#263142]/85 px-2.5 py-1 text-xs text-[#ebf1ff] backdrop-blur-sm">
                    중정로 및 이중섭로 격자 분석 완료
                  </div>
                </div>
              </div>
            </section>
            <section className="mb-14 flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider text-[#005bac]">DATA QUALITY &amp; GOVERNANCE</span>
                <h2 className="text-2xl font-bold tracking-tight text-[#111c2c] sm:text-3xl">공공데이터 신뢰 거버넌스 4단계</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-2 rounded-xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#005bac] text-xs font-bold text-white">1</span>
                    <Database className="size-5 text-[#005bac]" />
                  </div>
                  <h4 className="mt-1 text-base font-bold text-[#111c2c]">원천 데이터 수집</h4>
                  <p className="text-xs leading-relaxed text-[#424751]">제주데이터허브 제608호 신용카드 승인 트래픽 전수 레코드(15개월치) 정밀 인출.</p>
                </div>

                <div className="flex flex-col gap-2 rounded-xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#005bac] text-xs font-bold text-white">2</span>
                    <Layers className="size-5 text-[#005bac]" />
                  </div>
                  <h4 className="mt-1 text-base font-bold text-[#111c2c]">2대 권역 지오코딩</h4>
                  <p className="text-xs leading-relaxed text-[#424751]">제주시 구도심과 서귀포시 구도심의 법정동 및 행정 격자 경계 정밀 매핑 및 필터링.</p>
                </div>

                <div className="flex flex-col gap-2 rounded-xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#005bac] text-xs font-bold text-white">3</span>
                    <Scale className="size-5 text-[#005bac]" />
                  </div>
                  <h4 className="mt-1 text-base font-bold text-[#111c2c]">1:1 완결 페어링</h4>
                  <p className="text-xs leading-relaxed text-[#424751]">토요일과 일요일이 완결되지 않은 분절 주차 배제 및 요일간 비교 계량치 정규화.</p>
                </div>

                <div className="flex flex-col gap-2 rounded-xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#006760] text-xs font-bold text-white">4</span>
                    <FileText className="size-5 text-[#006760]" />
                  </div>
                  <h4 className="mt-1 text-base font-bold text-[#111c2c]">실무용 리포트 도출</h4>
                  <p className="text-xs leading-relaxed text-[#424751]">의사결정 보고서, 회의용 안건 요약표, 정책 지원 증빙 표준 PDF 및 엑셀 다운로드.</p>
                </div>
              </div>
            </section>

            {/* FAQ Accordion for Merchant Associations */}
            <section className="mb-14 flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wider text-[#265cb1]">FREQUENTLY ASKED QUESTIONS</span>
                <h2 className="text-2xl font-bold tracking-tight text-[#111c2c] sm:text-3xl">상인회 자주 묻는 질문 (FAQ)</h2>
              </div>

              <div className="flex flex-col gap-2.5">
                {/* FAQ 1 */}
                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleFaq(0)}
                    className="flex w-full items-center justify-between p-4 text-left hover:bg-[#f0f3ff]"
                  >
                    <span className="flex items-center gap-2 text-sm font-bold text-[#111c2c]">
                      <span className="text-base text-[#005bac]">Q.</span>
                      비회원이나 일반 상인도 아무 제한 없이 무료로 이용할 수 있나요?
                    </span>
                    <ChevronDown className={`size-4 text-[#424751] transition-transform ${openFaqs[0] ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaqs[0] && (
                    <div className="border-t border-[#f0f3ff] px-4 pb-4 pt-2 text-xs leading-relaxed text-[#424751]">
                      네, 맞습니다. 본 포털은 (재)제주테크노파크 빅데이터 센터가 제주 골목상권 활성화 및 소상공인 정책 지원을 목적으로 구축한 공공 서비스입니다. 별도의 회원가입이나 로그인 절차 없이 모든 통계 조회, 비교 차트, 보고서 열람 기능을 상시 무료로 개방하고 있습니다.
                    </div>
                  )}
                </div>

                {/* FAQ 2 */}
                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleFaq(1)}
                    className="flex w-full items-center justify-between p-4 text-left hover:bg-[#f0f3ff]"
                  >
                    <span className="flex items-center gap-2 text-sm font-bold text-[#111c2c]">
                      <span className="text-base text-[#005bac]">Q.</span>
                      지자체 지원사업이나 소상공인진흥공단 제출 시 공식 증빙으로 쓸 수 있나요?
                    </span>
                    <ChevronDown className={`size-4 text-[#424751] transition-transform ${openFaqs[1] ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaqs[1] && (
                    <div className="border-t border-[#f0f3ff] px-4 pb-4 pt-2 text-xs leading-relaxed text-[#424751]">
                      네, 공식 증빙으로 활용 가능합니다. 포털의 데이터는 공공데이터 개방 표준에 따라 제주데이터허브 제608호 관측 데이터를 기반으로 무결성 검증을 마쳤습니다. &apos;상인회 의사결정 보고서&apos; 메뉴에서 인쇄하기를 누르시면 공공 발급 고유 일련번호와 직인이 포함된 공식 A4 규격 서식으로 출력됩니다.
                    </div>
                  )}
                </div>

                {/* FAQ 3 */}
                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleFaq(2)}
                    className="flex w-full items-center justify-between p-4 text-left hover:bg-[#f0f3ff]"
                  >
                    <span className="flex items-center gap-2 text-sm font-bold text-[#111c2c]">
                      <span className="text-base text-[#005bac]">Q.</span>
                      왜 토요일과 일요일 1:1 페어링 분석이 엑셀보다 정확한가요?
                    </span>
                    <ChevronDown className={`size-4 text-[#424751] transition-transform ${openFaqs[2] ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaqs[2] && (
                    <div className="border-t border-[#f0f3ff] px-4 pb-4 pt-2 text-xs leading-relaxed text-[#424751]">
                      단순 월별 합산 엑셀을 보면 월에 따라 토요일이 5번이고 일요일이 4번인 경우가 빈번합니다. 이 경우 토요일 매출이 많은 것처럼 착시가 발생합니다. 본 시스템은 온전하게 토-일이 짝을 이루는 주차만을 자동 선별 매칭하여 평균 단가와 건수를 산출하므로, 요일별 왜곡 없이 순수한 소비 선호도를 파악할 수 있습니다.
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Bottom Massive Conversion CTA Banner */}
            <section className="relative overflow-hidden rounded-2xl bg-[#263142] p-8 text-white shadow-xl sm:p-12">
              <div className="pointer-events-none absolute -right-16 -top-16 size-80 rounded-full bg-[#005bac]/20 blur-3xl" />
              <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
                <div className="flex flex-col gap-2">
                  <span className="inline-flex w-fit items-center gap-1 rounded bg-[#006760] px-2.5 py-0.5 text-xs font-bold text-white">
                    <Rocket className="size-3.5" /> 소상공인 무료 상시 개방 포털
                  </span>
                  <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                    지금 무료로 데이터 분석 콘솔을 시작하세요
                  </h2>
                  <p className="max-w-xl text-xs text-[#c2c6d3] sm:text-sm">
                    가입 필요 없음 · 즉시 조회 가능 · 제주 구도심 상인회의 정량적 의사결정을 제주테크노파크 빅데이터 센터가 뒷받침합니다.
                  </p>
                </div>

                <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row">
                  <Link
                    href="/console"
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#005bac] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#265cb1]"
                  >
                    <span>데이터 분석 콘솔 시작하기</span>
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/history"
                    className="flex items-center justify-center rounded-lg bg-white/10 px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-white/20"
                  >
                    <span>상인회 등록 문의</span>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="mt-14 w-full bg-[#f0f3ff] text-[#424751] shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
        <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-8">
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="flex flex-col gap-1.5 md:col-span-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-[#111c2c]">(재)제주테크노파크 빅데이터 센터</span>
                <span className="text-[#c2c6d3]">|</span>
                <span className="text-xs font-medium text-[#111c2c]">디지털융합센터 공공데이터 분석팀</span>
              </div>
              <p className="text-xs text-[#424751]">제주특별자치도 제주시 중앙로 217 제주벤처마루 9F (이도이동)</p>
              <p className="text-xs text-[#424751]">연계 데이터셋: 제주데이터허브 제608호 (제주도 구도심 상권 주말 소비 카드 트래픽 정밀 집계)</p>
            </div>

            <div className="flex flex-col justify-between gap-3 md:col-span-4 md:items-end">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded bg-white px-2 py-1 text-xs text-[#111c2c]">
                  <Verified className="size-3.5 text-[#004482]" />
                  <span>공공데이터 표준 품질 인증</span>
                </div>
                <div className="flex items-center gap-1 rounded bg-white px-2 py-1 text-xs text-[#111c2c]">
                  <Database className="size-3.5 text-[#006760]" />
                  <span>API 오픈데이터</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-[#005bac]">
                <Link href="/console" className="hover:underline">분석 콘솔</Link>
                <a href="https://jejudatahub.net/data/view/data/608" target="_blank" rel="noreferrer" className="hover:underline">
                  제주데이터허브 608
                </a>
                <Link href="/sign-in" className="hover:underline">관리자 로그인</Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-2 border-t border-[#dee8ff] pt-4 text-xs text-[#727783] sm:flex-row sm:items-center">
            <p>© 2024–2026 Jeju Technopark Big Data Center. All rights reserved.</p>
            <p>본 공공 서비스는 소상공인 의사결정 지원 및 지역경제 활성화를 위해 비회원에게도 무상 개방됩니다.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
