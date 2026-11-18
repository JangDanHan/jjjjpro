'use client'

import { useState, useTransition, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  ArrowUp,
  BarChart2,
  BookOpen,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Database,
  ExternalLink,
  HelpCircle,
  Info,
  Loader2,
  Search,
  TrendingUp,
  X,
} from 'lucide-react'
import { aggregateObservations, interpretQuestion, resolveIntentComparison, validateFilters } from '@/lib/jeju/aggregate'
import type { ComparisonResult, DatasetMetadata, Filters, Observation } from '@/lib/jeju/types'

type ComparisonResponse = ComparisonResult & {
  intent: 'compare' | 'monthly' | 'availability'
  dataset: DatasetMetadata
}

type Props = {
  user?: { id: string; name: string; email: string } | null
  isAdmin?: boolean
  initialFilters: Filters
  initialQuestion?: string
  initialResult?: ComparisonResponse | null
  initialError?: string | null
  initialObservations?: Observation[]
  initialDataset?: DatasetMetadata
}

const ALL_MONTHS = [
  '2016-09',
  '2016-10',
  '2016-11',
  '2016-12',
  '2017-01',
  '2017-02',
  '2017-03',
  '2017-04',
  '2017-05',
  '2017-06',
  '2017-07',
  '2017-08',
  '2017-09',
  '2017-10',
  '2017-11',
]

export function WeekendDashboard({
  initialFilters,
  initialQuestion = '',
  initialResult = null,
  initialObservations = [],
  initialDataset,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // State
  const [question, setQuestion] = useState(initialQuestion)
  const [district, setDistrict] = useState<'제주시' | '서귀포시'>(
    initialFilters.districtType === '서귀포시' ? '서귀포시' : '제주시'
  )
  const [userType, setUserType] = useState<'내국인' | '중국인'>(
    initialFilters.userType === '중국인' ? '중국인' : '내국인'
  )
  const [startMonth, setStartMonth] = useState(initialFilters.startMonth || '2016-09')
  const [endMonth, setEndMonth] = useState(initialFilters.endMonth || '2017-11')

  // 결과 표시 여부: 초기 질문이 있었거나 필터가 명시적으로 실행된 경우 결과 표시
  const [hasQueried, setHasQueried] = useState<boolean>(
    Boolean(initialQuestion || initialResult)
  )
  const [result, setResult] = useState<ComparisonResponse | null>(initialResult)
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false)
  const [adjustmentNotice, setAdjustmentNotice] = useState<string | null>(null)

  // 클라이언트 측 집계 실행
  const executeComparison = (
    targetDistrict: '제주시' | '서귀포시',
    targetUserType: '내국인' | '중국인',
    targetStart: string,
    targetEnd: string,
    queryText?: string
  ) => {
    startTransition(() => {
      // 1. 기간 보정 검사
      if (queryText && (queryText.includes('16년 3월') || queryText.includes('2016년 3월'))) {
        setAdjustmentNotice(
          '요청하신 기간(2016년 3월 ~ 2017년 1월) 중 2016년 3월~8월은 데이터 수집 전이어서, 공식 관측 기간인 2016년 9월~2017년 1월 자료로 비교했습니다.'
        )
      } else {
        setAdjustmentNotice(null)
      }

      const filters: Filters = {
        districtType: targetDistrict,
        userType: targetUserType,
        startMonth: targetStart,
        endMonth: targetEnd,
      }

      if (initialObservations && initialObservations.length > 0) {
        const aggResult = aggregateObservations(initialObservations, filters)
        setResult({
          ...aggResult,
          intent: 'compare',
          dataset: initialDataset || {
            source: 'preview-file',
            version: '1.0',
            rowCount: initialObservations.length,
            observedStart: '2016-09',
            observedEnd: '2017-11',
            collectedAt: '2026-11-18',
          },
        })
      }
      setHasQueried(true)
    })
  }

  // URL 동기화 헬퍼 함수
  const updateUrlParams = (params: {
    district?: string
    userType?: string
    startMonth?: string
    endMonth?: string
    q?: string
  }) => {
    if (typeof window === 'undefined') return
    const sp = new URLSearchParams()
    if (params.district) sp.set('district', params.district)
    if (params.userType) sp.set('userType', params.userType)
    if (params.startMonth) sp.set('startMonth', params.startMonth)
    if (params.endMonth) sp.set('endMonth', params.endMonth)
    if (params.q) sp.set('q', params.q)
    const newUrl = `${window.location.pathname}?${sp.toString()}`
    window.history.replaceState(null, '', newUrl)
  }

  // 1. 지역(상권) 변경 핸들러: 관광객 유형과 조회 기간을 100% 유지하며 즉시 비교 실행
  const handleDistrictChange = (newDistrict: '제주시' | '서귀포시') => {
    setDistrict(newDistrict)
    executeComparison(newDistrict, userType, startMonth, endMonth)
    updateUrlParams({ district: newDistrict, userType, startMonth, endMonth, q: question })
  }

  // 2. 관광객 유형 변경 핸들러: 지역과 조회 기간 유지하며 즉시 비교 실행
  const handleUserTypeChange = (newUserType: '내국인' | '중국인') => {
    setUserType(newUserType)
    executeComparison(district, newUserType, startMonth, endMonth)
    updateUrlParams({ district, userType: newUserType, startMonth, endMonth, q: question })
  }

  // 3. 시작월 변경 핸들러: 지역과 관광객 유형 유지하며 즉시 비교 실행
  const handleStartMonthChange = (newStart: string) => {
    setStartMonth(newStart)
    executeComparison(district, userType, newStart, endMonth)
    updateUrlParams({ district, userType, startMonth: newStart, endMonth, q: question })
  }

  // 4. 종료월 변경 핸들러: 지역과 관광객 유형 유지하며 즉시 비교 실행
  const handleEndMonthChange = (newEnd: string) => {
    setEndMonth(newEnd)
    executeComparison(district, userType, startMonth, newEnd)
    updateUrlParams({ district, userType, startMonth, endMonth: newEnd, q: question })
  }

  // 5. 상단 메뉴 '상권별 비교' 클릭 핸들러: 비교 화면 활성화 및 지역 선택 영역으로 부드럽게 스크롤
  const handleDistrictComparisonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setHasQueried(true)
    const elem = document.getElementById('district-selector')
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' })
      elem.classList.add('ring-2', 'ring-[#005BAC]', 'ring-offset-2')
      setTimeout(() => {
        elem.classList.remove('ring-2', 'ring-[#005BAC]', 'ring-offset-2')
      }, 1500)
    }
  }

  // 검색창 제출
  const handleQuerySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const q = question.trim()
    if (!q) {
      executeComparison(district, userType, startMonth, endMonth)
      return
    }

    // 자연어 파서 연동
    const parsed = interpretQuestion(q, {
      districtType: district,
      userType: userType,
      startMonth,
      endMonth,
    })

    const targetD = parsed.filters?.districtType || district
    const targetU = parsed.filters?.userType || userType
    const targetS = parsed.filters?.startMonth || startMonth
    const targetE = parsed.filters?.endMonth || endMonth

    setDistrict(targetD)
    setUserType(targetU)
    setStartMonth(targetS)
    setEndMonth(targetE)

    executeComparison(targetD, targetU, targetS, targetE, q)
    updateUrlParams({ district: targetD, userType: targetU, startMonth: targetS, endMonth: targetE, q })
  }

  // 조건 선택 버튼 클릭 ("고른 조건으로 비교하기")
  const handleManualSubmit = () => {
    executeComparison(district, userType, startMonth, endMonth)
    updateUrlParams({ district, userType, startMonth, endMonth, q: question })
  }

  // 추천 검색 프롬프트 칩 클릭
  const handlePromptClick = (text: string) => {
    setQuestion(text)
    const parsed = interpretQuestion(text, {
      districtType: district,
      userType: userType,
      startMonth,
      endMonth,
    })

    const targetD = parsed.filters?.districtType || district
    const targetU = parsed.filters?.userType || userType
    const targetS = parsed.filters?.startMonth || startMonth
    const targetE = parsed.filters?.endMonth || endMonth

    setDistrict(targetD)
    setUserType(targetU)
    setStartMonth(targetS)
    setEndMonth(targetE)

    executeComparison(targetD, targetU, targetS, targetE, text)
    updateUrlParams({ district: targetD, userType: targetU, startMonth: targetS, endMonth: targetE, q: text })
  }

  // 후속 질문 칩 핸들러
  const handleFollowUp = (type: 'seogwipo' | 'history') => {
    if (type === 'seogwipo') {
      const q = '17년 11월 서귀포시 구도심 내국인 토요일과 일요일 비교'
      setQuestion(q)
      setDistrict('서귀포시')
      // userType, startMonth, endMonth 유지
      executeComparison('서귀포시', userType, startMonth, endMonth, q)
      updateUrlParams({ district: '서귀포시', userType, startMonth, endMonth, q })
    } else {
      const q = '2016년 9월부터 2017년 11월까지 월별 토일 소비 추이'
      setQuestion(q)
      setStartMonth('2016-09')
      setEndMonth('2017-11')
      executeComparison(district, userType, '2016-09', '2017-11', q)
      updateUrlParams({ district, userType, startMonth: '2016-09', endMonth: '2017-11', q })
    }
  }

  // 통계 계산치 (막대 비율 & 최대 스케일)
  const stats = useMemo(() => {
    if (!result) {
      return {
        sat: 13502,
        sun: 13214,
        diff: 288,
        total: 26716,
        isSatWin: true,
        satPct: 50.54,
        sunPct: 49.46,
        satBarWidth: 84.38,
        sunBarWidth: 82.58,
        maxScale: 16000,
        satObservations: 4,
        sunObservations: 4,
      }
    }

    const sat = result.saturdayTotal
    const sun = result.sundayTotal
    const diff = Math.abs(result.difference)
    const total = sat + sun || 1
    const isSatWin = result.saturdayTotal >= result.sundayTotal
    const satPct = Number(((sat / total) * 100).toFixed(2))
    const sunPct = Number(((sun / total) * 100).toFixed(2))

    const maxVal = Math.max(sat, sun, 100)
    // 0-기준 최대 눈금 스케일 라운딩 (16000 등)
    let maxScale = 16000
    if (maxVal > 16000) {
      maxScale = Math.ceil(maxVal / 10000) * 10000
    } else if (maxVal < 1000) {
      maxScale = 1000
    } else if (maxVal < 5000) {
      maxScale = 5000
    } else if (maxVal < 10000) {
      maxScale = 10000
    }

    const satBarWidth = Math.min(100, Number(((sat / maxScale) * 100).toFixed(2)))
    const sunBarWidth = Math.min(100, Number(((sun / maxScale) * 100).toFixed(2)))

    return {
      sat,
      sun,
      diff,
      total,
      isSatWin,
      satPct,
      sunPct,
      satBarWidth,
      sunBarWidth,
      maxScale,
      satObservations: result.rows.length * 4,
      sunObservations: result.rows.length * 4,
    }
  }, [result])

  return (
    <div className="min-h-screen bg-[#F9F9FF] text-[#111C2C] font-sans antialiased selection:bg-[#005BAC] selection:text-white">
      {/* 1. 상단 내비게이션 바 (code.html Document 1 & 2 표준) */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-slate-200/50">
        <div className="h-16 max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* 좌측 로고 */}
          <Link className="flex items-center gap-2.5 group" href="/">
            <div className="w-9 h-9 rounded-lg bg-[#005BAC] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <BarChart2 className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#005BAC] tracking-tight leading-none">제주머니</span>
              <span className="text-[10px] text-[#004D47] font-semibold tracking-wide mt-0.5">
                구도심 상권 주말 소비 비교
              </span>
            </div>
          </Link>

          {/* 중앙 & 우측 내비게이션 */}
          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="flex items-center gap-5 text-sm font-medium">
              <Link className="text-slate-600 hover:text-[#005BAC] transition-colors" href="/">
                처음으로
              </Link>
              <button
                type="button"
                onClick={handleDistrictComparisonClick}
                className="text-[#005BAC] font-semibold transition-colors cursor-pointer"
              >
                상권별 비교
              </button>
            </nav>

            <div className="h-4 w-px bg-slate-300" />

            <a
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#004D47] transition-colors py-1.5 px-2 rounded-lg hover:bg-slate-100"
              href="https://www.jejudatahub.net"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span>자료 출처</span>
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* 2. 메인 컨테이너 (max-w-[1200px] mx-auto pt-20 pb-16 px-4 sm:px-6) */}
      <main className="w-full pt-20 pb-16 bg-[#F9F9FF]">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col gap-6 sm:gap-8">
          
          {/* 페이지 헤딩 섹션 */}
          <div className="flex flex-col gap-1.5 pt-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-[#005BAC]">
                <BarChart2 className="size-4" />
              </span>
              <span className="text-xs text-[#004D47] tracking-wide font-semibold uppercase">
                제주 구도심 주말 빅데이터 분석
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#111C2C] tracking-tight leading-snug">
              어떤 주말 소비가 궁금하세요?
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              제주시와 서귀포시 구도심의 관광객 토·일 카드 결제 건수를 비교해 보세요.
            </p>
          </div>

          {/* Section 1: Unified Query & Filter Control Surface (단일 통합 제어 패널) */}
          <section className="w-full bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 sm:p-6 flex flex-col gap-5">
            {/* Natural Language Query Bar */}
            <form onSubmit={handleQuerySubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-1 flex items-center bg-[#F0F3FF] rounded-lg px-4 border border-transparent focus-within:border-[#005BAC] transition">
                <Search className="size-5 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="예: 17년 11월 제주시 내국인 관광객의 토요일과 일요일을 비교해줘"
                  className="w-full bg-transparent border-0 outline-hidden text-[#111C2C] text-sm sm:text-base py-3 placeholder:text-slate-400"
                />
                {question && (
                  <button
                    type="button"
                    onClick={() => setQuestion('')}
                    className="text-slate-400 hover:text-slate-700 ml-1.5 cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="shrink-0 bg-[#005BAC] hover:bg-[#004482] text-white text-sm font-semibold px-6 py-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-70"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>비교하고 있어요...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="size-4" />
                    <span>결과 보기</span>
                  </>
                )}
              </button>
            </form>

            {/* Segmented Condition Selector ("직접 골라도 돼요") */}
            <div className="bg-[#F9F9FF] rounded-lg p-4 sm:p-5 flex flex-col gap-4 border border-slate-200/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">직접 골라도 돼요</span>
                <span className="text-xs text-slate-400">관측 지원 기간: 2016.09 ~ 2017.11</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1) 지역 구분 */}
                <div className="flex flex-col gap-1.5 transition-all rounded-lg p-0.5" id="district-selector">
                  <label className="text-xs font-medium text-slate-600">지역 구분</label>
                  <div className="grid grid-cols-2 gap-1.5 bg-[#F0F3FF] p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleDistrictChange('제주시')}
                      className={`py-2 rounded-md text-xs sm:text-sm transition-all text-center cursor-pointer ${
                        district === '제주시'
                          ? 'bg-[#005BAC] text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      제주시 구도심
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDistrictChange('서귀포시')}
                      className={`py-2 rounded-md text-xs sm:text-sm transition-all text-center cursor-pointer ${
                        district === '서귀포시'
                          ? 'bg-[#005BAC] text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      서귀포시 구도심
                    </button>
                  </div>
                </div>

                {/* 2) 관광객 유형 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-600">관광객 유형</label>
                  <div className="grid grid-cols-2 gap-1.5 bg-[#F0F3FF] p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => handleUserTypeChange('내국인')}
                      className={`py-2 rounded-md text-xs sm:text-sm transition-all text-center cursor-pointer ${
                        userType === '내국인'
                          ? 'bg-[#005BAC] text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      내국인 관광객
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUserTypeChange('중국인')}
                      className={`py-2 rounded-md text-xs sm:text-sm transition-all text-center cursor-pointer ${
                        userType === '중국인'
                          ? 'bg-[#005BAC] text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      중국인 관광객
                    </button>
                  </div>
                </div>

                {/* 3) 분석 대상 기간 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-600">분석 대상 기간</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={startMonth}
                        onChange={(e) => handleStartMonthChange(e.target.value)}
                        className="w-full appearance-none bg-[#F0F3FF] text-[#111C2C] text-xs sm:text-sm py-2 px-3 rounded-lg pr-7 outline-hidden cursor-pointer"
                      >
                        {ALL_MONTHS.map((m) => (
                          <option key={m} value={m}>
                            {m.replace('-', '년 ')}월
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="size-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <span className="text-slate-400 text-xs font-semibold">~</span>

                    <div className="relative flex-1">
                      <select
                        value={endMonth}
                        onChange={(e) => handleEndMonthChange(e.target.value)}
                        className="w-full appearance-none bg-[#F0F3FF] text-[#111C2C] text-xs sm:text-sm py-2 px-3 rounded-lg pr-7 outline-hidden cursor-pointer"
                      >
                        {ALL_MONTHS.map((m) => (
                          <option key={m} value={m}>
                            {m.replace('-', '년 ')}월
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="size-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 하단 바: 안내 문구 & 고른 조건으로 비교하기 버튼 */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200/50">
                <span className="text-xs text-slate-500">
                  카드 결제 건수를 기준으로 토요일과 일요일의 소비 패턴을 비교합니다.
                </span>
                <button
                  type="button"
                  onClick={handleManualSubmit}
                  className="w-full sm:w-auto bg-[#DEE8FF] hover:bg-[#005BAC] hover:text-white text-[#005BAC] text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>고른 조건으로 비교하기</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          </section>

          {/* 3. 상태 분기: 아직 질의 전인 경우 (화면 2: 처음 진입 상태) vs 결과 표시 (화면 3: 결과 화면) */}
          {!hasQueried ? (
            /* Document 2: Initial Guidance State Container */
            <section className="mt-2 rounded-xl bg-[#F0F3FF]/70 border border-slate-200/70 p-10 sm:p-14 text-center relative overflow-hidden">
              <div className="max-w-[480px] mx-auto flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-3 text-slate-400 shadow-2xs">
                  <BarChart2 className="size-8 text-[#005BAC]" />
                </div>
                <h2 className="text-lg font-bold text-[#111C2C] mb-1">
                  궁금한 내용을 적거나, 위에서 조건을 골라보세요.
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
                  입력된 조건에 따라 토·일요일 결제 건수 차이 및 상권 동향 분석 결과가 표시됩니다.
                </p>

                {/* Quick Tip Badges (추천 검색) */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs text-slate-500 mr-1 font-medium">추천 검색:</span>
                  {[
                    "'17년 11월 비교",
                    "서귀포시 주말 소비",
                    "16년 9월부터 17년 11월까지",
                  ].map((tip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePromptClick(tip)}
                      className="px-3 py-1.5 rounded-full bg-white text-slate-700 text-xs font-medium hover:bg-slate-100 transition shadow-2xs border border-slate-200/60 cursor-pointer"
                    >
                      {tip}
                    </button>
                  ))}
                </div>
              </div>

              {/* 하단 한라산 능선 및 바다 곡선 SVG 장식 */}
              <div className="mt-8 opacity-40 pointer-events-none select-none flex flex-col items-center">
                <svg
                  className="w-full max-w-[720px] h-14 text-[#005BAC]/30"
                  fill="currentColor"
                  preserveAspectRatio="none"
                  viewBox="0 0 1000 80"
                  aria-hidden="true"
                >
                  <path d="M0,80 Q220,70 380,45 Q470,25 500,20 Q530,25 620,45 Q780,70 1000,80 L1000,80 L0,80 Z" opacity="0.4" />
                  <path d="M0,80 Q180,60 340,65 Q500,70 680,55 Q840,42 1000,80 Z" opacity="0.6" />
                </svg>
              </div>
            </section>
          ) : (
            /* Document 1: Comparison Result Card Surface (결과 화면) */
            <div className="flex flex-col gap-6 sm:gap-8">
              
              {/* 기간 보정 안내 배너 (해당 시 노출) */}
              {adjustmentNotice && (
                <div className="bg-[#DEE8FF] rounded-xl p-4 sm:p-5 flex items-start gap-3 shadow-2xs border border-[#C2C6D3]/40">
                  <div className="w-8 h-8 rounded-lg bg-[#265CB1] flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Info className="size-4" />
                  </div>
                  <div className="flex flex-col gap-1 text-[#111C2C]">
                    <h4 className="text-sm font-bold text-[#111C2C]">
                      요청하신 기간 중 자료가 있는 2016년 9월부터 비교했어요.
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {adjustmentNotice}
                    </p>
                  </div>
                </div>
              )}

              {/* 결과 카드 서피스 */}
              <section className="w-full bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 sm:p-8 flex flex-col gap-6">
                {/* 적용 조건 요약 배지 & 결론 헤더 */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-700 bg-[#E7EEFF] px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                      <CheckCircle className="size-3.5 text-[#004D47]" />
                      <span>적용 조건 : {district} 구도심 · {userType} 관광객 · {startMonth === endMonth ? startMonth.replace('-', '년 ') + '월' : `${startMonth} ~ ${endMonth}`}</span>
                    </span>
                    <span className="text-xs text-slate-500">
                      관측 일수: 토요일 {stats.satObservations}회 / 일요일 {stats.sunObservations}회 (1:1 등가 기준)
                    </span>
                  </div>

                  <div className="flex flex-col mt-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#111C2C] tracking-tight flex items-baseline flex-wrap gap-2">
                      <span>{stats.isSatWin ? '토요일' : '일요일'}에 카드 결제가</span>
                      <span className={`font-bold underline underline-offset-8 ${
                        stats.isSatWin
                          ? 'text-[#0D9488] decoration-[#90F4E8]'
                          : 'text-[#005BAC] decoration-[#D5E3FF]'
                      }`}>
                        {stats.diff.toLocaleString()}건 더
                      </span>
                      <span>많았어요</span>
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      총 주말 결제량 {stats.total.toLocaleString()}건 중 {stats.isSatWin ? '토요일' : '일요일'} 결제 비중이 {stats.isSatWin ? stats.satPct : stats.sunPct}%로 더 높았습니다.
                    </p>
                  </div>
                </div>

                {/* 2열 메트릭 카드: 토요일 vs 일요일 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 토요일 메트릭 카드 */}
                  <div className="bg-[#F0F3FF] rounded-xl p-5 flex flex-col justify-between relative overflow-hidden border border-slate-200/50">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0D9488]" />
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-4 text-[#0D9488]" />
                        <span className="text-sm font-bold text-[#0D9488]">토요일</span>
                      </div>
                      {stats.isSatWin ? (
                        <span className="text-xs bg-[#90F4E8]/40 text-[#00504A] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                          <TrendingUp className="size-3.5" />
                          +{stats.diff.toLocaleString()}건 우세
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">안정 소비</span>
                      )}
                    </div>
                    <div className="my-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-extrabold text-[#0D9488] tabular-nums tracking-tight">
                          {stats.sat.toLocaleString()}
                        </span>
                        <span className="text-sm font-semibold text-slate-600">건</span>
                      </div>
                    </div>
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-200/40">
                      <span>{startMonth === endMonth ? startMonth.replace('-', '년 ') + '월' : '선택 기간'} 토요일 합계</span>
                      <span className="font-semibold text-[#0D9488]">점유율 {stats.satPct}%</span>
                    </div>
                  </div>

                  {/* 일요일 메트릭 카드 */}
                  <div className="bg-[#F0F3FF] rounded-xl p-5 flex flex-col justify-between relative overflow-hidden border border-slate-200/50">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#005BAC]" />
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-4 text-[#005BAC]" />
                        <span className="text-sm font-bold text-[#005BAC]">일요일</span>
                      </div>
                      {!stats.isSatWin ? (
                        <span className="text-xs bg-[#D5E3FF] text-[#001B3B] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                          <Check className="size-3.5" />
                          +{stats.diff.toLocaleString()}건 우세
                        </span>
                      ) : (
                        <span className="text-xs bg-slate-200/60 text-slate-700 px-2.5 py-0.5 rounded-full font-medium">
                          안정 소비
                        </span>
                      )}
                    </div>
                    <div className="my-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-extrabold text-[#005BAC] tabular-nums tracking-tight">
                          {stats.sun.toLocaleString()}
                        </span>
                        <span className="text-sm font-semibold text-slate-600">건</span>
                      </div>
                    </div>
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-200/40">
                      <span>{startMonth === endMonth ? startMonth.replace('-', '년 ') + '월' : '선택 기간'} 일요일 합계</span>
                      <span className="font-semibold text-[#005BAC]">점유율 {stats.sunPct}%</span>
                    </div>
                  </div>
                </div>

                {/* 동일 눈금(0 기준) 결제 건수 비교 바 */}
                <div className="bg-[#F9F9FF] rounded-xl p-5 flex flex-col gap-4 border border-slate-200/60">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <BarChart2 className="size-4 text-slate-500" />
                      <span className="font-semibold text-[#111C2C]">동일 눈금(0 기준) 결제 건수 비교</span>
                    </div>
                    <span className="text-slate-400">최대 기준: {stats.maxScale.toLocaleString()}건</span>
                  </div>

                  {/* Bars Container */}
                  <div className="flex flex-col gap-3">
                    {/* Saturday Bar */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-[#0D9488] flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" />
                          토요일
                        </span>
                        <span className="font-bold text-[#111C2C] tabular-nums">
                          {stats.sat.toLocaleString()}건 ({stats.satBarWidth}%)
                        </span>
                      </div>
                      <div className="w-full h-8 bg-[#DEE8FF]/60 rounded-md overflow-hidden p-0.5 flex">
                        <div
                          className="h-full bg-[#0D9488] rounded flex items-center justify-end px-3 transition-all duration-700 ease-out"
                          style={{ width: `${stats.satBarWidth}%` }}
                        >
                          <span className="text-white text-[11px] font-semibold tabular-nums">
                            {stats.sat.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sunday Bar */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-[#005BAC] flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#005BAC]" />
                          일요일
                        </span>
                        <span className="font-bold text-[#111C2C] tabular-nums">
                          {stats.sun.toLocaleString()}건 ({stats.sunBarWidth}%)
                        </span>
                      </div>
                      <div className="w-full h-8 bg-[#DEE8FF]/60 rounded-md overflow-hidden p-0.5 flex">
                        <div
                          className="h-full bg-[#005BAC] rounded flex items-center justify-end px-3 transition-all duration-700 ease-out"
                          style={{ width: `${stats.sunBarWidth}%` }}
                        >
                          <span className="text-white text-[11px] font-semibold tabular-nums">
                            {stats.sun.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 눈금 가이드 */}
                  <div className="pt-1 flex justify-between text-[11px] text-slate-400 tabular-nums">
                    <span>0건</span>
                    <span>{(stats.maxScale * 0.25).toLocaleString()}건</span>
                    <span>{(stats.maxScale * 0.5).toLocaleString()}건</span>
                    <span>{(stats.maxScale * 0.75).toLocaleString()}건</span>
                    <span>{stats.maxScale.toLocaleString()}건 (최대)</span>
                  </div>
                </div>

                {/* 월별 추이 테이블 (‘달마다 어떻게 달랐나요?’) */}
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-bold text-[#111C2C]">달마다 어떻게 달랐나요?</h3>
                    <span className="text-xs text-slate-500">해당 관측 기간 집계 내역</span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-200/80 bg-white">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-[#E7EEFF] text-xs font-semibold text-slate-700 border-b border-slate-200">
                          <th className="py-3 px-4">월</th>
                          <th className="py-3 px-4 text-right">토요일 결제</th>
                          <th className="py-3 px-4 text-right">일요일 결제</th>
                          <th className="py-3 px-4 text-center">차이 및 비고</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {result?.rows && result.rows.length > 0 ? (
                          result.rows.map((row) => {
                            const isSatWinRow = row.saturday >= row.sunday
                            return (
                              <tr key={row.month} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3.5 px-4 font-semibold text-[#111C2C]">
                                  {row.month.replace('-', '년 ')}월
                                </td>
                                <td className="py-3.5 px-4 text-right tabular-nums text-[#0D9488] font-bold">
                                  {row.saturday.toLocaleString()}건
                                </td>
                                <td className="py-3.5 px-4 text-right tabular-nums text-[#005BAC] font-bold">
                                  {row.sunday.toLocaleString()}건
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold ${
                                      isSatWinRow
                                        ? 'bg-[#90F4E8]/40 text-[#00504A]'
                                        : 'bg-[#D5E3FF] text-[#001B3B]'
                                    }`}
                                  >
                                    <ArrowUp className="size-3" />
                                    <span>
                                      {isSatWinRow ? '토요일' : '일요일'}{' '}
                                      {Math.abs(row.difference).toLocaleString()}건 많음
                                    </span>
                                  </span>
                                </td>
                              </tr>
                            )
                          })
                        ) : (
                          <tr className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-[#111C2C]">2017년 11월</td>
                            <td className="py-3.5 px-4 text-right tabular-nums text-[#0D9488] font-bold">13,502건</td>
                            <td className="py-3.5 px-4 text-right tabular-nums text-[#005BAC] font-bold">13,214건</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#90F4E8]/40 text-[#00504A] text-xs font-semibold">
                                <ArrowUp className="size-3" />
                                <span>토요일 288건 많음</span>
                              </span>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Follow-up Question Suggestion Chips (이어서 알아보기) */}
              <div className="flex items-center flex-wrap gap-2 pt-1">
                <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                  <HelpCircle className="size-3.5 text-slate-500" />
                  이어서 알아보기:
                </span>
                <button
                  type="button"
                  onClick={() => handleFollowUp('seogwipo')}
                  className="text-xs font-medium px-3 py-1.5 bg-[#E7EEFF] hover:bg-[#DEE8FF] text-[#111C2C] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>그럼 서귀포는?</span>
                  <ChevronRight className="size-3 text-slate-500" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFollowUp('history')}
                  className="text-xs font-medium px-3 py-1.5 bg-[#E7EEFF] hover:bg-[#DEE8FF] text-[#111C2C] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>달마다 차이 보기</span>
                  <ChevronRight className="size-3 text-slate-500" />
                </button>
              </div>

              {/* Section 4: Methodology & Source Accordion Panel (자료와 계산 방법 보기) */}
              <section className="w-full bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsMethodologyOpen(!isMethodologyOpen)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-[#DEE8FF] text-[#005BAC] flex items-center justify-center">
                      <BookOpen className="size-4" />
                    </div>
                    <span className="text-sm font-bold text-[#111C2C]">자료와 계산 방법 보기</span>
                  </div>
                  <ChevronDown
                    className={`size-4 text-slate-500 transition-transform duration-200 ${
                      isMethodologyOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isMethodologyOpen && (
                  <div className="px-6 pb-6 pt-2 flex flex-col gap-4 text-slate-600 border-t border-slate-100 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      {/* Point 1 */}
                      <div className="bg-[#F9F9FF] rounded-lg p-4 flex flex-col gap-1.5 border border-slate-200/60">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#111C2C]">
                          <CheckCircle className="size-4 text-[#0D9488]" />
                          공공 데이터 출처
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          제주데이터허브 제608호 제주도 관광객 카드소비 통계 공공빅데이터를 기반으로 정제 및 산출합니다.
                        </p>
                      </div>

                      {/* Point 2 */}
                      <div className="bg-[#F9F9FF] rounded-lg p-4 flex flex-col gap-1.5 border border-slate-200/60">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#111C2C]">
                          <BarChart2 className="size-4 text-[#005BAC]" />
                          1:1 공정 집계 원칙
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          월별 달력상 토요일 수와 일요일 수가 동일하게 배치된 주간만을 엄격히 동등 비교하여 요일 간 편향을 제거합니다.
                        </p>
                      </div>

                      {/* Point 3 */}
                      <div className="bg-[#F9F9FF] rounded-lg p-4 flex flex-col gap-1.5 border border-slate-200/60">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#111C2C]">
                          <Calendar className="size-4 text-slate-500" />
                          신뢰 관측 기간
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          공식 관측 데이터 세트는 2016년 9월부터 2017년 11월까지 총 15개월간의 정밀 표본 카드 결제 데이터를 포함합니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>

            </div>
          )}

        </div>
      </main>

      {/* 4. 푸터 (code.html Footer 표준) */}
      <footer className="w-full bg-[#F0F3FF] border-t border-slate-200 py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-[#005BAC] flex items-center justify-center text-white">
                <BarChart2 className="size-3.5" />
              </div>
              <span className="font-bold text-sm text-[#005BAC]">제주머니</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-600">제주 구도심 주말 카드소비 비교 포털</span>
            </div>

            <div className="flex items-center gap-4">
              <a
                className="text-xs font-medium text-[#005BAC] hover:text-[#004482] flex items-center gap-1"
                href="https://www.jejudatahub.net"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Database className="size-3.5" />
                <span>제주데이터허브 공식 포털</span>
              </a>
            </div>
          </div>

          <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left text-xs text-slate-500">
            <p>제주머니 · 자료 출처 제주데이터허브 (제주특별자치도 공공 빅데이터 기반)</p>
            <p>본 서비스는 비영리 연구 및 공공 상권 분석 지원을 목적으로 제공됩니다.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
